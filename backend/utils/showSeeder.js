const Show = require('../models/Show');
const Theater = require('../models/Theater');

/**
 * THEATER CATALOG — Multi-city cinema network
 * 6 theaters across Mumbai, Delhi NCR, Bengaluru.
 */
const THEATER_CATALOG = [
    {
        name: 'PVR IMAX Phoenix',
        city: 'Mumbai',
        address: 'Phoenix Marketcity, Kurla West, Mumbai',
        screens: [
            { screenNumber: 1, screenType: 'IMAX 3D', totalSeats: 40 },
            { screenNumber: 2, screenType: '2D', totalSeats: 40 }
        ]
    },
    {
        name: 'INOX Megaplex',
        city: 'Delhi NCR',
        address: 'Nehru Place, Metro Station Complex, New Delhi',
        screens: [
            { screenNumber: 1, screenType: '4DX', totalSeats: 40 },
            { screenNumber: 2, screenType: '2D', totalSeats: 40 }
        ]
    },
    {
        name: 'Cinepolis Forum Mall',
        city: 'Bengaluru',
        address: 'Koramangala, Hosur Road, Bengaluru',
        screens: [
            { screenNumber: 1, screenType: '2D', totalSeats: 40 },
            { screenNumber: 2, screenType: '3D', totalSeats: 40 }
        ]
    },
    {
        name: 'PVR Directors Cut',
        city: 'Delhi NCR',
        address: 'Ambience Mall, Gurugram, Haryana',
        screens: [
            { screenNumber: 1, screenType: 'IMAX 3D', totalSeats: 40 }
        ]
    },
    {
        name: 'INOX R City',
        city: 'Mumbai',
        address: 'R City Mall, Ghatkopar West, Mumbai',
        screens: [
            { screenNumber: 1, screenType: '3D', totalSeats: 40 }
        ]
    },
    {
        name: 'Cinepolis Nexus',
        city: 'Bengaluru',
        address: 'Nexus Shantiniketan Mall, Whitefield, Bengaluru',
        screens: [
            { screenNumber: 1, screenType: '4DX', totalSeats: 40 }
        ]
    }
];

// 4 daily time slots
const SHOWTIME_SLOTS = ['10:30 AM', '02:15 PM', '06:30 PM', '09:45 PM'];

// Pricing by screen type
const SCREEN_PRICING = {
    '2D':      150,
    '3D':      200,
    'IMAX 3D': 350,
    '4DX':     280
};

/**
 * Ensure all THEATER_CATALOG entries exist in DB.
 * Returns array of theater documents.
 */
const ensureTheaters = async () => {
    const theaters = [];
    for (const t of THEATER_CATALOG) {
        const doc = await Theater.findOneAndUpdate(
            { name: t.name },
            { $set: t },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        theaters.push(doc);
    }
    return theaters;
};

/**
 * Seed multi-city shows for a single movie.
 * Each theater x slot gets one show document (idempotent — skips existing).
 */
const seedShowsForMovie = async (movieId, theaters) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const toInsert = [];

    for (const theater of theaters) {
        const screen = theater.screens && theater.screens[0];
        const screenType = screen ? screen.screenType : '2D';
        const screenNumber = screen ? screen.screenNumber : 1;
        const price = SCREEN_PRICING[screenType] || 150;

        for (const slot of SHOWTIME_SLOTS) {
            const existing = await Show.findOne({
                movie: movieId,
                theater: theater._id,
                showTime: slot,
                showDate: today
            });
            if (!existing) {
                toInsert.push({
                    movie: movieId,
                    theater: theater._id,
                    screenNumber,
                    showTime: slot,
                    showDate: today,
                    ticketPrice: price,
                    bookedSeats: [],
                    lockedSeats: []
                });
            }
        }
    }

    if (toInsert.length > 0) {
        await Show.insertMany(toInsert);
    }
    return toInsert.length;
};

/**
 * Master seeder: syncs theaters, then seeds all movies.
 */
const seedAllShows = async (movies) => {
    const theaters = await ensureTheaters();
    console.log(`[ShowSeeder] Synced ${theaters.length} theaters across 3 cities.`);

    let totalNew = 0;
    for (const movie of movies) {
        const count = await seedShowsForMovie(movie._id, theaters);
        totalNew += count;
    }

    const totalShows = await Show.countDocuments();
    console.log(`[ShowSeeder] +${totalNew} new show slots created. Total: ${totalShows}`);
    return theaters;
};

module.exports = { seedAllShows, seedShowsForMovie, ensureTheaters, THEATER_CATALOG, SHOWTIME_SLOTS, SCREEN_PRICING };
