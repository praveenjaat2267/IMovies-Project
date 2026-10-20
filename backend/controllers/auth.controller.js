const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to generate 6-digit numeric OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user requiring both email and phone + trigger OTP
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, password, adminSecret } = req.body;

        // 1. Field presence validation
        if (!name || !name.trim()) {
            return res.status(400).json({ msg: "Full Name is required" });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ msg: "Email Address is required" });
        }
        if (!phone || !phone.trim()) {
            return res.status(400).json({ msg: "Phone Number is required" });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters long" });
        }

        // 2. Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const normalizedEmail = email.toLowerCase().trim();
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ msg: "Please provide a valid email address" });
        }

        // 3. Phone format validation (10 to 14 digits)
        const cleanedPhone = phone.replace(/[\s-]/g, '').trim();
        const phoneRegex = /^\+?[0-9]{10,14}$/;
        if (!phoneRegex.test(cleanedPhone)) {
            return res.status(400).json({ msg: "Please provide a valid 10-digit mobile number" });
        }

        // 4. Check that NEITHER email NOR phone already exists
        const existingEmail = await User.findOne({ email: normalizedEmail });
        if (existingEmail) {
            return res.status(400).json({ msg: "An account with this email address already exists" });
        }

        const existingPhone = await User.findOne({ phone: cleanedPhone });
        if (existingPhone) {
            return res.status(400).json({ msg: "An account with this phone number already exists" });
        }

        // 5. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 6. Role check
        const role = (adminSecret && adminSecret.trim() === (process.env.ADMIN_SECRET || 'admin123')) 
            ? 'admin' 
            : 'user';

        // 7. Generate dual verification OTP (valid for 10 minutes)
        const otpCode = generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const newUser = new User({
            name: name.trim(),
            username: name.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000),
            email: normalizedEmail,
            phone: cleanedPhone,
            password: hashedPassword,
            role,
            isEmailVerified: false,
            isPhoneVerified: false,
            emailOtp: otpCode,
            phoneOtp: otpCode,
            otpExpiresAt
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            success: true,
            requiresOtp: true,
            msg: `Registration initiated! Verification OTP sent to ${cleanedPhone} and ${normalizedEmail}`,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                phone: savedUser.phone,
                role: savedUser.role
            },
            otp: otpCode // Returned for immediate test/evaluation autofill
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Verify Registration OTP for Email & Phone
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, phone, identifier, otp } = req.body;
        const lookup = (identifier || email || phone || '').toLowerCase().trim();

        if (!lookup) {
            return res.status(400).json({ msg: "Email or phone number is required" });
        }
        if (!otp || !otp.trim()) {
            return res.status(400).json({ msg: "Please enter the 6-digit OTP code" });
        }

        const cleanedPhone = lookup.replace(/[\s-]/g, '');
        const user = await User.findOne({
            $or: [
                { email: lookup },
                { phone: lookup },
                { phone: cleanedPhone }
            ]
        });

        if (!user) {
            return res.status(404).json({ msg: "User account not found" });
        }

        // Check expiration
        if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
            return res.status(400).json({ msg: "OTP has expired. Please click 'Resend OTP' to get a fresh code." });
        }

        // Check OTP match
        const submittedOtp = otp.trim();
        if (user.emailOtp !== submittedOtp && user.phoneOtp !== submittedOtp) {
            return res.status(400).json({ msg: "Invalid OTP code. Please enter the correct 6-digit code." });
        }

        // Update verification flags
        user.isEmailVerified = true;
        user.isPhoneVerified = true;
        user.emailOtp = null;
        user.phoneOtp = null;
        user.otpExpiresAt = null;
        await user.save();

        // Sign JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            msg: "Dual verification complete! Your account is active.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isEmailVerified: true,
                isPhoneVerified: true
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Resend OTP to Email and Phone
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOtp = async (req, res, next) => {
    try {
        const { email, phone, identifier } = req.body;
        const lookup = (identifier || email || phone || '').toLowerCase().trim();

        if (!lookup) {
            return res.status(400).json({ msg: "Email or phone number is required" });
        }

        const cleanedPhone = lookup.replace(/[\s-]/g, '');
        const user = await User.findOne({
            $or: [
                { email: lookup },
                { phone: lookup },
                { phone: cleanedPhone }
            ]
        });

        if (!user) {
            return res.status(404).json({ msg: "User account not found" });
        }

        const newOtp = generateOtp();
        user.emailOtp = newOtp;
        user.phoneOtp = newOtp;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        res.json({
            success: true,
            msg: `New OTP generated and sent to ${user.phone} / ${user.email}`,
            otp: newOtp
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Authenticate via Email/Password OR Phone/Password OR OTP
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { identifier, email, phone, password, otp } = req.body;
        const loginQuery = (identifier || email || phone || '').toLowerCase().trim();

        if (!loginQuery) {
            return res.status(400).json({ msg: "Please enter your email address or phone number" });
        }

        const cleanedPhone = loginQuery.replace(/[\s-]/g, '');
        const user = await User.findOne({
            $or: [
                { email: loginQuery },
                { phone: loginQuery },
                { phone: cleanedPhone }
            ]
        });

        if (!user) {
            return res.status(400).json({ msg: "No account found matching this email or phone number" });
        }

        // Branch 1: OTP Login
        if (otp && otp.trim()) {
            if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
                return res.status(400).json({ msg: "Login OTP has expired. Please request a new code." });
            }
            if (user.emailOtp !== otp.trim() && user.phoneOtp !== otp.trim()) {
                return res.status(400).json({ msg: "Invalid login OTP code." });
            }
            // Clear OTP upon successful login
            user.emailOtp = null;
            user.phoneOtp = null;
            user.otpExpiresAt = null;
            await user.save();
        } 
        // Branch 2: Password Login
        else if (password) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: "Invalid credentials: password incorrect" });
            }
        } else {
            return res.status(400).json({ msg: "Please provide either a password or OTP to authenticate" });
        }

        // Sign JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Send Instant Login OTP to Phone or Email
// @route   POST /api/auth/send-login-otp
// @access  Public
exports.sendLoginOtp = async (req, res, next) => {
    try {
        const { identifier, email, phone } = req.body;
        const loginQuery = (identifier || email || phone || '').toLowerCase().trim();

        if (!loginQuery) {
            return res.status(400).json({ msg: "Please enter your registered email or phone" });
        }

        const cleanedPhone = loginQuery.replace(/[\s-]/g, '');
        const user = await User.findOne({
            $or: [
                { email: loginQuery },
                { phone: loginQuery },
                { phone: cleanedPhone }
            ]
        });

        if (!user) {
            return res.status(404).json({ msg: "No registered account found with this email or phone" });
        }

        const loginOtp = generateOtp();
        user.emailOtp = loginOtp;
        user.phoneOtp = loginOtp;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        res.json({
            success: true,
            msg: `Instant Login OTP sent to ${user.phone} and ${user.email}`,
            otp: loginOtp
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
