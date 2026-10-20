import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import QRCodeTicket from '../components/QRCodeTicket';

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName') || 'User';
    const userEmail = localStorage.getItem('userEmail') || '';
    const userRole = localStorage.getItem('userRole') || 'user';

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await bookingAPI.getUserBookings();
            setBookings(res.data);
            setError('');
        } catch (err) {
            console.error("Error fetching bookings:", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError("Your session has expired. Please log in again.");
                localStorage.removeItem('token');
            } else {
                setError(err.response?.data?.msg || "Failed to load booking history.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        fetchBookings();
    }, [token]);

    const handleCancelBooking = async (bookingId, movieTitle) => {
        const confirmCancel = window.confirm(`Are you sure you want to cancel your reservation for "${movieTitle}"? A refund will be initiated.`);
        if (!confirmCancel) return;

        try {
            await bookingAPI.cancel(bookingId);
            setActionMsg({ type: 'success', text: `Reservation for "${movieTitle}" was successfully cancelled and refunded.` });
            fetchBookings(); // refresh list
        } catch (err) {
            console.error("Cancellation error:", err);
            setActionMsg({ type: 'danger', text: err.response?.data?.msg || "Cancellation failed." });
        }
    };

    if (!token) {
        return (
            <div className="container mt-5 text-center">
                <div className="card shadow-sm p-5 mx-auto border-0" style={{ maxWidth: '480px' }}>
                    <div className="display-4 text-danger mb-3">🔒</div>
                    <h3 className="fw-bold mb-2">Sign In Required</h3>
                    <p className="text-muted mb-4">
                        Please sign in to view your profile, seat reservations, and transaction history.
                    </p>
                    <button className="btn btn-danger btn-lg w-100 fw-bold" onClick={() => navigate('/login')}>
                        Log In Now
                    </button>
                    <Link to="/register" className="mt-3 text-muted text-decoration-none small">
                        Don't have an account? Sign up here
                    </Link>
                </div>
            </div>
        );
    }

    // Calculations for user metrics
    const confirmedBookings = bookings.filter(b => b.status !== 'Cancelled');
    const totalSpent = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalSeats = confirmedBookings.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);

    return (
        <div className="container py-4">
            {/* User Profile Header Card */}
            <div className="card shadow-sm mb-4 border-0 text-white rounded-3 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)' }}>
                <div className="card-body p-4">
                    <div className="row align-items-center">
                        <div className="col-md-7 mb-3 mb-md-0">
                            <div className="d-flex align-items-center">
                                <div 
                                    className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold fs-2 me-3 shadow"
                                    style={{ width: '68px', height: '68px' }}
                                >
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
                                        {userName}
                                        <span className={`badge ${userRole === 'admin' ? 'bg-warning text-dark' : 'bg-primary'} fs-6`}>
                                            {userRole === 'admin' ? 'Admin' : 'Member'}
                                        </span>
                                    </h3>
                                    <p className="text-light opacity-75 mb-0 small">
                                        📧 {userEmail || 'Active IMovies Account'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Badges */}
                        <div className="col-md-5">
                            <div className="d-flex justify-content-md-end gap-3 text-center">
                                <div className="bg-dark bg-opacity-50 px-3 py-2 rounded-3 border border-light border-opacity-25">
                                    <div className="fs-4 fw-bold text-danger">{confirmedBookings.length}</div>
                                    <div className="small text-light opacity-75">Active Bookings</div>
                                </div>
                                <div className="bg-dark bg-opacity-50 px-3 py-2 rounded-3 border border-light border-opacity-25">
                                    <div className="fs-4 fw-bold text-warning">{totalSeats}</div>
                                    <div className="small text-light opacity-75">Seats Reserved</div>
                                </div>
                                <div className="bg-dark bg-opacity-50 px-3 py-2 rounded-3 border border-light border-opacity-25">
                                    <div className="fs-4 fw-bold text-success">₹{totalSpent}</div>
                                    <div className="small text-light opacity-75">Total Paid</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {actionMsg.text && (
                <div className={`alert alert-${actionMsg.type} alert-dismissible fade show`} role="alert">
                    {actionMsg.text}
                    <button type="button" className="btn-close" onClick={() => setActionMsg({ type: '', text: '' })}></button>
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Section Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-0">🎟️ My Cinema Tickets & Reservations</h4>
                    <p className="text-muted small mb-0">Manage your movie passes and booking history</p>
                </div>
                <Link to="/" className="btn btn-outline-danger btn-sm fw-semibold">
                    + Book Another Movie
                </Link>
            </div>

            {/* Loading Spinner */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-3">Fetching your reservation documents...</p>
                </div>
            ) : bookings.length === 0 ? (
                /* Empty State */
                <div className="card shadow-sm border-0 text-center py-5 px-3 rounded-3">
                    <div className="card-body">
                        <div className="display-3 text-muted mb-3">🎬</div>
                        <h4 className="fw-bold">No Reservations Yet</h4>
                        <p className="text-muted mx-auto mb-4" style={{ maxWidth: '420px' }}>
                            You have no past or upcoming movie tickets. Browse the latest blockbusters and reserve your favorite seats now!
                        </p>
                        <Link to="/" className="btn btn-danger px-4 py-2 fw-bold">
                            Explore Current Movies
                        </Link>
                    </div>
                </div>
            ) : (
                /* Bookings List */
                <div className="row g-4">
                    {bookings.map((booking) => {
                        const isCancelled = booking.status === 'Cancelled';
                        const bookingDate = new Date(booking.createdAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                        const bookingTime = new Date(booking.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        return (
                            <div className="col-lg-6" key={booking._id}>
                                <div className={`card h-100 shadow-sm border-0 rounded-3 overflow-hidden position-relative border-start ${isCancelled ? 'border-secondary' : 'border-danger'} border-4`}>
                                    {/* Ticket Header */}
                                    <div className="card-header bg-light d-flex justify-content-between align-items-center py-3">
                                        <div>
                                            <span className={`badge ${isCancelled ? 'bg-secondary' : 'bg-dark'} me-2`}>
                                                {isCancelled ? 'CANCELLED' : 'CONFIRMED PASS'}
                                            </span>
                                            <span className="text-muted small">
                                                Ref: <strong>{booking.bookingReference || `#${booking._id.slice(-6).toUpperCase()}`}</strong>
                                            </span>
                                        </div>
                                        <span className={`badge ${isCancelled ? 'bg-danger' : 'bg-success'}`}>
                                            {isCancelled ? 'Refunded' : 'Paid'}
                                        </span>
                                    </div>

                                    {/* Ticket Body */}
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h4 className={`card-title fw-bold mb-1 ${isCancelled ? 'text-muted text-decoration-line-through' : 'text-dark'}`}>
                                                    {booking.movieTitle}
                                                </h4>
                                                <div className="small text-muted">
                                                    📍 {booking.theaterName || 'IMovies Grand Cinema'} • Showtime: <strong>{booking.showTime || '07:30 PM'}</strong>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <span className={`fs-4 fw-bold ${isCancelled ? 'text-muted' : 'text-danger'}`}>
                                                    ₹{booking.totalAmount}
                                                </span>
                                                <div className="text-muted small">Total Paid</div>
                                            </div>
                                        </div>

                                        <div className="text-muted small mb-3">
                                            📅 Reserved on <strong>{bookingDate}</strong> at <strong>{bookingTime}</strong>
                                        </div>

                                        <hr className="my-3 text-muted" />

                                        {/* Reserved Seats & QR Code Section */}
                                        <div className="row align-items-center g-2 mb-3">
                                            <div className="col-sm-7">
                                                <div className="fw-semibold small text-uppercase text-secondary mb-2">
                                                    Reserved Seats ({booking.seats ? booking.seats.length : 0})
                                                </div>
                                                <div className="d-flex flex-wrap gap-2 mb-2">
                                                    {booking.seats && booking.seats.map(seat => (
                                                        <span 
                                                            key={seat} 
                                                            className={`badge ${isCancelled ? 'bg-secondary' : 'bg-danger'} px-3 py-2 fs-6 shadow-sm`}
                                                        >
                                                            💺 {seat}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="col-sm-5 text-center">
                                                <QRCodeTicket booking={booking} size={105} showDetails={false} />
                                                <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                                                    🔍 Click QR to enlarge
                                                </small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ticket Footer Actions */}
                                    <div className="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center pb-3">
                                        <small className="text-muted">
                                            Payment: <strong>{booking.paymentMethod || 'UPI/Card'}</strong>
                                        </small>
                                        <div className="d-flex gap-2">
                                            {!isCancelled && (
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleCancelBooking(booking._id, booking.movieTitle)}
                                                >
                                                    Cancel Ticket
                                                </button>
                                            )}
                                            <button 
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => window.print()}
                                                title="Print official booking receipt"
                                            >
                                                🖨️ Print
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MyBookings;
