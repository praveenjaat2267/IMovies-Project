const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Payment = require('../models/Payment');

// @desc    Create a new movie booking & record payment
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
    try {
        const { movieId, movieTitle, theaterId, theaterName, showId, showTime, showDate, seats, totalAmount, paymentMethod } = req.body;

        // Input validation
        if (!movieId) {
            return res.status(400).json({ msg: 'Movie ID is required' });
        }
        if (!movieTitle || !movieTitle.trim()) {
            return res.status(400).json({ msg: 'Movie title is required' });
        }
        if (!seats || !Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({ msg: 'Please select at least one seat to book' });
        }
        if (totalAmount === undefined || totalAmount === null || totalAmount <= 0) {
            return res.status(400).json({ msg: 'Valid total amount is required' });
        }

        // If showId is provided, verify seat collision and lock seats
        if (showId) {
            const show = await Show.findById(showId);
            if (show) {
                const alreadyBooked = seats.filter(s => show.bookedSeats.includes(s));
                if (alreadyBooked.length > 0) {
                    return res.status(400).json({
                        msg: `Seats [${alreadyBooked.join(', ')}] have already been booked by another viewer. Please choose other seats.`
                    });
                }

                // Verify seats are not locked by another customer
                const now = new Date();
                const lockedByOthers = (show.lockedSeats || []).filter(
                    l => seats.includes(l.seatNumber) &&
                         l.userId.toString() !== req.user.id &&
                         new Date(l.expiresAt) > now
                );
                if (lockedByOthers.length > 0) {
                    return res.status(409).json({
                        msg: `Seat(s) [${lockedByOthers.map(l => l.seatNumber).join(', ')}] are currently held by another viewer. Please select other seats.`
                    });
                }

                // Add to booked seats in the show document
                show.bookedSeats.push(...seats);

                // Release seat locks for these seats
                if (show.lockedSeats && show.lockedSeats.length > 0) {
                    show.lockedSeats = show.lockedSeats.filter(l => !seats.includes(l.seatNumber));
                }

                await show.save();
            }
        }

        // Create booking record
        const newBooking = new Booking({
            userId: req.user.id,
            movieId,
            movieTitle: movieTitle.trim(),
            theaterId: theaterId || undefined,
            theaterName: theaterName ? theaterName.trim() : 'IMovies Grand Screen',
            showId: showId || undefined,
            showTime: showTime || '07:30 PM',
            showDate: showDate ? new Date(showDate) : new Date(),
            seats,
            totalAmount: Number(totalAmount),
            status: 'Confirmed',
            paymentStatus: 'Paid',
            paymentMethod: paymentMethod || 'UPI / Card'
        });

        const savedBooking = await newBooking.save();

        // Create associated Payment record
        const transactionId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const paymentRecord = new Payment({
            bookingId: savedBooking._id,
            userId: req.user.id,
            transactionId,
            amount: savedBooking.totalAmount,
            paymentMethod: paymentMethod === 'Card' ? 'Card' : 'UPI',
            status: 'Success'
        });
        await paymentRecord.save();

        res.status(201).json({
            success: true,
            booking: savedBooking,
            payment: paymentRecord
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all bookings made by the currently logged-in user
// @route   GET /api/bookings/user
// @access  Private
exports.getUserBookings = async (req, res, next) => {
    try {
        const userBookings = await Booking.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        res.json(userBookings);
    } catch (err) {
        next(err);
    }
};

// @desc    Get all bookings across the platform (Admin analytics)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res, next) => {
    try {
        const allBookings = await Booking.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json(allBookings);
    } catch (err) {
        next(err);
    }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name email');

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Verify ownership (or admin)
        if (booking.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized to view this booking' });
        }

        const payment = await Payment.findOne({ bookingId: booking._id });
        res.json({ booking, payment });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Booking not found' });
        }
        next(err);
    }
};

// @desc    Cancel a booking and release booked seats
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Check ownership or admin
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized to cancel this booking' });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ msg: 'This booking is already cancelled' });
        }

        // Release seats from show if applicable
        if (booking.showId) {
            const show = await Show.findById(booking.showId);
            if (show) {
                show.bookedSeats = show.bookedSeats.filter(s => !booking.seats.includes(s));
                await show.save();
            }
        }

        booking.status = 'Cancelled';
        booking.paymentStatus = 'Refunded';
        await booking.save();

        // Update payment record to Refunded
        await Payment.findOneAndUpdate(
            { bookingId: booking._id },
            { status: 'Refunded' }
        );

        res.json({
            msg: 'Booking cancelled successfully and refund processed',
            booking
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Booking not found' });
        }
        next(err);
    }
};
