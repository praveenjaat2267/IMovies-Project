const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller');
const reviewController = require('../controllers/review.controller');
const { verifyAdmin, verifyToken } = require('../middleware/auth');

// Public catalog routes
router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);

// Movie Reviews nested endpoints
router.get('/:id/reviews', (req, res, next) => {
    req.params.movieId = req.params.id;
    return reviewController.getMovieReviews(req, res, next);
});
router.post('/:id/reviews', verifyToken, (req, res, next) => {
    req.body.movieId = req.params.id;
    return reviewController.addReview(req, res, next);
});

// Admin movie management routes
router.post('/', verifyAdmin, movieController.createMovie);
router.put('/:id', verifyAdmin, movieController.updateMovie);
router.delete('/:id', verifyAdmin, movieController.deleteMovie);

module.exports = router;
