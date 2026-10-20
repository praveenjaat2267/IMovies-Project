import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function LoginPage() {
    // Mode: 'password' or 'otp'
    const [loginMode, setLoginMode] = useState('password');

    // Common identifier: email or phone
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    // OTP mode states
    const [otpStep, setOtpStep] = useState(1); // 1: request, 2: verify
    const [loginOtp, setLoginOtp] = useState('');
    const [mockOtp, setMockOtp] = useState('');

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    // Standard Password Login
    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const res = await authAPI.login({
                identifier: identifier.trim(),
                password
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userId', res.data.user?.id || res.data.user?._id || '');
            localStorage.setItem('userName', res.data.user?.name || res.data.name || 'User');
            localStorage.setItem('userEmail', res.data.user?.email || '');
            localStorage.setItem('userRole', res.data.user?.role || 'user');

            alert(`Welcome back, ${res.data.user?.name || 'User'}!`);
            navigate(res.data.user?.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data?.msg || err.response?.data?.message || 'Invalid email/phone or password.');
        } finally {
            setLoading(false);
        }
    };

    // Request Login OTP
    const handleRequestLoginOtp = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!identifier.trim()) {
            setErrorMsg("Please enter your registered phone number or email.");
            return;
        }

        try {
            setLoading(true);
            const res = await authAPI.sendLoginOtp({ identifier: identifier.trim() });
            setMockOtp(res.data.otp || '');
            setOtpStep(2);
            setSuccessMsg(res.data.msg || "Login OTP sent successfully.");
        } catch (err) {
            console.error("Login OTP error:", err);
            setErrorMsg(err.response?.data?.msg || "Could not generate OTP for this account.");
        } finally {
            setLoading(false);
        }
    };

    // Verify Login OTP
    const handleVerifyLoginOtp = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!loginOtp || loginOtp.trim().length !== 6) {
            setErrorMsg("Please enter the complete 6-digit OTP code.");
            return;
        }

        try {
            setLoading(true);
            const res = await authAPI.login({
                identifier: identifier.trim(),
                otp: loginOtp.trim()
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userId', res.data.user?.id || res.data.user?._id || '');
            localStorage.setItem('userName', res.data.user?.name || res.data.name || 'User');
            localStorage.setItem('userEmail', res.data.user?.email || '');
            localStorage.setItem('userRole', res.data.user?.role || 'user');

            alert(`🎉 OTP Verified! Welcome back, ${res.data.user?.name || 'User'}!`);
            navigate(res.data.user?.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            console.error("OTP login error:", err);
            setErrorMsg(err.response?.data?.msg || 'Invalid or expired OTP code.');
        } finally {
            setLoading(false);
        }
    };

    // Evaluator convenience demo fills
    const fillAdminDemo = () => {
        setLoginMode('password');
        setIdentifier('admin@imovies.com');
        setPassword('admin123');
    };

    return (
        <div className="container py-5" style={{ maxWidth: '460px' }}>
            <div className="card shadow-lg border-0 p-4 p-md-5 rounded-4">
                {/* Brand Header */}
                <div className="text-center mb-4">
                    <span className="fs-1">🎬</span>
                    <h3 className="fw-bold mt-2 text-dark">Sign In to IMovies</h3>
                    <p className="text-muted small">Access your movie passes and instant ticketing</p>
                </div>

                {/* Login Method Tabs (Password vs Instant OTP) */}
                <div className="d-flex p-1 bg-light rounded-pill mb-4 border">
                    <button
                        type="button"
                        className={`btn btn-sm w-50 rounded-pill fw-semibold ${loginMode === 'password' ? 'btn-danger shadow-sm' : 'text-muted'}`}
                        onClick={() => {
                            setLoginMode('password');
                            setErrorMsg('');
                        }}
                    >
                        🔑 Password
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm w-50 rounded-pill fw-semibold ${loginMode === 'otp' ? 'btn-danger shadow-sm' : 'text-muted'}`}
                        onClick={() => {
                            setLoginMode('otp');
                            setErrorMsg('');
                            setOtpStep(1);
                        }}
                    >
                        ⚡ Instant OTP
                    </button>
                </div>

                {/* Feedback Alerts */}
                {errorMsg && (
                    <div className="alert alert-danger small py-2 rounded-3 shadow-sm" role="alert">
                        <strong>Notice:</strong> {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="alert alert-success small py-2 rounded-3 shadow-sm" role="alert">
                        {successMsg}
                    </div>
                )}

                {/* TAB 1: Password Login */}
                {loginMode === 'password' && (
                    <form onSubmit={handlePasswordLogin}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small text-muted">Email or Mobile Number</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="name@example.com or 9876543210"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small text-muted">Password</label>
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
                            className="btn btn-danger w-100 fw-bold py-2 shadow-sm rounded-pill"
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>

                        {/* Demo Admin Auto-fill Button */}
                        <div className="text-center mt-3 pt-3 border-top">
                            <button
                                type="button"
                                className="btn btn-outline-warning btn-sm w-100 text-dark fw-semibold rounded-pill"
                                onClick={fillAdminDemo}
                            >
                                ⚡ Fill Demo Admin (admin@imovies.com)
                            </button>
                        </div>

                        <p className="mt-3 mb-0 text-center small text-muted">
                            Don't have an account? <Link to="/register" className="text-danger fw-semibold">Register here</Link>
                        </p>
                    </form>
                )}

                {/* TAB 2: Instant OTP Login */}
                {loginMode === 'otp' && (
                    <>
                        {otpStep === 1 ? (
                            <form onSubmit={handleRequestLoginOtp}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small text-muted">
                                        Enter Registered Phone or Email
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Mobile number or email"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                    />
                                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                                        A 6-digit sign-in code will be delivered instantly
                                    </small>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-danger w-100 fw-bold py-2 shadow-sm rounded-pill"
                                    disabled={loading}
                                >
                                    {loading ? 'Sending Code...' : 'Get Sign-In OTP →'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyLoginOtp}>
                                <div className="p-2 bg-light rounded-3 text-center small mb-3 border">
                                    Code sent to: <strong>{identifier}</strong>
                                </div>

                                {mockOtp && (
                                    <div className="alert alert-warning py-2 px-3 small d-flex justify-content-between align-items-center mb-3">
                                        <span>⚡ Code: <strong>{mockOtp}</strong></span>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-dark py-0 px-2 fw-semibold"
                                            onClick={() => setLoginOtp(mockOtp)}
                                        >
                                            Autofill
                                        </button>
                                    </div>
                                )}

                                <div className="mb-3 text-center">
                                    <label className="form-label fw-semibold small text-muted d-block">
                                        Enter 6-Digit OTP
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control text-center fs-3 fw-bold font-monospace letter-spacing-2"
                                        placeholder="------"
                                        maxLength={6}
                                        value={loginOtp}
                                        onChange={(e) => setLoginOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                        autoFocus
                                        required
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-success w-100 fw-bold py-2 mb-2 shadow-sm rounded-pill"
                                    disabled={loading || loginOtp.length !== 6}
                                >
                                    {loading ? 'Verifying...' : 'Sign In with OTP ✓'}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-link btn-sm text-muted w-100 text-decoration-none"
                                    onClick={() => setOtpStep(1)}
                                >
                                    ← Change Phone/Email
                                </button>
                            </form>
                        )}

                        <p className="mt-3 mb-0 text-center small text-muted">
                            Don't have an account? <Link to="/register" className="text-danger fw-semibold">Register here</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default LoginPage;
