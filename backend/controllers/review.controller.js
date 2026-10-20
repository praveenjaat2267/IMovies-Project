const Review = require('../models/Review');
const Movie = require('../models/Movie');
const User = require('../models/User');

// @desc    Add a review and rating for a movie
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
    try {
        const { movieId, rating, comment } = req.body;

        if (!movieId) {
            return res.status(400).json({ msg: 'Movie ID is required' });
        }
        if (!rating || Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({ msg: 'Rating must be between 1 and 5 stars' });
        }
        if (!comment || !comment.trim()) {
            return res.status(400).json({ msg: 'Review comment cannot be empty' });
        }

        const user = await User.findById(req.user.id);
        const userName = user ? user.name : 'Movie Fan';

        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ msg: 'Movie not found' });
        }

        const newReview = new Review({
            userId: req.user.id,
            userName,
            movieId,
            rating: Number(rating),
            comment: comment.trim()
        });

        const savedReview = await newReview.save();

        // Update embedded reviews array in Movie model
        if (!movie.reviews) movie.reviews = [];
        // Check if user already reviewed in embedded list
        const existingReviewIndex = movie.reviews.findIndex(
            r => r.userId && r.userId.toString() === req.user.id
        );
        if (existingReviewIndex !== -1) {
            movie.reviews[existingReviewIndex] = {
                userId: req.user.id,
                userName,
                rating: Number(rating),
                comment: comment.trim()
            };
        } else {
            movie.reviews.unshift({
                userId: req.user.id,
                userName,
                rating: Number(rating),
                comment: comment.trim()
            });
        }

        // Dynamically recalculate movie rating & count
        const allReviews = await Review.find({ movieId });
        if (allReviews.length > 0) {
            const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
            movie.rating = Math.round((avgRating * 2) * 10) / 10;
            movie.numReviews = allReviews.length;
        }
        await movie.save();

        res.status(201).json(savedReview);
    } catch (err) {
        next(err);
    }
};

// @desc    Get all reviews for a movie
// @route   GET /api/reviews/movie/:movieId
// @access  Public
exports.getMovieReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ movieId: req.params.movieId })
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        next(err);
    }
};
