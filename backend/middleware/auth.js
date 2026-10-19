const jwt = require('jsonwebtoken');

// Middleware to verify JWT token for logged-in users
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ msg: 'Access Denied: No authorization token provided' });
    }

    // Support both "Bearer <token>" and raw token format
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

    if (!token) {
        return res.status(401).json({ msg: 'Access Denied: Empty authorization token' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // contains { id, role, ... }
        next();
    } catch (err) {
        return res.status(401).json({ msg: 'Invalid or expired token. Please log in again.' });
    }
};

// Middleware to verify Admin privileges
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ msg: 'Access Denied: Admin privileges required' });
        }
    });
};

module.exports = { verifyToken, verifyAdmin };
