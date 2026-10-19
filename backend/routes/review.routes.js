const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, reviewController.addReview);
router.get('/movie/:movieId', reviewController.getMovieReviews);

module.exports = router;
