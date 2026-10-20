const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'User reference is required'] 
    },
    userName: { 
        type: String, 
        required: [true, 'User name is required'],
        trim: true 
    },
    rating: { 
        type: Number, 
        required: [true, 'Rating is required (1-5)'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'] 
    },
    comment: { 
        type: String, 
        required: [true, 'Review comment is required'],
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters'] 
    }
}, {
    timestamps: true
});

const movieSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Movie title is required'], 
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        default: 'Experience this thrilling movie at IMovies Cinemas with cutting-edge Dolby Atmos sound and IMAX visual immersion.'
    },
    genre: { 
        type: [String], 
        required: [true, 'At least one genre is required'],
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: 'A movie must have at least one genre'
        }
    },
    language: { 
        type: String, 
        required: [true, 'Language is required'],
        default: 'English', 
        trim: true 
    },
    duration: { 
        type: Number, 
        required: [true, 'Duration in minutes is required'],
        min: [1, 'Duration must be at least 1 minute'],
        max: [600, 'Duration cannot exceed 600 minutes']
    },
    rating: {
        type: Number,
        min: [0, 'Rating cannot be negative'],
        max: [10, 'Rating cannot exceed 10'],
        default: 8.5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    reviews: [reviewSchema],
    posterUrl: { 
        type: String, 
        default: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80' 
    },
    bannerUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80'
    },
    showtimes: {
        type: [String],
        default: ['10:00 AM', '01:30 PM', '05:00 PM', '08:30 PM', '11:00 PM']
    },
    trailerUrl: {
        type: String,
        default: 'https://www.youtube.com'
    },
    releaseDate: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

const blockbusterMoviesSeeder = [
    {
        title: "Interstellar",
        description: "When Earth becomes uninhabitable, ex-NASA pilot Cooper and a crew of scientists travel through a wormhole in search of a new home for humankind.",
        genre: ["Sci-Fi", "Adventure", "Drama"],
        language: "English",
        duration: 169,
        rating: 8.7,
        posterUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
        showtimes: ["10:30 AM", "02:15 PM", "06:00 PM", "09:45 PM"]
    },
    {
        title: "The Dark Knight",
        description: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and DA Harvey Dent, until the anarchic Joker turns Gotham into chaos.",
        genre: ["Action", "Crime", "Drama"],
        language: "English",
        duration: 152,
        rating: 9.0,
        posterUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
        showtimes: ["11:00 AM", "03:30 PM", "07:15 PM", "10:30 PM"]
    },
    {
        title: "Oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
        genre: ["Biography", "Drama", "History"],
        language: "English",
        duration: 180,
        rating: 8.9,
        posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
        showtimes: ["09:45 AM", "01:15 PM", "05:30 PM", "09:15 PM"]
    },
    {
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        genre: ["Sci-Fi", "Adventure", "Action"],
        language: "English",
        duration: 166,
        rating: 8.8,
        posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
        showtimes: ["10:15 AM", "02:00 PM", "06:30 PM", "10:00 PM"]
    },
    {
        title: "Avatar: The Way of Water",
        description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns, Jake must work with Neytiri to protect their home.",
        genre: ["Sci-Fi", "Action", "Adventure"],
        language: "English",
        duration: 192,
        rating: 8.6,
        posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
        showtimes: ["11:30 AM", "03:45 PM", "08:00 PM", "11:15 PM"]
    },
    {
        title: "Avengers: Endgame",
        description: "After the devastating events of Infinity War, the universe is in ruins. The remaining Avengers assemble once more to reverse Thanos' actions.",
        genre: ["Action", "Sci-Fi", "Adventure"],
        language: "English",
        duration: 181,
        rating: 8.9,
        posterUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
        showtimes: ["10:00 AM", "02:30 PM", "06:45 PM", "10:15 PM"]
    },
    {
        title: "Inception",
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
        genre: ["Sci-Fi", "Action", "Thriller"],
        language: "English",
        duration: 148,
        rating: 8.8,
        posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
        showtimes: ["12:00 PM", "04:15 PM", "08:30 PM"]
    },
    {
        title: "Gladiator II",
        description: "Years after witnessing the death of Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors.",
        genre: ["Action", "Drama", "Adventure"],
        language: "English",
        duration: 148,
        rating: 8.5,
        posterUrl: "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=600&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1600&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=4rgYUipGJNo",
        showtimes: ["01:00 PM", "05:00 PM", "09:00 PM"]
    }
];

const Movie = mongoose.model('Movie', movieSchema);
Movie.blockbusters = blockbusterMoviesSeeder;

module.exports = Movie;