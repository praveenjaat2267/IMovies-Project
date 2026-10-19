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
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm sticky-top">
            <div className="container-fluid">
                {/* Brand Logo */}
                <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" to="/">
                    <span className="text-danger">🎬</span> IMovies
                </Link>

                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav align-items-lg-center gap-lg-2">
                        {/* Home Link */}
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>

                        {token ? (
                            <>
                                {/* Module 1: My Bookings Navigation Link */}
                                <li className="nav-item">
                                    <Link className="nav-link fw-semibold" to="/my-bookings">
                                        🎟️ My Bookings
                                    </Link>
                                </li>

                                {/* Module 2: Admin Dashboard Link (if user is admin) */}
                                {userRole === 'admin' && (
                                    <li className="nav-item">
                                        <Link className="nav-link text-warning fw-semibold" to="/admin">
                                            🛡️ Admin Panel
                                        </Link>
                                    </li>
                                )}

                                {/* User Greeting Badge */}
                                <li className="nav-item ms-lg-3 my-2 my-lg-0">
                                    <span className="badge bg-secondary py-2 px-3 d-inline-flex align-items-center gap-1">
                                        👤 {userName || 'User'} {userRole === 'admin' && <span className="badge bg-warning text-dark ms-1">Admin</span>}
                                    </span>
                                </li>

                                {/* Logout Button */}
                                <li className="nav-item ms-lg-2">
                                    <button 
                                        className="btn btn-outline-danger btn-sm px-3" 
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-danger btn-sm text-white px-3 ms-lg-2" to="/register">
                                        Register
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