const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user or admin
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, adminSecret, phone } = req.body;

        // Field presence validation
        if (!name || !name.trim()) {
            return res.status(400).json({ msg: "Name is required" });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ msg: "Email is required" });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ msg: "Please provide a valid email address" });
        }

        // Password length validation
        if (!password || password.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters long" });
        }

        // Check for existing user
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ msg: "An account with this email address already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Assign admin role if secret key matches
        const role = (adminSecret && adminSecret.trim() === (process.env.ADMIN_SECRET || 'admin123')) 
            ? 'admin' 
            : 'user';

        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role,
            phone: phone ? phone.trim() : ''
        });

        const savedUser = await newUser.save();

        // Sign JWT Token
        const token = jwt.sign(
            { id: savedUser._id, role: savedUser.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                phone: savedUser.phone
            },
            msg: "Registration successful"
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Authenticate user & return JWT token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({ msg: "Please enter your email" });
        }
        if (!password) {
            return res.status(400).json({ msg: "Please enter your password" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ msg: "Invalid credentials: user not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials: password incorrect" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: "User profile not found" });
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
};
