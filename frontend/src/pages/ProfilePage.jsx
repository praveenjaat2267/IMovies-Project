import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import QRCodeTicket from '../components/QRCodeTicket';

function ProfilePage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState({ type: '', text: '' });
    const [filter, setFilter] = useState('all'); // 'all', 'confirmed', 'cancelled'
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName') || 'Cinema Fan';
    const userEmail = localStorage.getItem('userEmail') || 'user@imovies.com';
    const userRole = localStorage.getItem('userRole') || 'user';

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await bookingAPI.getUserBookings();
            setBookings(res.data);
            setError('');
        } catch (err) {
            console.error("Error fetching profile bookings:", err);
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
            fetchBookings();
        } catch (err) {
            console.error("Cancellation error:", err);
            setActionMsg({ type: 'danger', text: err.response?.data?.msg || "Cancellation failed." });
        }
    };

    if (!token) {
        return (
            <div className="container mt-5 text-center">
                <div className="card shadow-sm p-5 mx-auto border-0 rounded-4" style={{ maxWidth: '480px' }}>
                    <div className="display-4 text-danger mb-3">🔒</div>
                    <h3 className="fw-bold mb-2">Member Sign In Required</h3>
                    <p className="text-muted mb-4">
                        Please sign in to view your user profile, scannable QR e-tickets, and transaction history.
                    </p>
                    <button className="btn btn-danger btn-lg w-100 fw-bold rounded-pill" onClick={() => navigate('/login')}>
                        Log In Now
                    </button>
                    <Link to="/register" className="mt-3 text-muted text-decoration-none small">
                        Don't have an account? Sign up here
                    </Link>
                </div>
            </div>
        );
    }

    const confirmedBookings = bookings.filter(b => b.status !== 'Cancelled');
    const totalSpent = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalSeats = confirmedBookings.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);

    const filteredBookings = bookings.filter(b => {
        if (filter === 'confirmed') return b.status !== 'Cancelled';
        if (filter === 'cancelled') return b.status === 'Cancelled';
        return true;
    });

    return (
        <div className="container py-4">
            {/* User Profile Header Card */}
            <div 
                className="card shadow-sm mb-4 border-0 text-white rounded-4 overflow-hidden position-relative"
                style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)' }}
            >
                <div className="card-body p-4 p-md-5">
                    <div className="row align-items-center g-4">
                        <div className="col-md-7">
                            <div className="d-flex align-items-center gap-3">
                                <div 
                                    className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold fs-1 shadow-lg"
                                    style={{ width: '76px', height: '76px', border: '3px solid rgba(255,255,255,0.2)' }}
                                >
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="fw-bold mb-1 d-flex align-items-center gap-2 text-white">
                                        {userName}
                                        <span className={`badge ${userRole === 'admin' ? 'bg-warning text-dark' : 'bg-danger'} fs-6`}>
                                            {userRole === 'admin' ? 'Administrator' : 'Premiere Member'}
                                        </span>
                                    </h2>
                                    <div className="text-light opacity-75 small">
                                        📧 {userEmail} • 🎫 Verified Ticket Holder
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Badges */}
                        <div className="col-md-5">
                            <div className="d-flex justify-content-md-end gap-3 text-center">
                                <div className="bg-dark bg-opacity-75 px-3 py-2 rounded-3 border border-light border-opacity-10 shadow-sm flex-fill">
                                    <div className="fs-3 fw-bold text-danger">{confirmedBookings.length}</div>
                                    <div className="small text-light opacity-75">Active Passes</div>
                                </div>
                                <div className="bg-dark bg-opacity-75 px-3 py-2 rounded-3 border border-light border-opacity-10 shadow-sm flex-fill">
                                    <div className="fs-3 fw-bold text-warning">{totalSeats}</div>
                                    <div className="small text-light opacity-75">Seats Booked</div>
                                </div>
                                <div className="bg-dark bg-opacity-75 px-3 py-2 rounded-3 border border-light border-opacity-10 shadow-sm flex-fill">
                                    <div className="fs-3 fw-bold text-success">₹{totalSpent}</div>
                                    <div className="small text-light opacity-75">Total Spent</div>
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

            {/* Section Header & Filters */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h4 className="fw-bold mb-1 text-dark">📱 My Scannable QR E-Tickets</h4>
                    <p className="text-muted small mb-0">Present each ticket's digital QR code at cinema turnstiles</p>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <div className="btn-group btn-group-sm">
                        <button 
                            className={`btn ${filter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setFilter('all')}
                        >
                            All ({bookings.length})
                        </button>
                        <button 
                            className={`btn ${filter === 'confirmed' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setFilter('confirmed')}
                        >
                            Confirmed ({confirmedBookings.length})
                        </button>
                        <button 
                            className={`btn ${filter === 'cancelled' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setFilter('cancelled')}
                        >
                            Cancelled ({bookings.length - confirmedBookings.length})
                        </button>
                    </div>

                    <Link to="/" className="btn btn-danger btn-sm fw-semibold">
                        + New Booking
                    </Link>
                </div>
            </div>

            {/* Loading Spinner */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading tickets...</span>
                    </div>
                    <p className="text-muted mt-3">Generating digital passes and QR codes...</p>
                </div>
            ) : filteredBookings.length === 0 ? (
                /* Empty State */
                <div className="card shadow-sm border-0 text-center py-5 px-3 rounded-4">
                    <div className="card-body">
                        <div className="display-3 text-muted mb-3">🎬</div>
                        <h4 className="fw-bold">No E-Tickets Found</h4>
                        <p className="text-muted mx-auto mb-4" style={{ maxWidth: '420px' }}>
                            You have no active or archived movie passes in this category. Browse top box-office movies and book seats now!
                        </p>
                        <Link to="/" className="btn btn-danger px-4 py-2 fw-bold rounded-pill">
                            Explore Current Movies
                        </Link>
                    </div>
                </div>
            ) : (
                /* Bookings List with QR Codes */
                <div className="row g-4">
                    {filteredBookings.map((booking) => {
                        const isCancelled = booking.status === 'Cancelled';
                        const bookingRef = booking.bookingReference || `#${booking._id.slice(-6).toUpperCase()}`;
                        const bookingDate = new Date(booking.createdAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });

                        return (
                            <div className="col-lg-6" key={booking._id}>
                                <div className={`card h-100 shadow-sm border-0 rounded-4 overflow-hidden border-start ${isCancelled ? 'border-secondary' : 'border-danger'} border-4`}>
                                    {/* Ticket Header */}
                                    <div className="card-header bg-light d-flex justify-content-between align-items-center py-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className={`badge ${isCancelled ? 'bg-secondary' : 'bg-dark'}`}>
                                                {isCancelled ? 'CANCELLED' : 'CONFIRMED PASS'}
                                            </span>
                                            <span className="text-muted small">
                                                Ref: <strong className="text-danger">{bookingRef}</strong>
                                            </span>
                                        </div>
                                        <span className={`badge ${isCancelled ? 'bg-danger' : 'bg-success'}`}>
                                            {isCancelled ? 'Refunded' : 'Paid'}
                                        </span>
                                    </div>

                                    {/* Ticket Body */}
                                    <div className="card-body p-4">
                                        <div className="row g-3">
                                            {/* Details Left */}
                                            <div className="col-sm-7">
                                                <h4 className={`card-title fw-bold mb-1 ${isCancelled ? 'text-muted text-decoration-line-through' : 'text-dark'}`}>
                                                    {booking.movieTitle}
                                                </h4>
                                                <div className="small text-muted mb-2">
                                                    📍 {booking.theaterName || 'IMovies Grand Cinema'}
                                                </div>
                                                <div className="small text-secondary mb-2">
                                                    🕒 Showtime: <strong className="text-dark">{booking.showTime || '07:30 PM'}</strong>
                                                </div>
                                                <div className="small text-muted mb-3">
                                                    📅 Date: <strong>{bookingDate}</strong>
                                                </div>

                                                {/* Seats */}
                                                <div className="mb-2">
                                                    <div className="small text-uppercase text-muted fw-semibold mb-1">
                                                        Seats ({booking.seats ? booking.seats.length : 0}):
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {booking.seats && booking.seats.map(seat => (
                                                            <span 
                                                                key={seat} 
                                                                className={`badge ${isCancelled ? 'bg-secondary' : 'bg-danger'} px-2 py-1 shadow-sm`}
                                                            >
                                                                💺 {seat}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <span className="text-muted small">Amount: </span>
                                                    <span className={`fs-5 fw-bold ${isCancelled ? 'text-muted' : 'text-danger'}`}>
                                                        ₹{booking.totalAmount}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* QR Code Column */}
                                            <div className="col-sm-5 d-flex flex-column align-items-center justify-content-center text-center">
                                                <QRCodeTicket booking={booking} size={110} showDetails={false} />
                                                <small className="text-muted mt-2" style={{ fontSize: '0.72rem' }}>
                                                    🔍 Click QR to enlarge
                                                </small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ticket Footer Actions */}
                                    <div className="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center pb-3 pt-0">
                                        <small className="text-muted">
                                            Pay: <strong>{booking.paymentMethod || 'UPI/Card'}</strong>
                                        </small>
                                        <div className="d-flex gap-2">
                                            {!isCancelled && (
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleCancelBooking(booking._id, booking.movieTitle)}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button 
                                                className="btn btn-outline-dark btn-sm"
                                                onClick={() => window.print()}
                                                title="Print booking receipt"
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

export default ProfilePage;
