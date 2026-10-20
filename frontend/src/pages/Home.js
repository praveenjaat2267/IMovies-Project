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
            {/* Hero Banner with Cinematic Glow */}
            <div className="p-4 p-md-5 mb-4 cinematic-hero text-white position-relative">
                <div className="col-lg-8 position-relative" style={{ zIndex: 2 }}>
                    <div className="hero-pill-badge mb-3">
                        <span style={{ fontSize: '0.9rem' }}>✨</span>
                        <span>NEXT-GEN PREMIERE CINEMA</span>
                    </div>
                    <h1 className="display-4 fw-bold mb-3">
                        Immersive Cinema. <br />
                        <span className="brand-gradient">Seamless Seat Booking.</span>
                    </h1>
                    <p className="lead text-secondary mb-4" style={{ maxWidth: '640px', fontSize: '1.05rem', lineHeight: '1.6' }}>
                        Experience blockbusters in ultra-vivid 4K laser projection and Dolby Atmos multidimensional sound. Reserve luxury recliner seats with instant live confirmation.
                    </p>
                    <div className="d-flex flex-wrap gap-3">
                        <a href="#browse-section" className="btn btn-danger btn-lg px-4 fw-bold rounded-pill shadow">
                            🎟️ Explore Now Showing
                        </a>
                        {token ? (
                            <Link to="/my-bookings" className="btn btn-outline-light btn-lg px-4 rounded-pill">
                                View My Bookings
                            </Link>
                        ) : (
                            <Link to="/register" className="btn btn-outline-warning btn-lg px-4 rounded-pill">
                                Join IMovies Club
                            </Link>
                        )}
                        {userRole === 'admin' && (
                            <Link to="/admin" className="btn btn-warning btn-lg px-4 text-dark fw-bold rounded-pill">
                                🛡️ Admin Dashboard
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* BookMyShow / District Style Horizontal Spotlight Banner */}
            {sortedMovies.length > 0 && (
                <div 
                    className="card shadow-lg border-0 mb-4 rounded-4 overflow-hidden position-relative text-white" 
                    style={{ 
                        minHeight: '320px',
                        background: `linear-gradient(to right, rgba(11, 15, 25, 0.95) 0%, rgba(11, 15, 25, 0.7) 45%, rgba(11, 15, 25, 0.25) 100%), url(${sortedMovies[0].bannerUrl || sortedMovies[0].posterUrl}) center/cover no-repeat`
                    }}
                >
                    <div className="card-body p-4 p-md-5 d-flex flex-column justify-content-center position-relative" style={{ maxWidth: '640px', zIndex: 2 }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="badge bg-danger text-uppercase px-3 py-1">BLOCKBUSTER SPOTLIGHT</span>
                            <span className="badge bg-warning text-dark fw-bold">⭐ {sortedMovies[0].rating ? sortedMovies[0].rating.toFixed(1) : '8.8'}/10</span>
                        </div>
                        <h2 className="display-6 fw-bold mb-2 text-white">{sortedMovies[0].title}</h2>
                        <p className="text-light opacity-90 small mb-3" style={{ lineHeight: '1.6', maxWidth: '520px' }}>
                            {sortedMovies[0].description}
                        </p>
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                            <span className="badge bg-secondary">{sortedMovies[0].language}</span>
                            <span className="badge bg-dark border border-secondary">⏱️ {sortedMovies[0].duration} mins</span>
                            {Array.isArray(sortedMovies[0].genre) && sortedMovies[0].genre.map(g => (
                                <span key={g} className="badge bg-light text-dark">{g}</span>
                            ))}
                        </div>
                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-danger btn-sm px-4 py-2 fw-bold rounded-pill shadow"
                                onClick={() => navigate(`/book/${sortedMovies[0]._id}`)}
                            >
                                🎟️ Book Tickets
                            </button>
                            <button 
                                className="btn btn-outline-light btn-sm px-3 py-2 rounded-pill"
                                onClick={() => navigate(`/movie/${sortedMovies[0]._id}`)}
                            >
                                Details →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Metrics Bar (Open9 Counter Styling) */}
            <div className="row g-3 mb-4 text-center">
                <div className="col-4">
                    <div className="metric-tile">
                        <div className="fs-2 fw-bold text-gradient-red">{movies.length}</div>
                        <div className="small text-secondary fw-semibold">Movies Showing</div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="metric-tile">
                        <div className="fs-2 fw-bold text-gradient-cyan">4K Dolby</div>
                        <div className="small text-secondary fw-semibold">Audio & Visuals</div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="metric-tile">
                        <div className="fs-2 fw-bold text-warning">Instant</div>
                        <div className="small text-secondary fw-semibold">Seat Sync</div>
                    </div>
                </div>
            </div>

            {/* Interactive Filters & Search Section */}
            <div id="browse-section" className="card shadow-sm border-0 mb-4 p-4 rounded-4">
                <div className="row g-3 align-items-center">
                    {/* Search Field */}
                    <div className="col-md-4">
                        <div className="input-group">
                            <span className="input-group-text bg-transparent border-end-0 text-secondary">🔍</span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Search by title, genre, actor..."
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

                {/* Quick Genre Pills (Open9 Tag Style) */}
                <div className="d-flex flex-wrap align-items-center gap-2 mt-3 pt-3 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                    <span className="small text-secondary me-2 fw-semibold">Hot Genres:</span>
                    {['Action', 'Sci-Fi', 'Drama', 'Adventure', 'Thriller'].map(genre => (
                        <button
                            key={genre}
                            type="button"
                            className={`category-pill-btn ${selectedGenre === genre ? 'active' : ''}`}
                            onClick={() => setSelectedGenre(selectedGenre === genre ? 'All' : genre)}
                        >
                            {genre}
                        </button>
                    ))}
                    {(selectedGenre !== 'All' || selectedLanguage !== 'All' || search) && (
                        <button
                            type="button"
                            className="btn btn-sm btn-link text-danger py-0 px-2 text-decoration-none ms-auto fw-semibold"
                            onClick={() => {
                                setSearch('');
                                setSelectedGenre('All');
                                setSelectedLanguage('All');
                            }}
                        >
                            ✕ Reset Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Movies Section Header */}
            <div className="d-flex align-items-center justify-content-between mb-3 px-1">
                <div>
                    <h3 className="fw-bold mb-0">Hot & Fresh Releases</h3>
                    <p className="text-secondary small mb-0">Showing {sortedMovies.length} featured cinema screenings</p>
                </div>
            </div>

            {/* Movies Grid */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status" style={{ width: '3.5rem', height: '3.5rem' }}>
                        <span className="visually-hidden">Loading movies...</span>
                    </div>
                    <p className="text-secondary mt-3 fw-semibold">Fetching IMAX & Cinema listings...</p>
                </div>
            ) : sortedMovies.length === 0 ? (
                <div className="text-center py-5 card shadow-sm border-0 rounded-4 p-5">
                    <div className="fs-1 mb-2">🎬</div>
                    <h4 className="fw-bold">No movies found</h4>
                    <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '400px' }}>
                        We couldn't find any movie matching your current filters. Try resetting search terms or selecting another genre.
                    </p>
                    <button
                        className="btn btn-outline-danger mx-auto rounded-pill px-4"
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
                                <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden d-flex flex-column position-relative movie-card-wrapper">
                                    {/* Rating Badge Overlay */}
                                    <span 
                                        className="badge badge-glow-amber position-absolute top-0 end-0 m-3 fw-bold"
                                        style={{ zIndex: 3 }}
                                    >
                                        ⭐ {movie.rating ? movie.rating.toFixed(1) : '8.5'}/10
                                    </span>

                                    {/* Poster Container */}
                                    <div 
                                        className="movie-poster-box"
                                        onClick={() => navigate(`/movie/${movie._id}`)}
                                        title="Click to view full details"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img
                                            src={movie.posterUrl || defaultPoster}
                                            alt={movie.title}
                                            onError={(e) => {
                                                e.target.src = defaultPoster;
                                            }}
                                        />
                                        <div className="movie-poster-overlay"></div>
                                    </div>

                                    {/* Movie Info */}
                                    <div className="card-body d-flex flex-column p-4">
                                        <h5 
                                            className="card-title fw-bold text-truncate mb-2" 
                                            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                                            onClick={() => navigate(`/movie/${movie._id}`)}
                                            title={movie.title}
                                        >
                                            {movie.title}
                                        </h5>

                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            <span className="badge bg-secondary">{movie.language || 'English'}</span>
                                            <span className="badge bg-light">⏱️ {movie.duration} mins</span>
                                        </div>

                                        <p className="card-text text-secondary small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                                            {movie.description || 'Action-packed cinema adventure with state of the art sound and visuals.'}
                                        </p>

                                        <div className="small text-secondary mb-3 d-flex align-items-center gap-1">
                                            <span className="text-muted">Genre:</span>
                                            <span className="text-light fw-medium">{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="d-flex gap-2 pt-2 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                                            <button
                                                className="btn btn-outline-secondary btn-sm flex-fill rounded-pill"
                                                onClick={() => navigate(`/movie/${movie._id}`)}
                                            >
                                                Details
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm flex-fill fw-bold rounded-pill shadow"
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