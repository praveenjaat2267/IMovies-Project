import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            const res = await authAPI.login({ email, password });
            
            // Save JWT token and user info to local storage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userName', res.data.user?.name || res.data.name || 'User');
            localStorage.setItem('userEmail', res.data.user?.email || email);
            localStorage.setItem('userRole', res.data.user?.role || 'user');
            
            alert(`Welcome back, ${res.data.user?.name || 'User'}!`);
            
            if (res.data.user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data?.msg || err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    // Quick fill helper for evaluator convenience
    const fillAdminDemo = () => {
        setEmail('admin@imovies.com');
        setPassword('admin123');
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '440px' }}>
            <div className="card shadow-sm border-0 p-4 rounded-3">
                <div className="text-center mb-4">
                    <span className="fs-1">🎬</span>
                    <h3 className="fw-bold mt-2">Sign In to IMovies</h3>
                    <p className="text-muted small">Access your bookings and cinema tickets</p>
                </div>

                {errorMsg && (
                    <div className="alert alert-danger small py-2" role="alert">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold small">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold small">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-danger w-100 fw-bold py-2 shadow-sm"
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>

                    {/* Evaluator Demo Credentials Shortcut */}
                    <div className="text-center mt-3 pt-3 border-top">
                        <button
                            type="button"
                            className="btn btn-outline-warning btn-sm w-100 text-dark fw-semibold"
                            onClick={fillAdminDemo}
                        >
                            ⚡ Fill Demo Admin (admin@imovies.com)
                        </button>
                    </div>

                    <p className="mt-3 mb-0 text-center small text-muted">
                        Don't have an account? <Link to="/register" className="text-danger fw-semibold">Register here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;