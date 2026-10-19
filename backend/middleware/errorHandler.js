// 404 Not Found Middleware
const notFound = (req, res, next) => {
    const error = new Error(`Resource Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Global Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Log unexpected 500 errors in console for debugging
    if (statusCode === 500) {
        console.error('Server Error:', err.message, err.stack);
    }

    res.status(statusCode).json({
        success: false,
        message: err.message || 'An unexpected server error occurred',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { notFound, errorHandler };
