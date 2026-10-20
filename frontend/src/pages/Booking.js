import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { movieAPI, showAPI, bookingAPI } from '../services/api';
import QRCodeTicket from '../components/QRCodeTicket';

function Booking() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [selectedShow, setSelectedShow] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Seat Locking Mechanism States
    const [isLocked, setIsLocked] = useState(false);
    const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
    const [isLocking, setIsLocking] = useState(false);
    const timerRef = useRef(null);

    // Booking Confirmation Modal & QR Code State
    const [confirmedBooking, setConfirmedBooking] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('userId');

    // Seat Rows Layout: 5 rows (A to E), 8 seats each
    // Row A: VIP, Row B-C: Premium, Row D-E: Standard
    const seatLayout = [
        { row: 'A', type: 'VIP', priceMultiplier: 1.5, seats: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'] },
        { row: 'B', type: 'Premium', priceMultiplier: 1.25, seats: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'] },
        { row: 'C', type: 'Premium', priceMultiplier: 1.25, seats: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'] },
        { row: 'D', type: 'Standard', priceMultiplier: 1.0, seats: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'] },
        { row: 'E', type: 'Standard', priceMultiplier: 1.0, seats: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'] }
    ];

    // Fetch movie details and associated shows
    const loadBookingData = useCallback(async () => {
        try {
            setLoading(true);
            const [movieRes, showsRes] = await Promise.all([
                movieAPI.getById(id),
                showAPI.getByMovie(id)
            ]);

            setMovie(movieRes.data);
            setShows(showsRes.data);

            if (showsRes.data && showsRes.data.length > 0) {
                // If already selected, retain or refresh
                setSelectedShow(prev => prev ? (showsRes.data.find(s => s._id === prev._id) || showsRes.data[0]) : showsRes.data[0]);
            }
        } catch (err) {
            console.error("Error loading booking details:", err);
            setErrorMsg("Unable to load movie or showtimes. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadBookingData();
    }, [loadBookingData]);

    // Handle seat lock expiration
    const handleLockExpired = useCallback(async () => {
        setIsLocked(false);
        setLockTimeRemaining(0);
        if (timerRef.current) clearInterval(timerRef.current);

        setErrorMsg("⚠️ Your 5-minute seat reservation has expired. The seats have been released.");

        if (selectedShow && selectedSeats.length > 0) {
            try {
                await showAPI.unlockSeats(selectedShow._id, selectedSeats);
            } catch (e) {
                console.error("Unlock error on expiry:", e);
            }
        }
        setSelectedSeats([]);
        // Refresh show data to reflect released seats
        loadBookingData();
    }, [selectedShow, selectedSeats, loadBookingData]);

    // Real-time Countdown Timer Effect
    useEffect(() => {
        if (isLocked && lockTimeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setLockTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleLockExpired();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isLocked, lockTimeRemaining, handleLockExpired]);

    // Unlock on page unmount if locked but not booked
    useEffect(() => {
        return () => {
            if (selectedShow?._id && selectedSeats.length > 0 && !confirmedBooking) {
                showAPI.unlockSeats(selectedShow._id, selectedSeats).catch(() => {});
            }
        };
    }, [selectedShow, selectedSeats, confirmedBooking]);

    // Handle seat selection toggle
    const toggleSeat = (seatId) => {
        if (isLocked) {
            setErrorMsg("Seats are currently locked for checkout. Click 'Unlock / Change Seats' to pick different seats.");
            return;
        }

        const booked = selectedShow?.bookedSeats || [];
        if (booked.includes(seatId)) return;

        // Check if locked by someone else
        const now = new Date();
        const otherLocked = (selectedShow?.lockedSeats || [])
            .filter(l => new Date(l.expiresAt) > now && l.userId?.toString() !== currentUserId)
            .map(l => l.seatNumber);

        if (otherLocked.includes(seatId)) {
            setErrorMsg(`Seat ${seatId} is temporarily reserved by another viewer.`);
            return;
        }

        setErrorMsg('');
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    // Lock selected seats API handler
    const handleLockSeats = async () => {
        if (!token) {
            alert("Please log in to your account to lock seats & checkout!");
            navigate('/login');
            return;
        }

        if (selectedSeats.length === 0) {
            setErrorMsg("Please select at least one seat from the seating chart.");
            return;
        }

        try {
            setIsLocking(true);
            setErrorMsg('');

            const res = await showAPI.lockSeats(selectedShow._id, selectedSeats, 5);

            setIsLocked(true);
            setLockTimeRemaining(res.data.lockTimeoutSeconds || 300);
        } catch (err) {
            console.error("Lock seats error:", err);
            const msg = err.response?.data?.msg || "Could not reserve seats. Someone else may have just selected them.";
            setErrorMsg(msg);
            // Refresh to get updated locks
            loadBookingData();
        } finally {
            setIsLocking(false);
        }
    };

    // Unlock seats handler
    const handleUnlockSeats = async () => {
        try {
            if (selectedShow && selectedSeats.length > 0) {
                await showAPI.unlockSeats(selectedShow._id, selectedSeats);
            }
        } catch (err) {
            console.error("Unlock error:", err);
        } finally {
            setIsLocked(false);
            setLockTimeRemaining(0);
            if (timerRef.current) clearInterval(timerRef.current);
            loadBookingData();
        }
    };

    // Format timer (MM:SS)
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Dynamic pricing calculation
    const basePrice = selectedShow?.ticketPrice || 150;
    const calculateSeatPrice = (seatId) => {
        const rowChar = seatId.charAt(0);
        const rowObj = seatLayout.find(r => r.row === rowChar);
        const multiplier = rowObj ? rowObj.priceMultiplier : 1.0;
        return Math.round(basePrice * multiplier);
    };

    const subtotal = selectedSeats.reduce((sum, seat) => sum + calculateSeatPrice(seat), 0);
    const convenienceFee = selectedSeats.length > 0 ? 30 : 0;
    const grandTotal = subtotal + convenienceFee;

    // Handle ticket booking confirmation
    const handleConfirmBooking = async () => {
        if (!token) {
            alert("Please log in to your account to confirm this booking!");
            navigate('/login');
            return;
        }

        if (selectedSeats.length === 0) {
            alert("Please pick at least one seat from the seating chart!");
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMsg('');

            const bookingPayload = {
                movieId: movie._id,
                movieTitle: movie.title,
                theaterId: selectedShow?.theater?._id,
                theaterName: selectedShow?.theater?.name || 'IMovies Grand Screen',
                showId: selectedShow?._id,
                showTime: selectedShow?.showTime || '07:30 PM',
                showDate: selectedShow?.showDate || new Date(),
                seats: selectedSeats,
                totalAmount: grandTotal,
                paymentMethod: paymentMethod
            };

            const res = await bookingAPI.create(bookingPayload);

            // Stop lock timer
            if (timerRef.current) clearInterval(timerRef.current);
            setIsLocked(false);

            // Trigger QR Code Confirmation Modal
            setConfirmedBooking(res.data.booking);
            setShowSuccessModal(true);
        } catch (err) {
            console.error("Booking error:", err);
            const msg = err.response?.data?.msg || err.response?.data?.message || "Booking transaction failed. Please retry.";
            setErrorMsg(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading seating chart...</span>
                </div>
                <p className="mt-3 text-muted">Configuring theater and seat availability...</p>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-warning">Movie details not found.</div>
                <Link to="/" className="btn btn-danger">Return to Home</Link>
            </div>
        );
    }

    const occupiedSeats = selectedShow?.bookedSeats || [];
    const now = new Date();
    const otherLockedSeats = (selectedShow?.lockedSeats || [])
        .filter(l => new Date(l.expiresAt) > now && l.userId?.toString() !== currentUserId)
        .map(l => l.seatNumber);

    return (
        <div className="container py-4">
            {/* Movie & Theater Banner */}
            <div className="card shadow-sm border-0 mb-4 bg-dark text-white rounded-4 overflow-hidden">
                <div className="card-body p-4">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <span className="badge bg-danger mb-2">NOW BOOKING</span>
                            <h2 className="fw-bold mb-1 text-white">{movie.title}</h2>
                            <p className="text-secondary small mb-2">
                                {Array.isArray(movie.genre) ? movie.genre.join(' • ') : movie.genre} | {movie.language} | ⏱️ {movie.duration} mins | ⭐ {movie.rating}/10
                            </p>
                            {selectedShow?.theater && (
                                <div className="text-light small">
                                    📍 <strong>{selectedShow.theater.name}</strong> ({selectedShow.theater.city}) • Screen {selectedShow.screenNumber || 1}
                                </div>
                            )}
                        </div>
                        <div className="col-md-4 text-md-end mt-3 mt-md-0">
                            <Link to={`/movie/${movie._id}`} className="btn btn-outline-light btn-sm">
                                ← Movie Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications & Error Alerts */}
            {errorMsg && (
                <div className="alert alert-danger alert-dismissible fade show rounded-3 shadow-sm" role="alert">
                    <strong>Notice:</strong> {errorMsg}
                    <button type="button" className="btn-close" onClick={() => setErrorMsg('')}></button>
                </div>
            )}

            {/* Seat Locking Active Banner & Timer */}
            {isLocked && (
                <div 
                    className="alert alert-warning shadow-sm border-2 border-warning rounded-4 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2"
                    style={{ background: '#fffbeb', borderLeft: '6px solid #f59e0b' }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <span className="fs-3">🔒</span>
                        <div>
                            <h6 className="fw-bold text-dark mb-0">
                                Seats Reserved & Temporarily Locked for You!
                            </h6>
                            <small className="text-muted">
                                Reserved seats [{selectedSeats.join(', ')}]. Complete checkout before the countdown expires.
                            </small>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <div className="text-center bg-white px-3 py-1 rounded-3 border border-warning shadow-sm">
                            <span className="small text-muted d-block" style={{ fontSize: '0.7rem' }}>TIME LEFT</span>
                            <span className="fs-4 fw-bold text-danger font-monospace">
                                ⏱️ {formatTime(lockTimeRemaining)}
                            </span>
                        </div>
                        <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={handleUnlockSeats}
                        >
                            Unlock / Change
                        </button>
                    </div>
                </div>
            )}

            {/* Showtime Selection Pills */}
            {shows.length > 0 && (
                <div className="card shadow-sm border-0 mb-4 p-3 bg-light rounded-4">
                    <div className="d-flex align-items-center flex-wrap gap-2">
                        <span className="fw-bold me-2">🕒 Select Showtime:</span>
                        {shows.map(show => (
                            <button
                                key={show._id}
                                type="button"
                                className={`btn btn-sm px-3 py-2 fw-semibold rounded-pill ${selectedShow?._id === show._id ? 'btn-danger shadow-sm' : 'btn-outline-dark bg-white'}`}
                                onClick={() => {
                                    if (isLocked) {
                                        if (window.confirm("Changing showtime will release your currently locked seats. Continue?")) {
                                            handleUnlockSeats();
                                            setSelectedShow(show);
                                            setSelectedSeats([]);
                                        }
                                    } else {
                                        setSelectedShow(show);
                                        setSelectedSeats([]);
                                    }
                                }}
                            >
                                {show.theater?.name ? `${show.theater.name.split(' ')[0]} - ` : ''}{show.showTime} (₹{show.ticketPrice})
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="row g-4">
                {/* Seat Matrix Column */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 p-4 rounded-4 text-center">
                        {/* Cinema Screen Indicator */}
                        <div className="position-relative mb-4">
                            <div 
                                className="bg-secondary text-white py-2 rounded-pill shadow-sm fw-bold mx-auto letter-spacing-1"
                                style={{ maxWidth: '480px', background: 'linear-gradient(90deg, #111 0%, #444 50%, #111 100%)' }}
                            >
                                🎬 SCREEN THIS WAY 🎬
                            </div>
                            <div className="small text-muted mt-1">Dolby Atmos • Laser Projection</div>
                        </div>

                        {/* Interactive Seat Rows */}
                        <div className="d-flex flex-column gap-3 mb-4">
                            {seatLayout.map(rowObj => (
                                <div key={rowObj.row} className="d-flex align-items-center justify-content-center gap-2">
                                    <span className="fw-bold text-muted me-2" style={{ width: '24px' }}>
                                        {rowObj.row}
                                    </span>
                                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                                        {rowObj.seats.map(seatId => {
                                            const isOccupied = occupiedSeats.includes(seatId);
                                            const isOtherLocked = otherLockedSeats.includes(seatId);
                                            const isSelected = selectedSeats.includes(seatId);

                                            let btnClass = 'btn-outline-dark';
                                            let disabled = false;
                                            let title = `${seatId} (${rowObj.type} - ₹${calculateSeatPrice(seatId)})`;

                                            if (isOccupied) {
                                                btnClass = 'btn-secondary opacity-50';
                                                disabled = true;
                                                title = `${seatId} is already booked`;
                                            } else if (isOtherLocked) {
                                                btnClass = 'btn-warning opacity-75';
                                                disabled = true;
                                                title = `${seatId} is temporarily reserved by another viewer`;
                                            } else if (isSelected) {
                                                btnClass = isLocked ? 'btn-success shadow' : 'btn-danger shadow';
                                                title = `${seatId} selected`;
                                            }

                                            return (
                                                <button
                                                    key={seatId}
                                                    type="button"
                                                    className={`btn ${btnClass} fw-bold rounded-3 position-relative`}
                                                    style={{ width: '48px', height: '44px', fontSize: '0.85rem' }}
                                                    disabled={disabled}
                                                    onClick={() => toggleSeat(seatId)}
                                                    title={title}
                                                >
                                                    {isOccupied ? '✕' : isOtherLocked ? '🔒' : isSelected ? '✓' : seatId}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <span className="badge bg-light text-muted border small ms-2 d-none d-sm-inline" style={{ width: '70px' }}>
                                        {rowObj.type}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Visual Legend */}
                        <div className="d-flex justify-content-center flex-wrap gap-4 pt-3 border-top small text-muted">
                            <div className="d-flex align-items-center gap-1">
                                <span className="d-inline-block border border-dark rounded" style={{ width: '18px', height: '18px' }}></span>
                                Available
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <span className="d-inline-block bg-danger rounded" style={{ width: '18px', height: '18px' }}></span>
                                Selected
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <span className="d-inline-block bg-warning rounded" style={{ width: '18px', height: '18px' }}></span>
                                🔒 Held by Other
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <span className="d-inline-block bg-secondary opacity-50 rounded" style={{ width: '18px', height: '18px' }}></span>
                                ✕ Booked
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Summary & Checkout Column */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 rounded-4 p-4 sticky-top" style={{ top: '20px' }}>
                        <h5 className="fw-bold mb-3 border-bottom pb-2 text-dark">🎟️ Booking Summary</h5>

                        <div className="mb-3">
                            <div className="small text-muted">Movie:</div>
                            <div className="fw-bold fs-6 text-dark">{movie.title}</div>
                        </div>

                        <div className="row g-2 mb-3 small">
                            <div className="col-6">
                                <span className="text-muted">Cinema:</span>
                                <div className="fw-semibold text-dark">{selectedShow?.theater?.name || 'IMovies Grand'}</div>
                            </div>
                            <div className="col-6">
                                <span className="text-muted">Showtime:</span>
                                <div className="fw-semibold text-danger">{selectedShow?.showTime || '07:30 PM'}</div>
                            </div>
                        </div>

                        <hr className="my-2" />

                        {/* Selected Seats List */}
                        <div className="mb-3">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">Selected Seats ({selectedSeats.length}):</span>
                                <span className="fw-bold text-danger">
                                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                                </span>
                            </div>

                            {selectedSeats.length > 0 && (
                                <div className="bg-light p-2 rounded-3 small mb-2 border">
                                    {selectedSeats.map(seat => (
                                        <div key={seat} className="d-flex justify-content-between text-muted">
                                            <span>Seat {seat}</span>
                                            <span>₹{calculateSeatPrice(seat)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="d-flex justify-content-between text-muted small mb-1">
                                <span>Ticket Subtotal:</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="d-flex justify-content-between text-muted small mb-2">
                                <span>Convenience Fee & Taxes:</span>
                                <span>₹{convenienceFee}</span>
                            </div>
                            <div className="d-flex justify-content-between fs-5 fw-bold text-dark border-top pt-2">
                                <span>Grand Total:</span>
                                <span className="text-danger">₹{grandTotal}</span>
                            </div>
                        </div>

                        {/* Seat Locking State Indicator */}
                        {!isLocked && selectedSeats.length > 0 && (
                            <div className="mb-3">
                                <button
                                    type="button"
                                    className="btn btn-warning w-100 fw-bold text-dark shadow-sm d-flex align-items-center justify-content-center gap-2"
                                    onClick={handleLockSeats}
                                    disabled={isLocking}
                                >
                                    <span>🔒</span>
                                    <span>{isLocking ? 'Reserving Seats...' : 'Lock Seats for 5 Mins'}</span>
                                </button>
                                <small className="text-muted d-block text-center mt-1" style={{ fontSize: '0.72rem' }}>
                                    Prevents others from picking your seats during payment
                                </small>
                            </div>
                        )}

                        {/* Payment Method Selector */}
                        <div className="mb-3">
                            <label className="form-label small fw-semibold text-muted">Payment Gateway</label>
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className={`btn btn-sm w-100 ${paymentMethod === 'UPI' ? 'btn-dark' : 'btn-outline-secondary'}`}
                                    onClick={() => setPaymentMethod('UPI')}
                                >
                                    ⚡ UPI (GPay/Paytm)
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm w-100 ${paymentMethod === 'Card' ? 'btn-dark' : 'btn-outline-secondary'}`}
                                    onClick={() => setPaymentMethod('Card')}
                                >
                                    💳 Card
                                </button>
                            </div>
                        </div>

                        {/* Confirmation & Pay Button */}
                        <button
                            className="btn btn-success btn-lg w-100 fw-bold shadow-sm"
                            disabled={selectedSeats.length === 0 || isSubmitting}
                            onClick={handleConfirmBooking}
                        >
                            {isSubmitting ? 'Confirming Payment...' : `Confirm & Pay ₹${grandTotal}`}
                        </button>

                        <div className="text-center mt-3">
                            <small className="text-muted">🔒 100% Secure Checkout with Instant QR E-Ticket</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Confirmation Modal with Scannable QR Code */}
            {showSuccessModal && confirmedBooking && (
                <div 
                    className="modal show d-block" 
                    tabIndex="-1" 
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 1070, backdropFilter: 'blur(5px)' }}
                >
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
                        <div className="modal-content border-0 shadow-lg overflow-hidden rounded-4">
                            {/* Modal Header */}
                            <div className="modal-header bg-success text-white border-0 py-3 px-4">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="fs-3">🎉</span>
                                    <div>
                                        <h5 className="modal-title fw-bold text-white mb-0">Booking Confirmed!</h5>
                                        <small className="text-white opacity-75">Your official cinema pass is ready</small>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body: Scannable QR Code & E-Ticket */}
                            <div className="modal-body p-4 bg-light text-center">
                                <div className="bg-white p-4 rounded-4 shadow-sm border mx-auto">
                                    <span className="badge bg-danger px-3 py-1 mb-2">OFFICIAL E-TICKET</span>
                                    <h4 className="fw-bold text-dark mb-1">{confirmedBooking.movieTitle}</h4>
                                    <div className="small text-muted mb-3">
                                        📍 {confirmedBooking.theaterName} • 🕒 {confirmedBooking.showTime}
                                    </div>

                                    {/* High-Resolution QR Code */}
                                    <div className="my-3">
                                        <QRCodeTicket booking={confirmedBooking} size={180} showDetails={false} />
                                    </div>

                                    <div className="bg-light p-3 rounded-3 text-start small mb-3 border">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-muted">Ticket Ref:</span>
                                            <strong className="text-danger">{confirmedBooking.bookingReference}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-muted">Reserved Seats:</span>
                                            <strong className="text-dark">
                                                {confirmedBooking.seats ? confirmedBooking.seats.join(', ') : 'N/A'}
                                            </strong>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">Total Paid:</span>
                                            <strong className="text-success">₹{confirmedBooking.totalAmount}</strong>
                                        </div>
                                    </div>

                                    <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                                        📲 Scan this QR Code at the cinema entrance turnstiles for paperless fast-track entry.
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="modal-footer bg-white border-0 d-flex justify-content-between px-4 pb-4">
                                <button 
                                    className="btn btn-outline-dark fw-semibold"
                                    onClick={() => window.print()}
                                >
                                    🖨️ Print Ticket
                                </button>
                                <button 
                                    className="btn btn-danger fw-bold px-4"
                                    onClick={() => navigate('/profile')}
                                >
                                    View in Profile →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Booking;