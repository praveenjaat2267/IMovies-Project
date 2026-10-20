const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Body Parser & CORS Configuration
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Modular MVC API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/movies', require('./routes/movie.routes'));
app.use('/api/theaters', require('./routes/theater.routes'));
app.use('/api/shows', require('./routes/show.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/reviews', require('./routes/review.routes'));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'IMovies RESTful API is running in MVC pattern',
        timestamp: new Date().toISOString()
    });
});

// Centralized Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Database Seeding & Connection
const Movie = require('./models/Movie');
const User = require('./models/User');
const Admin = require('./models/Admin');
const Theater = require('./models/Theater');
const Show = require('./models/Show');
const Review = require('./models/Review');
const { seedAllShows } = require('./utils/showSeeder');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB Connected Successfully");

        // 1. Seed or Upgrade Movies to 8 Real-World Blockbusters
        for (const movieData of (Movie.blockbusters || [])) {
            await Movie.findOneAndUpdate(
                { title: movieData.title },
                { $set: movieData },
                { upsert: true, new: true }
            );
        }
        const seededMovies = await Movie.find();
        console.log(`Synced ${seededMovies.length} blockbuster movies with banners & showtimes!`);

        // 2 & 3. Seed / Sync Theaters + Shows for all movies across all cities
        await seedAllShows(seededMovies);

        // 4. Seed Default Admin in User & Admin collections
        const adminExists = await User.findOne({ role: 'admin' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        if (!adminExists) {
            await User.create({
                username: 'admin',
                name: 'IMovies Admin',
                email: 'admin@imovies.com',
                password: hashedPassword,
                role: 'admin',
                phone: '+919876543210',
                isEmailVerified: true,
                isPhoneVerified: true
            });
            console.log("Default admin account created in User model: admin@imovies.com / admin123");
        }

        const adminModelExists = await Admin.findOne({ email: 'admin@imovies.com' });
        if (!adminModelExists) {
            await Admin.create({
                username: 'admin',
                email: 'admin@imovies.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log("Admin model seeded: admin@imovies.com / admin123");
        }

        // 5. Seed Sample Review if none exists
        const reviewCount = await Review.countDocuments();
        if (reviewCount === 0 && seededMovies.length > 0) {
            const adminUser = await User.findOne({ email: 'admin@imovies.com' });
            if (adminUser) {
                await Review.create({
                    userId: adminUser._id,
                    userName: adminUser.name,
                    movieId: seededMovies[0]._id,
                    rating: 5,
                    comment: "Mind-bending visual masterpiece by Christopher Nolan! Absolute must-watch on IMAX."
                });
                console.log("Sample review seeded!");
            }
        }
    })
    .catch((err) => console.error("Database connection error: ", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});