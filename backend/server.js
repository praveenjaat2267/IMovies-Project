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

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB Connected Successfully");

        // 1. Seed Movies if collection is empty
        const movieCount = await Movie.countDocuments();
        let seededMovies = [];
        if (movieCount === 0) {
            seededMovies = await Movie.create([
                {
                    title: "Inception",
                    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                    genre: ["Sci-Fi", "Action"],
                    language: "English",
                    duration: 148,
                    rating: 8.8,
                    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80"
                },
                {
                    title: "Interstellar",
                    description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.",
                    genre: ["Sci-Fi", "Adventure", "Drama"],
                    language: "English",
                    duration: 169,
                    rating: 8.7,
                    posterUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80"
                },
                {
                    title: "The Dark Knight",
                    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                    genre: ["Action", "Crime", "Drama"],
                    language: "English",
                    duration: 152,
                    rating: 9.0,
                    posterUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80"
                }
            ]);
            console.log("Sample movies seeded successfully!");
        } else {
            seededMovies = await Movie.find().limit(3);
        }

        // 2. Seed Theaters if collection is empty
        const theaterCount = await Theater.countDocuments();
        let seededTheaters = [];
        if (theaterCount === 0) {
            seededTheaters = await Theater.create([
                {
                    name: "PVR IMAX Phoenix",
                    city: "Mumbai",
                    address: "Phoenix Marketcity, Kurla West",
                    screens: [
                        { screenNumber: 1, screenType: 'IMAX 3D', totalSeats: 40 },
                        { screenNumber: 2, screenType: '2D', totalSeats: 40 }
                    ]
                },
                {
                    name: "INOX Megaplex",
                    city: "Delhi",
                    address: "Nehru Place, Metro Station Complex",
                    screens: [
                        { screenNumber: 1, screenType: '4DX', totalSeats: 40 },
                        { screenNumber: 2, screenType: '2D', totalSeats: 40 }
                    ]
                },
                {
                    name: "Cinepolis Forum Mall",
                    city: "Bengaluru",
                    address: "Koramangala, Hosur Road",
                    screens: [
                        { screenNumber: 1, screenType: '2D', totalSeats: 40 }
                    ]
                }
            ]);
            console.log("Sample theaters seeded successfully!");
        } else {
            seededTheaters = await Theater.find().limit(3);
        }

        // 3. Seed Shows if collection is empty
        const showCount = await Show.countDocuments();
        if (showCount === 0 && seededMovies.length > 0 && seededTheaters.length > 0) {
            const showTimes = ["10:30 AM", "02:15 PM", "06:45 PM", "09:30 PM"];
            const showsToCreate = [];

            for (const movie of seededMovies) {
                for (let i = 0; i < seededTheaters.length; i++) {
                    const theater = seededTheaters[i];
                    showsToCreate.push({
                        movie: movie._id,
                        theater: theater._id,
                        screenNumber: 1,
                        showTime: showTimes[i % showTimes.length],
                        showDate: new Date(),
                        ticketPrice: 150 + (i * 50),
                        bookedSeats: ['A1', 'B2']
                    });
                }
            }
            await Show.create(showsToCreate);
            console.log(`Created ${showsToCreate.length} active movie shows and schedules!`);
        }

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
                phone: '+91 9876543210'
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