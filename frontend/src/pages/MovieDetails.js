import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { movieAPI, showAPI, reviewAPI } from '../services/api';

function MovieDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Review Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewMsg, setReviewMsg] = useState({ type: '', text: '' });

    const token = localStorage.getItem('token');

    const loadData = async () => {
        try {
            setLoading(true);
            const [movieRes, showsRes, reviewsRes] = await Promise.all([
                movieAPI.getById(id),
                showAPI.getByMovie(id),
                reviewAPI.getByMovie(id)
            ]);

            setMovie(movieRes.data);
            setShows(showsRes.data);
            setReviews(reviewsRes.data);
        } catch (err) {
            console.error("Error loading movie details:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            alert("Please log in to submit a movie review!");
            navigate('/login');
            return;
        }

        if (!comment.trim()) {
            setReviewMsg({ type: 'danger', text: 'Please enter a review comment.' });
            return;
        }

        try {
            setReviewSubmitting(true);
            await reviewAPI.create({
                movieId: id,
                rating: Number(rating),
                comment: comment.trim()
            });

            setReviewMsg({ type: 'success', text: 'Thank you! Your review was submitted successfully.' });
            setComment('');
            // Refresh reviews & movie data (rating updated)
            const [movieRes, reviewsRes] = await Promise.all([
                movieAPI.getById(id),
                reviewAPI.getByMovie(id)
            ]);
            setMovie(movieRes.data);
            setReviews(reviewsRes.data);
        } catch (err) {
            console.error("Review submission error:", err);
            setReviewMsg({ type: 'danger', text: err.response?.data?.msg || 'Failed to submit review.' });
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading movie details...</span>
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="container py-5 text-center">
                <h4>Movie not found.</h4>
                <Link to="/" className="btn btn-danger mt-3">Back to Movies</Link>
            </div>
        );
    }

    return (
        <div className="container py-4">
            {/* Breadcrumb Navigation */}
            <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Movies</Link></li>
                    <li className="breadcrumb-item active text-danger fw-semibold" aria-current="page">{movie.title}</li>
                </ol>
            </nav>

            {/* Movie Overview Card */}
            <div className="card shadow-sm border-0 mb-4 overflow-hidden rounded-3">
                <div className="row g-0">
                    <div className="col-md-4 bg-dark text-center">
                        <img
                            src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'}
                            alt={movie.title}
                            className="img-fluid h-100 w-100"
                            style={{ objectFit: 'cover', maxHeight: '480px' }}
                        />
                    </div>
                    <div className="col-md-8">
                        <div className="card-body p-4 p-lg-5 d-flex flex-column h-100 justify-content-between">
                            <div>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h1 className="fw-bold mb-1 text-dark">{movie.title}</h1>
                                    <span className="badge bg-warning text-dark fs-5 fw-bold px-3 py-2 shadow-sm">
                                        ⭐ {movie.rating ? movie.rating.toFixed(1) : '8.5'}/10
                                    </span>
                                </div>

                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    <span className="badge bg-danger">{movie.language}</span>
                                    <span className="badge bg-secondary">⏱️ {movie.duration} mins</span>
                                    {Array.isArray(movie.genre) && movie.genre.map(g => (
                                        <span key={g} className="badge bg-light text-dark border">{g}</span>
                                    ))}
                                </div>

                                <h5 className="fw-bold text-dark mt-4 mb-2">Synopsis & Storyline</h5>
                                <p className="text-muted leading-relaxed mb-4">
                                    {movie.description || 'Experience cinema like never before with state of the art sound and IMAX visual immersion.'}
                                </p>
                            </div>

                            {/* Book Action CTA */}
                            <div className="d-flex gap-3 flex-wrap pt-3 border-top">
                                <button
                                    className="btn btn-danger btn-lg px-4 fw-bold shadow-sm"
                                    onClick={() => navigate(`/book/${movie._id}`)}
                                >
                                    🎟️ Book Tickets & Seats
                                </button>
                                <a 
                                    href={movie.trailerUrl || 'https://www.youtube.com'} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="btn btn-outline-dark btn-lg px-4"
                                >
                                    ▶️ Watch Trailer
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Available Theaters & Showtimes */}
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 h-100 rounded-3">
                        <div className="card-header bg-white py-3">
                            <h5 className="fw-bold mb-0">🕒 Available Showtimes & Cinema Halls</h5>
                        </div>
                        <div className="card-body">
                            {shows.length === 0 ? (
                                <p className="text-muted mb-0">No active showtimes currently scheduled for this title.</p>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {shows.map(show => (
                                        <div key={show._id} className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                                            <div>
                                                <div className="fw-bold text-dark">{show.theater?.name || 'IMovies Grand Screen'}</div>
                                                <div className="small text-muted">
                                                    📍 {show.theater?.city} • Screen {show.screenNumber || 1}
                                                </div>
                                                <div className="small text-danger fw-semibold mt-1">
                                                    Showtime: <strong>{show.showTime}</strong> | ₹{show.ticketPrice} per seat
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-sm btn-danger fw-bold"
                                                onClick={() => navigate(`/book/${movie._id}`)}
                                            >
                                                Select Seats →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Community Reviews & Ratings */}
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 h-100 rounded-3">
                        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">💬 Verified Audience Reviews ({reviews.length})</h5>
                            <span className="badge bg-warning text-dark fw-bold">
                                ⭐ {movie.rating ? movie.rating.toFixed(1) : '8.5'}/10
                            </span>
                        </div>
                        <div className="card-body">
                            {/* Rating Breakdown Overview */}
                            {reviews.length > 0 && (
                                <div className="p-3 bg-light rounded-3 mb-4 border">
                                    <div className="row align-items-center text-center text-sm-start">
                                        <div className="col-sm-4 border-end-sm mb-3 mb-sm-0 text-center">
                                            <div className="display-6 fw-bold text-dark">
                                                {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                                            </div>
                                            <div className="text-warning fs-5">
                                                {'★'.repeat(Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length))}
                                                {'☆'.repeat(5 - Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length))}
                                            </div>
                                            <small className="text-muted">{reviews.length} verified ratings</small>
                                        </div>
                                        <div className="col-sm-8">
                                            {[5, 4, 3, 2, 1].map(stars => {
                                                const count = reviews.filter(r => r.rating === stars).length;
                                                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                                return (
                                                    <div key={stars} className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.78rem' }}>
                                                        <span style={{ width: '25px' }} className="fw-semibold text-muted">{stars}★</span>
                                                        <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                                            <div 
                                                                className="progress-bar bg-warning" 
                                                                role="progressbar" 
                                                                style={{ width: `${pct}%` }}
                                                            ></div>
                                                        </div>
                                                        <span style={{ width: '25px' }} className="text-end text-muted">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Interactive Write Review Form */}
                            <form onSubmit={handleReviewSubmit} className="mb-4 p-3 bg-light rounded-3 border">
                                <h6 className="fw-bold mb-2 text-dark">Rate & Review This Movie</h6>
                                {reviewMsg.text && (
                                    <div className={`alert alert-${reviewMsg.type} small py-2`} role="alert">
                                        {reviewMsg.text}
                                    </div>
                                )}

                                {/* Interactive 5-Star Selector */}
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-muted d-block mb-1">
                                        Click stars to rate:
                                    </label>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="d-flex gap-1 fs-3 cursor-pointer" style={{ cursor: 'pointer' }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    onClick={() => setRating(star)}
                                                    className="transition-transform"
                                                    style={{ 
                                                        color: star <= rating ? '#f59e0b' : '#d1d5db',
                                                        transition: 'color 0.15s ease, transform 0.15s ease',
                                                        userSelect: 'none'
                                                    }}
                                                    title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                        <span className="badge bg-dark px-2 py-1 small">
                                            {rating === 5 && '⭐⭐⭐⭐⭐ 5/5 - Masterpiece'}
                                            {rating === 4 && '⭐⭐⭐⭐ 4/5 - Very Good'}
                                            {rating === 3 && '⭐⭐⭐ 3/5 - Good'}
                                            {rating === 2 && '⭐⭐ 2/5 - Fair'}
                                            {rating === 1 && '⭐ 1/5 - Poor'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <textarea
                                        className="form-control form-control-sm"
                                        rows="3"
                                        placeholder="Share your thoughts on the movie plot, performance, direction, and audio-visuals..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        maxLength={500}
                                        required
                                    ></textarea>
                                    <div className="text-end text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                                        {comment.length}/500 characters
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-danger btn-sm w-100 fw-bold shadow-sm"
                                    disabled={reviewSubmitting}
                                >
                                    {reviewSubmitting ? 'Posting Review...' : 'Submit Verified Review'}
                                </button>
                            </form>

                            {/* Reviews List */}
                            {reviews.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <div className="fs-3 mb-1">✍️</div>
                                    <p className="small mb-0">No audience reviews yet. Be the first to share your thoughts!</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                                    {reviews.map(r => (
                                        <div key={r._id || Math.random()} className="p-3 bg-white rounded-3 border shadow-sm">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div 
                                                        className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold"
                                                        style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}
                                                    >
                                                        {r.userName ? r.userName.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div>
                                                        <span className="fw-bold small text-dark d-block leading-tight">{r.userName || 'Movie Fan'}</span>
                                                        <span className="badge bg-light text-muted border" style={{ fontSize: '0.65rem' }}>Verified Viewer</span>
                                                    </div>
                                                </div>
                                                <span className="text-warning fs-6">
                                                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                                </span>
                                            </div>
                                            <p className="text-muted small mb-1 mt-2">{r.comment}</p>
                                            <div className="text-secondary small text-end" style={{ fontSize: '0.72rem' }}>
                                                📅 {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MovieDetails;
