import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdminChecked, setIsAdminChecked] = useState(false);
    const [adminSecret, setAdminSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            const payload = {
                name: name.trim(),
                email: email.trim(),
                password: password,
                ...(isAdminChecked && adminSecret && { adminSecret: adminSecret.trim() })
            };

            const res = await authAPI.register(payload);

            // Auto-save session if token returned
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('userId', res.data.user?.id || res.data.user?._id || '');
                localStorage.setItem('userName', res.data.user.name);
                localStorage.setItem('userEmail', res.data.user.email);
                localStorage.setItem('userRole', res.data.user.role);
                alert(`Account created successfully! Welcome, ${res.data.user.name}.`);
                navigate(res.data.user.role === 'admin' ? '/admin' : '/');
            } else {
                alert('Registration successful! Please log in.');
                navigate('/login');
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data?.msg || err.response?.data?.message || 'Registration failed. Try a different email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '440px' }}>
            <div className="card shadow-sm border-0 p-4 rounded-3">
                <div className="text-center mb-4">
                    <span className="fs-1">🍿</span>
                    <h3 className="fw-bold mt-2">Create Account</h3>
                    <p className="text-muted small">Join IMovies to book seats & view booking history</p>
                </div>

                {errorMsg && (
                    <div className="alert alert-danger small py-2" role="alert">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold small">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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
                        <label className="form-label fw-semibold small">Password (Min 6 chars)</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Create password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength="6"
                            required
                        />
                    </div>

                    {/* Admin Registration Option */}
                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="adminCheckbox"
                            checked={isAdminChecked}
                            onChange={(e) => setIsAdminChecked(e.target.checked)}
                        />
                        <label className="form-check-label small text-muted" htmlFor="adminCheckbox">
                            Register as an Administrator
                        </label>
                    </div>

                    {isAdminChecked && (
                        <div className="mb-3 p-3 bg-light rounded border">
                            <label className="form-label fw-semibold small text-danger">Admin Secret Key</label>
                            <input
                                type="password"
                                className="form-control form-control-sm"
                                placeholder="Enter secret key (default: admin123)"
                                value={adminSecret}
                                onChange={(e) => setAdminSecret(e.target.value)}
                                required={isAdminChecked}
                            />
                            <div className="form-text small">Use 'admin123' to grant admin rights.</div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn btn-danger w-100 fw-bold py-2 shadow-sm"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <p className="mt-3 mb-0 text-center small text-muted">
                        Already have an account? <Link to="/login" className="text-danger fw-semibold">Login here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;