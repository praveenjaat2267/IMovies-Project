import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { movieAPI } from '../services/api';

function Home() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [selectedLanguage, setSelectedLanguage] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // Fetch movies from API
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const res = await movieAPI.getAll({
                    search: search || undefined,
                    genre: selectedGenre !== 'All' ? selectedGenre : undefined,
                    language: selectedLanguage !== 'All' ? selectedLanguage : undefined
                });
                setMovies(res.data);
            } catch (err) {
                console.error("Error loading movies:", err);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchMovies();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [search, selectedGenre, selectedLanguage]);

    // Client-side sorting
    const sortedMovies = [...movies].sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'duration') return (a.duration || 0) - (b.duration || 0);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return new Date(b.createdAt || b.releaseDate) - new Date(a.createdAt || a.releaseDate);
    });

    const genreOptions = ['All', 'Sci-Fi', 'Action', 'Adventure', 'Drama', 'Crime', 'Comedy', 'Thriller'];
    const languageOptions = ['All', 'English', 'Hindi', 'Telugu', 'Tamil'];

    return (
        <div className="container py-4">
            {/* Hero Banner */}
            <div className="p-4 p-md-5 mb-4 rounded-3 text-white shadow-lg position-relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                <div className="col-lg-8 position-relative" style={{ zIndex: 1 }}>
                    <span className="badge bg-danger px-3 py-2 text-uppercase mb-3 fw-bold letter-spacing-1">
                        🎬 IMovies Premier Experience
                    </span>
                    <h1 className="display-4 fw-bold mb-3">Immersive Cinema. Seamless Seat Booking.</h1>
                    <p className="lead text-light opacity-90 mb-4">
                        Discover top blockbusters, reserve luxury seats in real-time, and experience cutting-edge IMAX & Dolby Atmos sound at your favorite cinema.
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                        <a href="#browse-section" className="btn btn-danger btn-lg px-4 fw-bold shadow">
                            🎟️ Explore Now Showing
                        </a>
                        {token ? (
                            <Link to="/my-bookings" className="btn btn-outline-light btn-lg px-4">
                                View My Bookings
                            </Link>
                        ) : (
                            <Link to="/register" className="btn btn-outline-warning btn-lg px-4">
                                Join IMovies Club
                            </Link>
                        )}
                        {userRole === 'admin' && (
                            <Link to="/admin" className="btn btn-warning btn-lg px-4 text-dark fw-bold">
                                🛡️ Admin Dashboard
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="row g-3 mb-4 text-center">
                <div className="col-4">
                    <div className="bg-light p-3 rounded-3 shadow-sm border">
                        <div className="fs-3 fw-bold text-danger">{movies.length}</div>
                        <div className="small text-muted fw-semibold">Movies Showing</div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="bg-light p-3 rounded-3 shadow-sm border">
                        <div className="fs-3 fw-bold text-warning">4K Dolby</div>
                        <div className="small text-muted fw-semibold">Audio & Visuals</div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="bg-light p-3 rounded-3 shadow-sm border">
                        <div className="fs-3 fw-bold text-success">Instant</div>
                        <div className="small text-muted fw-semibold">Seat Confirmation</div>
                    </div>
                </div>
            </div>

            {/* Interactive Filters & Search Section */}
            <div id="browse-section" className="card shadow-sm border-0 mb-4 p-3 bg-white rounded-3">
                <div className="row g-3 align-items-center">
                    {/* Search Field */}
                    <div className="col-md-4">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">🔍</span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search by title, director, keywords..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Genre Dropdown */}
                    <div className="col-md-3 col-6">
                        <select
                            className="form-select"
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                        >
                            {genreOptions.map(g => (
                                <option key={g} value={g}>{g === 'All' ? '🎭 All Genres' : g}</option>
                            ))}
                        </select>
                    </div>

                    {/* Language Dropdown */}
                    <div className="col-md-2 col-6">
                        <select
                            className="form-select"
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                            {languageOptions.map(l => (
                                <option key={l} value={l}>{l === 'All' ? '🌐 All Languages' : l}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Options */}
                    <div className="col-md-3">
                        <select
                            className="form-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">⚡ Sort: Newest First</option>
                            <option value="rating">⭐ Sort: Top Rated</option>
                            <option value="duration">⏱️ Sort: Shortest Duration</option>
                            <option value="title">🔤 Sort: Title (A-Z)</option>
                        </select>
                    </div>
                </div>

                {/* Quick Genre Pills */}
                <div className="d-flex flex-wrap gap-2 mt-3 pt-2 border-top">
                    <span className="small text-muted align-self-center me-1">Popular:</span>
                    {['Action', 'Sci-Fi', 'Drama', 'Adventure'].map(genre => (
                        <button
                            key={genre}
                            type="button"
                            className={`btn btn-sm py-0 px-2 rounded-pill ${selectedGenre === genre ? 'btn-danger' : 'btn-outline-secondary'}`}
                            onClick={() => setSelectedGenre(selectedGenre === genre ? 'All' : genre)}
                        >
                            {genre}
                        </button>
                    ))}
                    {(selectedGenre !== 'All' || selectedLanguage !== 'All' || search) && (
                        <button
                            type="button"
                            className="btn btn-sm btn-link text-danger py-0 px-2 text-decoration-none ms-auto"
                            onClick={() => {
                                setSearch('');
                                setSelectedGenre('All');
                                setSelectedLanguage('All');
                            }}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Movies Grid */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status" style={{ width: '3.5rem', height: '3.5rem' }}>
                        <span className="visually-hidden">Loading movies...</span>
                    </div>
                    <p className="text-muted mt-3 fw-semibold">Loading movie listings from IMovies servers...</p>
                </div>
            ) : sortedMovies.length === 0 ? (
                <div className="text-center py-5 card shadow-sm border-0 rounded-3">
                    <div className="fs-1 mb-2">🎬</div>
                    <h4 className="fw-bold">No movies found</h4>
                    <p className="text-muted mx-auto" style={{ maxWidth: '400px' }}>
                        We couldn't find any movie matching your current filters. Try resetting search terms or check back soon.
                    </p>
                    <button
                        className="btn btn-outline-danger mx-auto"
                        onClick={() => {
                            setSearch('');
                            setSelectedGenre('All');
                            setSelectedLanguage('All');
                        }}
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : (
                <div className="row g-4">
                    {sortedMovies.map(movie => {
                        const defaultPoster = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                        return (
                            <div className="col-12 col-sm-6 col-md-4 col-lg-4" key={movie._id}>
                                <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden d-flex flex-column position-relative">
                                    {/* Rating Badge Overlay */}
                                    <span 
                                        className="badge bg-warning text-dark position-absolute top-0 end-0 m-2 fw-bold shadow-sm"
                                        style={{ zIndex: 2 }}
                                    >
                                        ⭐ {movie.rating ? movie.rating.toFixed(1) : '8.5'}/10
                                    </span>

                                    {/* Poster Container */}
                                    <div 
                                        style={{ height: '280px', overflow: 'hidden', backgroundColor: '#111', cursor: 'pointer' }}
                                        onClick={() => navigate(`/movie/${movie._id}`)}
                                        title="Click to view full details"
                                    >
                                        <img
                                            src={movie.posterUrl || defaultPoster}
                                            alt={movie.title}
                                            className="w-100 h-100"
                                            style={{ objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.src = defaultPoster;
                                            }}
                                        />
                                    </div>

                                    {/* Movie Info */}
                                    <div className="card-body d-flex flex-column p-3">
                                        <h5 
                                            className="card-title fw-bold text-dark text-truncate mb-2" 
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/movie/${movie._id}`)}
                                            title={movie.title}
                                        >
                                            {movie.title}
                                        </h5>

                                        <div className="d-flex flex-wrap gap-1 mb-2">
                                            <span className="badge bg-secondary">{movie.language || 'English'}</span>
                                            <span className="badge bg-light text-dark border">⏱️ {movie.duration} mins</span>
                                        </div>

                                        <p className="card-text text-muted small mb-2 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {movie.description || 'Action-packed cinema adventure with state of the art sound and visuals.'}
                                        </p>

                                        <div className="small text-secondary mb-3">
                                            <strong>Genre:</strong> {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-outline-dark btn-sm flex-fill"
                                                onClick={() => navigate(`/movie/${movie._id}`)}
                                            >
                                                Details
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm flex-fill fw-bold"
                                                onClick={() => navigate(`/book/${movie._id}`)}
                                            >
                                                🎟️ Book Seats
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

export default Home;