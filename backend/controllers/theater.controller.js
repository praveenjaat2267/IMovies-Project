const Theater = require('../models/Theater');

// @desc    Get all theaters with optional city filter
// @route   GET /api/theaters
// @access  Public
exports.getAllTheaters = async (req, res, next) => {
    try {
        const { city } = req.query;
        let query = {};
        if (city && city !== 'All') {
            query.city = { $regex: city.trim(), $options: 'i' };
        }

        const theaters = await Theater.find(query).sort({ name: 1 });
        res.json(theaters);
    } catch (err) {
        next(err);
    }
};

// @desc    Get theater by ID
// @route   GET /api/theaters/:id
// @access  Public
exports.getTheaterById = async (req, res, next) => {
    try {
        const theater = await Theater.findById(req.params.id);
        if (!theater) {
            return res.status(404).json({ msg: 'Theater not found' });
        }
        res.json(theater);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Theater not found' });
        }
        next(err);
    }
};

// @desc    Create a new theater
// @route   POST /api/theaters
// @access  Private/Admin
exports.createTheater = async (req, res, next) => {
    try {
        const { name, city, address, screens } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ msg: 'Theater name is required' });
        }
        if (!city || !city.trim()) {
            return res.status(400).json({ msg: 'City is required' });
        }

        const newTheater = new Theater({
            name: name.trim(),
            city: city.trim(),
            address: address ? address.trim() : undefined,
            screens: screens && screens.length > 0 ? screens : [
                { screenNumber: 1, screenType: 'IMAX 3D', totalSeats: 40 },
                { screenNumber: 2, screenType: '2D', totalSeats: 40 }
            ]
        });

        const savedTheater = await newTheater.save();
        res.status(201).json(savedTheater);
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a theater
// @route   DELETE /api/theaters/:id
// @access  Private/Admin
exports.deleteTheater = async (req, res, next) => {
    try {
        const deletedTheater = await Theater.findByIdAndDelete(req.params.id);
        if (!deletedTheater) {
            return res.status(404).json({ msg: 'Theater not found' });
        }
        res.json({ msg: 'Theater removed successfully', deletedId: req.params.id });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Theater not found' });
        }
        next(err);
    }
};
