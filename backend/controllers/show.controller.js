const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');

// @desc    Get all shows with movie & theater populated
// @route   GET /api/shows
// @access  Public
exports.getAllShows = async (req, res, next) => {
    try {
        const { movieId, theaterId } = req.query;
        let query = {};
        if (movieId) query.movie = movieId;
        if (theaterId) query.theater = theaterId;

        const shows = await Show.find(query)
            .populate('movie', 'title genre language duration posterUrl')
            .populate('theater', 'name city address')
            .sort({ showDate: 1, showTime: 1 });

        res.json(shows);
    } catch (err) {
        next(err);
    }
};

// @desc    Get shows by Movie ID
// @route   GET /api/shows/movie/:movieId
// @access  Public
exports.getShowsByMovie = async (req, res, next) => {
    try {
        const shows = await Show.find({ movie: req.params.movieId })
            .populate('theater', 'name city address screens')
            .sort({ showDate: 1, showTime: 1 });

        res.json(shows);
    } catch (err) {
        next(err);
    }
};

// @desc    Get single show details by ID (including booked seats)
// @route   GET /api/shows/:id
// @access  Public
exports.getShowById = async (req, res, next) => {
    try {
        const show = await Show.findById(req.params.id)
            .populate('movie')
            .populate('theater');

        if (!show) {
            return res.status(404).json({ msg: 'Show not found' });
        }
        res.json(show);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Show not found' });
        }
        next(err);
    }
};

// @desc    Create a new show
// @route   POST /api/shows
// @access  Private/Admin
exports.createShow = async (req, res, next) => {
    try {
        const { movie, theater, screenNumber, showTime, showDate, ticketPrice } = req.body;

        if (!movie) return res.status(400).json({ msg: 'Movie ID is required' });
        if (!theater) return res.status(400).json({ msg: 'Theater ID is required' });
        if (!showTime) return res.status(400).json({ msg: 'Show time is required' });

        const newShow = new Show({
            movie,
            theater,
            screenNumber: screenNumber || 1,
            showTime,
            showDate: showDate ? new Date(showDate) : new Date(),
            ticketPrice: ticketPrice ? Number(ticketPrice) : 150,
            bookedSeats: []
        });

        const savedShow = await newShow.save();
        const populated = await Show.findById(savedShow._id)
            .populate('movie', 'title')
            .populate('theater', 'name');

        res.status(201).json(populated);
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a show
// @route   DELETE /api/shows/:id
// @access  Private/Admin
exports.deleteShow = async (req, res, next) => {
    try {
        const deletedShow = await Show.findByIdAndDelete(req.params.id);
        if (!deletedShow) {
            return res.status(404).json({ msg: 'Show not found' });
        }
        res.json({ msg: 'Show deleted successfully', deletedId: req.params.id });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Show not found' });
        }
        next(err);
    }
};
