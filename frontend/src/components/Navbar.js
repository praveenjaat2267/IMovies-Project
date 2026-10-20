import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        alert('Logged out successfully!');
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark cinematic-navbar px-3 px-md-4 sticky-top">
            <div className="container-fluid">
                {/* Brand Logo with Glowing Cinematic Gradient */}
                <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
                    <span className="fs-3" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 42, 95, 0.6))' }}>🎬</span>
                    <span className="brand-gradient fs-4 fw-bold">IMOVIES</span>
                    <span className="badge bg-danger ms-1 text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1.5px', padding: '3px 7px' }}>
                        PREMIERE
                    </span>
                </Link>

                <button 
                    className="navbar-toggler border-0" 
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

                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav align-items-lg-center gap-lg-2">
                        {/* Home Link */}
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/">Home</Link>
                        </li>

                        {token ? (
                            <>
                                {/* Module 1: My Bookings Navigation Link */}
                                <li className="nav-item">
                                    <Link className="nav-link px-3 fw-semibold" to="/my-bookings">
                                        🎟️ My Bookings
                                    </Link>
                                </li>

                                {/* Module 2: Admin Dashboard Link (if user is admin) */}
                                {userRole === 'admin' && (
                                    <li className="nav-item">
                                        <Link className="nav-link px-3 text-warning fw-semibold" to="/admin">
                                            🛡️ Admin Panel
                                        </Link>
                                    </li>
                                )}

                                {/* User Greeting Badge */}
                                <li className="nav-item ms-lg-3 my-2 my-lg-0">
                                    <Link to="/profile" className="text-decoration-none">
                                        <span className="badge bg-secondary py-2 px-3 d-inline-flex align-items-center gap-2" style={{ borderRadius: '50px' }}>
                                            <span className="rounded-circle bg-danger text-white d-inline-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>
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
                                    <Link className="btn btn-danger btn-sm text-white px-4 py-2 ms-lg-2 rounded-pill shadow" to="/register">
                                        Get Started
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;