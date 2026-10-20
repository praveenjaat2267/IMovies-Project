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

// Helper to purge expired locks on a show document
const purgeExpiredLocks = async (show) => {
    if (!show || !show.lockedSeats || show.lockedSeats.length === 0) return false;
    const now = new Date();
    const activeLocks = show.lockedSeats.filter(l => new Date(l.expiresAt) > now);
    if (activeLocks.length !== show.lockedSeats.length) {
        show.lockedSeats = activeLocks;
        await show.save();
        return true;
    }
    return false;
};

// @desc    Get single show details by ID (including booked & locked seats)
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

        await purgeExpiredLocks(show);
        res.json(show);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Show not found' });
        }
        next(err);
    }
};

// @desc    Temporarily lock selected seats during checkout (Seat Locking Mechanism)
// @route   POST /api/shows/:id/lock-seats
// @access  Private
exports.lockSeats = async (req, res, next) => {
    try {
        const { seats, lockDurationMinutes } = req.body;
        const showId = req.params.id;

        if (!seats || !Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({ msg: 'Please provide an array of seats to lock' });
        }

        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).json({ msg: 'Show not found' });
        }

        await purgeExpiredLocks(show);

        // Check if any seat is already booked
        const alreadyBooked = seats.filter(seat => show.bookedSeats.includes(seat));
        if (alreadyBooked.length > 0) {
            return res.status(400).json({
                msg: `Seat(s) [${alreadyBooked.join(', ')}] have already been booked.`
            });
        }

        // Check if any seat is locked by another user
        const now = new Date();
        const lockedByOthers = (show.lockedSeats || []).filter(
            l => seats.includes(l.seatNumber) &&
                 l.userId.toString() !== req.user.id &&
                 new Date(l.expiresAt) > now
        );

        if (lockedByOthers.length > 0) {
            const lockedSeatNumbers = lockedByOthers.map(l => l.seatNumber);
            return res.status(409).json({
                msg: `Seat(s) [${lockedSeatNumbers.join(', ')}] are currently reserved by another customer. Please choose different seats.`,
                lockedSeats: lockedSeatNumbers
            });
        }

        const durationMinutes = Number(lockDurationMinutes) || 5;
        const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

        if (!show.lockedSeats) show.lockedSeats = [];

        // Remove any prior locks by this user on these seats
        show.lockedSeats = show.lockedSeats.filter(
            l => !(l.userId.toString() === req.user.id && seats.includes(l.seatNumber))
        );

        // Add new locks
        for (const seat of seats) {
            show.lockedSeats.push({
                seatNumber: seat,
                userId: req.user.id,
                lockedAt: new Date(),
                expiresAt
            });
        }

        await show.save();

        res.json({
            success: true,
            msg: `Seats [${seats.join(', ')}] locked for ${durationMinutes} minutes.`,
            lockedSeats: seats,
            expiresAt,
            lockTimeoutSeconds: durationMinutes * 60
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Release temporarily locked seats
// @route   POST /api/shows/:id/unlock-seats
// @access  Private
exports.unlockSeats = async (req, res, next) => {
    try {
        const { seats } = req.body;
        const showId = req.params.id;

        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).json({ msg: 'Show not found' });
        }

        if (!show.lockedSeats) show.lockedSeats = [];

        if (seats && Array.isArray(seats) && seats.length > 0) {
            show.lockedSeats = show.lockedSeats.filter(
                l => !(l.userId.toString() === req.user.id && seats.includes(l.seatNumber))
            );
        } else {
            // Unlock all seats held by this user for this show
            show.lockedSeats = show.lockedSeats.filter(
                l => l.userId.toString() !== req.user.id
            );
        }

        await show.save();

        res.json({
            success: true,
            msg: 'Seats released successfully.'
        });
    } catch (err) {
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
