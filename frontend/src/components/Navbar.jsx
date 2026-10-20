import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CITIES = [
    { id: 'delhi', name: 'Delhi NCR (IMAX)' },
    { id: 'mumbai', name: 'Mumbai' },
    { id: 'bengaluru', name: 'Bengaluru' },
    { id: 'hyderabad', name: 'Hyderabad' },
    { id: 'pune', name: 'Pune' },
    { id: 'chennai', name: 'Chennai' },
    { id: 'kolkata', name: 'Kolkata' },
    { id: 'ahmedabad', name: 'Ahmedabad' }
];

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

    // Theme Management: Light / Dark Mode Toggle
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });

    // City Location Selector: BookMyShow / District Style
    const [city, setCity] = useState(() => {
        return localStorage.getItem('userCity') || 'Delhi NCR (IMAX)';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        } else {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    const handleCityChange = (e) => {
        const newCity = e.target.value;
        setCity(newCity);
        localStorage.setItem('userCity', newCity);
        window.dispatchEvent(new CustomEvent('cityChanged', { detail: newCity }));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        alert('Logged out successfully!');
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg cinematic-navbar px-3 px-md-4 sticky-top">
            <div className="container-fluid">
                {/* Brand Logo with Glowing Cinematic Gradient */}
                <Link className="navbar-brand d-flex align-items-center gap-2 me-lg-4" to="/">
                    <span className="fs-3" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 42, 95, 0.6))' }}>🎬</span>
                    <span className="brand-gradient fs-4 fw-bold">IMOVIES</span>
                    <span className="badge bg-danger ms-1 text-uppercase d-none d-sm-inline" style={{ fontSize: '0.65rem', letterSpacing: '1.5px', padding: '3px 7px' }}>
                        PREMIERE
                    </span>
                </Link>

                {/* City Location Selector Dropdown (BookMyShow / District Style) */}
                <div className="d-flex align-items-center me-auto">
                    <div className="input-group input-group-sm">
                        <span className="input-group-text bg-transparent border-0 text-danger ps-0 pe-1">
                            📍
                        </span>
                        <select 
                            className="form-select form-select-sm bg-transparent border-0 fw-semibold text-truncate city-select cursor-pointer"
                            style={{ 
                                maxWidth: '170px', 
                                color: theme === 'light' ? '#0f172a' : '#f8fafc',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                            value={city}
                            onChange={handleCityChange}
                            aria-label="Select Cinema City"
                        >
                            {CITIES.map(c => (
                                <option key={c.id} value={c.name} className="text-dark bg-white">
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Mobile Menu Toggler */}
                <button 
                    className="navbar-toggler border-0 ms-2" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation"
                    style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end mt-3 mt-lg-0" id="navbarNav">
                    <ul className="navbar-nav align-items-lg-center gap-lg-2">
                        {/* Home Link */}
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/">Movies</Link>
                        </li>

                        {token ? (
                            <>
                                {/* My Bookings Link */}
                                <li className="nav-item">
                                    <Link className="nav-link px-3 fw-semibold" to="/my-bookings">
                                        🎟️ My Passes
                                    </Link>
                                </li>

                                {/* Admin Dashboard Link (if user is admin) */}
                                {userRole === 'admin' && (
                                    <li className="nav-item">
                                        <Link className="nav-link px-3 text-warning fw-semibold" to="/admin">
                                            🛡️ Admin Panel
                                        </Link>
                                    </li>
                                )}

                                {/* User Greeting Badge */}
                                <li className="nav-item ms-lg-2 my-2 my-lg-0">
                                    <Link to="/profile" className="text-decoration-none">
                                        <span className="badge bg-secondary py-2 px-3 d-inline-flex align-items-center gap-2 cursor-pointer shadow-sm" style={{ borderRadius: '50px' }}>
                                            <span className="rounded-circle bg-danger text-white d-inline-flex align-items-center justify-content-center fw-bold" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>
                                                {userName ? userName.charAt(0).toUpperCase() : 'U'}
                                            </span>
                                            <span className="text-white">{userName || 'Profile'}</span>
                                            {userRole === 'admin' && <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.65rem' }}>Admin</span>}
                                        </span>
                                    </Link>
                                </li>

                                {/* Logout Button */}
                                <li className="nav-item ms-lg-2">
                                    <button 
                                        className="btn btn-outline-danger btn-sm px-3 rounded-pill" 
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link px-3" to="/login">Sign In</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-danger btn-sm text-white px-3 py-2 ms-lg-2 rounded-pill shadow" to="/register">
                                        Get Started
                                    </Link>
                                </li>
                            </>
                        )}

                        {/* Light / Dark Mode Toggle Button */}
                        <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                            <button
                                type="button"
                                className={`btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1 shadow-sm ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark'}`}
                                onClick={toggleTheme}
                                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                            >
                                <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                                <span className="small fw-semibold">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
