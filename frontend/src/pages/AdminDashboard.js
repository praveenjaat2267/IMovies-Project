import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieAPI, theaterAPI, showAPI, bookingAPI } from '../services/api';

function AdminDashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName') || 'Admin';

    const [activeTab, setActiveTab] = useState('movies'); // 'overview' | 'movies' | 'shows'

    // Data States
    const [movies, setMovies] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [shows, setShows] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    // Movie Form State
    const [isEditing, setIsEditing] = useState(false);
    const [currentMovieId, setCurrentMovieId] = useState(null);
    const [movieForm, setMovieForm] = useState({
        title: '',
        genre: '',
        language: 'English',
        duration: '',
        rating: '8.5',
        posterUrl: '',
        description: '',
        releaseDate: ''
    });

    // Show Scheduling Form State
    const [showForm, setShowForm] = useState({
        movie: '',
        theater: '',
        showTime: '06:30 PM',
        showDate: new Date().toISOString().split('T')[0],
        ticketPrice: '180'
    });

    const isAuthorizedAdmin = token && userRole === 'admin';

    // Fetch initial datasets
    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [moviesRes, theatersRes, showsRes, bookingsRes] = await Promise.all([
                movieAPI.getAll(),
                theaterAPI.getAll(),
                showAPI.getAll(),
                bookingAPI.getAllBookings()
            ]);

            setMovies(moviesRes.data);
            setTheaters(theatersRes.data);
            setShows(showsRes.data);
            setAllBookings(bookingsRes.data);

            if (moviesRes.data.length > 0 && !showForm.movie) {
                setShowForm(prev => ({ ...prev, movie: moviesRes.data[0]._id }));
            }
            if (theatersRes.data.length > 0 && !showForm.theater) {
                setShowForm(prev => ({ ...prev, theater: theatersRes.data[0]._id }));
            }
        } catch (err) {
            console.error("Failed to load admin data:", err);
            showStatus('danger', 'Failed to retrieve administrative datasets.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthorizedAdmin) {
            fetchAllData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthorizedAdmin]);

    const showStatus = (type, text) => {
        setStatusMsg({ type, text });
        setTimeout(() => {
            setStatusMsg({ type: '', text: '' });
        }, 4500);
    };

    // Movie Form Handlers
    const handleMovieInputChange = (e) => {
        const { name, value } = e.target;
        setMovieForm(prev => ({ ...prev, [name]: value }));
    };

    const handleMovieSubmit = async (e) => {
        e.preventDefault();

        if (!movieForm.title.trim()) {
            showStatus('danger', 'Movie title is required!');
            return;
        }

        if (!movieForm.duration || Number(movieForm.duration) <= 0) {
            showStatus('danger', 'Valid duration in minutes is required.');
            return;
        }

        const payload = {
            title: movieForm.title.trim(),
            genre: movieForm.genre,
            language: movieForm.language.trim(),
            duration: Number(movieForm.duration),
            rating: Number(movieForm.rating) || 8.5,
            posterUrl: movieForm.posterUrl.trim() || undefined,
            description: movieForm.description.trim() || undefined,
            releaseDate: movieForm.releaseDate || new Date().toISOString().split('T')[0]
        };

        try {
            if (isEditing) {
                await movieAPI.update(currentMovieId, payload);
                showStatus('success', `Movie "${movieForm.title}" updated successfully!`);
            } else {
                await movieAPI.create(payload);
                showStatus('success', `Movie "${movieForm.title}" added to catalog!`);
            }

            resetMovieForm();
            const res = await movieAPI.getAll();
            setMovies(res.data);
        } catch (err) {
            console.error("Save movie error:", err);
            showStatus('danger', err.response?.data?.msg || 'Failed to save movie.');
        }
    };

    const handleEditMovie = (movie) => {
        setIsEditing(true);
        setCurrentMovieId(movie._id);
        setMovieForm({
            title: movie.title || '',
            genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || '',
            language: movie.language || 'English',
            duration: movie.duration || '',
            rating: movie.rating || '8.5',
            posterUrl: movie.posterUrl || '',
            description: movie.description || '',
            releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : ''
        });
        setActiveTab('movies');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteMovie = async (movieId, movieTitle) => {
        const confirmDelete = window.confirm(`Permanently remove "${movieTitle}" from the cinema directory?`);
        if (!confirmDelete) return;

        try {
            await movieAPI.delete(movieId);
            showStatus('success', `"${movieTitle}" removed from catalog.`);
            setMovies(prev => prev.filter(m => m._id !== movieId));
            if (isEditing && currentMovieId === movieId) {
                resetMovieForm();
            }
        } catch (err) {
            console.error("Delete movie error:", err);
            showStatus('danger', err.response?.data?.msg || 'Failed to delete movie.');
        }
    };

    const resetMovieForm = () => {
        setIsEditing(false);
        setCurrentMovieId(null);
        setMovieForm({
            title: '',
            genre: '',
            language: 'English',
            duration: '',
            rating: '8.5',
            posterUrl: '',
            description: '',
            releaseDate: ''
        });
    };

    // Show Scheduling Handlers
    const handleShowSubmit = async (e) => {
        e.preventDefault();
        try {
            await showAPI.create({
                movie: showForm.movie,
                theater: showForm.theater,
                showTime: showForm.showTime,
                showDate: showForm.showDate,
                ticketPrice: Number(showForm.ticketPrice)
            });
            showStatus('success', 'New movie showtime scheduled successfully!');
            const res = await showAPI.getAll();
            setShows(res.data);
        } catch (err) {
            console.error("Show creation error:", err);
            showStatus('danger', err.response?.data?.msg || 'Failed to schedule showtime.');
        }
    };

    const handleDeleteShow = async (showId) => {
        const confirmDelete = window.confirm('Are you sure you want to remove this scheduled show?');
        if (!confirmDelete) return;

        try {
            await showAPI.delete(showId);
            showStatus('success', 'Showtime removed successfully.');
            setShows(prev => prev.filter(s => s._id !== showId));
        } catch (err) {
            console.error("Delete show error:", err);
            showStatus('danger', err.response?.data?.msg || 'Failed to delete show.');
        }
    };

    // Filtered movies
    const filteredMovies = movies.filter(m => {
        const query = searchTerm.toLowerCase();
        return (
            m.title?.toLowerCase().includes(query) ||
            m.language?.toLowerCase().includes(query) ||
            (Array.isArray(m.genre) && m.genre.some(g => g.toLowerCase().includes(query)))
        );
    });

    // Platform Analytics Calculations
    const confirmedBookings = allBookings.filter(b => b.status === 'Confirmed');
    const totalPlatformRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalSeatsBooked = confirmedBookings.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);

    // Preset Sample Poster URLs
    const samplePosters = [
        { label: 'Sci-Fi / Space', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80' },
        { label: 'Cinema / Popcorn', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80' },
        { label: 'Action / Neon', url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80' }
    ];

    if (!isAuthorizedAdmin) {
        return (
            <div className="container mt-5 text-center">
                <div className="card shadow-sm p-5 mx-auto border-0" style={{ maxWidth: '520px' }}>
                    <div className="display-3 text-warning mb-3">🛡️</div>
                    <h3 className="fw-bold mb-2">Admin Clearance Required</h3>
                    <p className="text-muted mb-4">
                        You must be signed in with an authorized Administrator profile to access this management dashboard.
                    </p>
                    <div className="alert alert-info text-start small mb-4">
                        <strong>Evaluation Credentials:</strong>
                        <ul className="mb-0 mt-1">
                            <li>Email: <code>admin@imovies.com</code></li>
                            <li>Password: <code>admin123</code></li>
                        </ul>
                    </div>
                    <button className="btn btn-danger w-100 fw-bold" onClick={() => navigate('/login')}>
                        Log In as Admin
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading administrative dashboard...</p>
            </div>
        );
    }

    return (
        <div className="container py-4">
            {/* Admin Header Banner */}
            <div className="card shadow-sm mb-4 border-0 bg-dark text-white rounded-3">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <span className="badge bg-warning text-dark mb-2 px-3 py-1 fw-bold">ADMIN CONTROL PANEL</span>
                            <h2 className="fw-bold mb-1">IMovies Management Suite</h2>
                            <p className="text-secondary mb-0">
                                Welcome back, <strong>{userName}</strong>! Monitor sales, schedule showtimes, and manage movies.
                            </p>
                        </div>
                        <div className="d-flex gap-3 text-center">
                            <div className="bg-secondary bg-opacity-25 px-3 py-2 rounded-3 border border-secondary border-opacity-50">
                                <div className="fs-4 fw-bold text-danger">{movies.length}</div>
                                <div className="small text-secondary">Active Movies</div>
                            </div>
                            <div className="bg-secondary bg-opacity-25 px-3 py-2 rounded-3 border border-secondary border-opacity-50">
                                <div className="fs-4 fw-bold text-success">₹{totalPlatformRevenue}</div>
                                <div className="small text-secondary">Total Revenue</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Alert */}
            {statusMsg.text && (
                <div className={`alert alert-${statusMsg.type} alert-dismissible fade show`} role="alert">
                    <strong>{statusMsg.type === 'success' ? '✓ ' : '⚠ '}</strong>
                    {statusMsg.text}
                </div>
            )}

            {/* Navigation Tabs */}
            <ul className="nav nav-pills mb-4 bg-white p-2 rounded-3 shadow-sm border">
                <li className="nav-item">
                    <button
                        className={`nav-link fw-semibold ${activeTab === 'movies' ? 'active bg-danger text-white' : 'text-dark'}`}
                        onClick={() => setActiveTab('movies')}
                    >
                        🎬 Movies Catalog ({movies.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link fw-semibold ${activeTab === 'shows' ? 'active bg-danger text-white' : 'text-dark'}`}
                        onClick={() => setActiveTab('shows')}
                    >
                        🕒 Theater Showtimes ({shows.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link fw-semibold ${activeTab === 'overview' ? 'active bg-danger text-white' : 'text-dark'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Platform Analytics & Bookings ({allBookings.length})
                    </button>
                </li>
            </ul>

            {/* TAB 1: MOVIES CATALOG */}
            {activeTab === 'movies' && (
                <div className="row g-4">
                    {/* Add / Edit Movie Form */}
                    <div className="col-lg-5">
                        <div className="card shadow-sm border-0 sticky-top" style={{ top: '20px' }}>
                            <div className="card-header bg-danger text-white py-3 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">
                                    {isEditing ? '✏️ Edit Movie Listing' : '🎬 Add New Movie'}
                                </h5>
                                {isEditing && (
                                    <button className="btn btn-sm btn-outline-light" onClick={resetMovieForm}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleMovieSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small">Movie Title *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            className="form-control"
                                            placeholder="e.g. Dune: Part Two"
                                            value={movieForm.title}
                                            onChange={handleMovieInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="row g-2 mb-3">
                                        <div className="col-7">
                                            <label className="form-label fw-semibold small">Genre(s) *</label>
                                            <input
                                                type="text"
                                                name="genre"
                                                className="form-control"
                                                placeholder="Action, Sci-Fi"
                                                value={movieForm.genre}
                                                onChange={handleMovieInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-5">
                                            <label className="form-label fw-semibold small">Language</label>
                                            <select
                                                name="language"
                                                className="form-select"
                                                value={movieForm.language}
                                                onChange={handleMovieInputChange}
                                            >
                                                <option value="English">English</option>
                                                <option value="Hindi">Hindi</option>
                                                <option value="Telugu">Telugu</option>
                                                <option value="Tamil">Tamil</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label fw-semibold small">Duration (mins) *</label>
                                            <input
                                                type="number"
                                                name="duration"
                                                className="form-control"
                                                placeholder="165"
                                                min="1"
                                                value={movieForm.duration}
                                                onChange={handleMovieInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label fw-semibold small">Rating (0-10)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                name="rating"
                                                className="form-control"
                                                placeholder="8.8"
                                                min="0"
                                                max="10"
                                                value={movieForm.rating}
                                                onChange={handleMovieInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small">Poster Image URL</label>
                                        <input
                                            type="url"
                                            name="posterUrl"
                                            className="form-control"
                                            placeholder="https://..."
                                            value={movieForm.posterUrl}
                                            onChange={handleMovieInputChange}
                                        />
                                        <div className="mt-2">
                                            <span className="small text-muted me-1">Quick Presets:</span>
                                            {samplePosters.map((p, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary me-1 py-0 px-2"
                                                    style={{ fontSize: '0.75rem' }}
                                                    onClick={() => setMovieForm(prev => ({ ...prev, posterUrl: p.url }))}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {movieForm.posterUrl && (
                                        <div className="mb-3 text-center bg-light p-2 rounded border">
                                            <img
                                                src={movieForm.posterUrl}
                                                alt="Preview"
                                                className="rounded shadow-sm"
                                                style={{ maxHeight: '120px', objectFit: 'cover' }}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    )}

                                    <div className="d-flex gap-2 mt-4">
                                        <button type="submit" className="btn btn-danger w-100 fw-bold">
                                            {isEditing ? '💾 Update Movie' : '+ Add Movie to Catalog'}
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary" onClick={resetMovieForm}>
                                            Clear
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Movie Table List */}
                    <div className="col-lg-7">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white py-3">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                    <h5 className="mb-0 fw-bold">
                                        🎞️ Live Movies ({filteredMovies.length})
                                    </h5>
                                    <div style={{ maxWidth: '220px' }}>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="🔍 Search movies..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Poster</th>
                                                <th>Movie Details</th>
                                                <th>Duration</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredMovies.map(movie => (
                                                <tr key={movie._id}>
                                                    <td style={{ width: '60px' }}>
                                                        <img
                                                            src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=150&q=80'}
                                                            alt={movie.title}
                                                            className="rounded"
                                                            style={{ width: '45px', height: '60px', objectFit: 'cover' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold text-dark">{movie.title}</div>
                                                        <div className="small text-muted">
                                                            {movie.language} • {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-light text-dark border">
                                                            ⏱️ {movie.duration}m
                                                        </span>
                                                    </td>
                                                    <td className="text-end">
                                                        <div className="btn-group btn-group-sm">
                                                            <button
                                                                className="btn btn-outline-primary"
                                                                onClick={() => handleEditMovie(movie)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDeleteMovie(movie._id, movie.title)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: THEATER SHOWTIMES */}
            {activeTab === 'shows' && (
                <div className="row g-4">
                    {/* Add Show Form */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-danger text-white py-3">
                                <h5 className="mb-0 fw-bold">🕒 Schedule New Showtime</h5>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleShowSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small">Select Movie</label>
                                        <select
                                            className="form-select"
                                            value={showForm.movie}
                                            onChange={(e) => setShowForm(prev => ({ ...prev, movie: e.target.value }))}
                                            required
                                        >
                                            {movies.map(m => (
                                                <option key={m._id} value={m._id}>{m.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small">Select Cinema Theater</label>
                                        <select
                                            className="form-select"
                                            value={showForm.theater}
                                            onChange={(e) => setShowForm(prev => ({ ...prev, theater: e.target.value }))}
                                            required
                                        >
                                            {theaters.map(t => (
                                                <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label fw-semibold small">Showtime</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. 06:45 PM"
                                                value={showForm.showTime}
                                                onChange={(e) => setShowForm(prev => ({ ...prev, showTime: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label fw-semibold small">Base Price (₹)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="50"
                                                value={showForm.ticketPrice}
                                                onChange={(e) => setShowForm(prev => ({ ...prev, ticketPrice: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small">Show Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={showForm.showDate}
                                            onChange={(e) => setShowForm(prev => ({ ...prev, showDate: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-danger w-100 fw-bold">
                                        + Schedule Showtime
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Shows List Table */}
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white py-3">
                                <h5 className="mb-0 fw-bold">📅 Active Showtimes ({shows.length})</h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Movie</th>
                                                <th>Theater</th>
                                                <th>Time</th>
                                                <th>Price</th>
                                                <th>Booked</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {shows.map(show => (
                                                <tr key={show._id}>
                                                    <td className="fw-semibold text-dark">{show.movie?.title || 'Movie'}</td>
                                                    <td className="small">{show.theater?.name || 'Theater'} ({show.theater?.city})</td>
                                                    <td><span className="badge bg-danger">{show.showTime}</span></td>
                                                    <td>₹{show.ticketPrice}</td>
                                                    <td><span className="badge bg-secondary">{show.bookedSeats?.length || 0} seats</span></td>
                                                    <td className="text-end">
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => handleDeleteShow(show._id)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: PLATFORM ANALYTICS & SYSTEM BOOKINGS */}
            {activeTab === 'overview' && (
                <div>
                    {/* Metrics Row */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 text-center bg-light rounded-3">
                                <div className="fs-3 fw-bold text-danger">{allBookings.length}</div>
                                <div className="small text-muted fw-semibold">Total Reservations</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 text-center bg-light rounded-3">
                                <div className="fs-3 fw-bold text-success">₹{totalPlatformRevenue}</div>
                                <div className="small text-muted fw-semibold">Platform Revenue</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 text-center bg-light rounded-3">
                                <div className="fs-3 fw-bold text-warning">{totalSeatsBooked}</div>
                                <div className="small text-muted fw-semibold">Total Seats Booked</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 text-center bg-light rounded-3">
                                <div className="fs-3 fw-bold text-primary">{theaters.length}</div>
                                <div className="small text-muted fw-semibold">Partner Theaters</div>
                            </div>
                        </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold">📋 System-Wide Bookings Log</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Ref ID</th>
                                            <th>User Name</th>
                                            <th>Movie</th>
                                            <th>Seats</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allBookings.map(b => (
                                            <tr key={b._id}>
                                                <td className="fw-bold small">{b.bookingReference || `#${b._id.slice(-6).toUpperCase()}`}</td>
                                                <td>
                                                    <div className="fw-semibold">{b.userId?.name || 'Customer'}</div>
                                                    <div className="small text-muted">{b.userId?.email || 'N/A'}</div>
                                                </td>
                                                <td className="fw-semibold">{b.movieTitle}</td>
                                                <td>
                                                    {b.seats && b.seats.map(s => (
                                                        <span key={s} className="badge bg-light text-dark border me-1">{s}</span>
                                                    ))}
                                                </td>
                                                <td className="fw-bold text-success">₹{b.totalAmount}</td>
                                                <td>
                                                    <span className={`badge ${b.status === 'Cancelled' ? 'bg-danger' : 'bg-success'}`}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
