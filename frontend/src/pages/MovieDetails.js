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
                        <div className="card-header bg-white py-3">
                            <h5 className="fw-bold mb-0">💬 Ratings & Verified Audience Reviews ({reviews.length})</h5>
                        </div>
                        <div className="card-body">
                            {/* Write Review Form */}
                            <form onSubmit={handleReviewSubmit} className="mb-4 p-3 bg-light rounded-3 border">
                                <h6 className="fw-bold mb-2">Write a Review</h6>
                                {reviewMsg.text && (
                                    <div className={`alert alert-${reviewMsg.type} small py-2`} role="alert">
                                        {reviewMsg.text}
                                    </div>
                                )}
                                <div className="mb-2">
                                    <label className="form-label small fw-semibold">Your Rating (1 to 5 Stars):</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={rating}
                                        onChange={(e) => setRating(e.target.value)}
                                    >
                                        <option value="5">⭐⭐⭐⭐⭐ (5/5) - Masterpiece</option>
                                        <option value="4">⭐⭐⭐⭐ (4/5) - Very Good</option>
                                        <option value="3">⭐⭐⭐ (3/5) - Average</option>
                                        <option value="2">⭐⭐ (2/5) - Below Average</option>
                                        <option value="1">⭐ (1/5) - Poor</option>
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <textarea
                                        className="form-control form-control-sm"
                                        rows="2"
                                        placeholder="Share your thoughts on the movie plot, acting, and visuals..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-dark btn-sm w-100 fw-bold"
                                    disabled={reviewSubmitting}
                                >
                                    {reviewSubmitting ? 'Submitting...' : 'Post Verified Review'}
                                </button>
                            </form>

                            {/* Reviews List */}
                            {reviews.length === 0 ? (
                                <p className="text-muted small mb-0">No reviews yet. Be the first to review this movie!</p>
                            ) : (
                                <div className="d-flex flex-column gap-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {reviews.map(r => (
                                        <div key={r._id} className="border-bottom pb-2">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span className="fw-bold small">{r.userName}</span>
                                                <span className="text-warning small">
                                                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                                </span>
                                            </div>
                                            <p className="text-muted small mb-1">{r.comment}</p>
                                            <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                                                {new Date(r.createdAt).toLocaleDateString()}
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
