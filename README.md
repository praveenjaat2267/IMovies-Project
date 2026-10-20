# 🎬 IMovies — Premier Cinematic Ticket Booking Experience

> Inspired by BookMyShow & District. Built on the MERN stack for a production-grade movie ticket booking platform.

---

## 🌟 Project Overview

**IMovies** is a full-stack, production-grade movie ticket booking web application engineered on the **MERN** stack. It delivers a cinematic, immersive user experience inspired by premium platforms like BookMyShow and District — featuring dynamic spotlight banners, interactive tiered seat selection, scannable QR e-tickets, dual-factor OTP authentication, and a real-time cinema admin console.

---

## 🚀 Key Features

### 🎥 Real-World Blockbuster Catalog
- Curated database of **8 real-world blockbusters**: Interstellar, The Dark Knight, Oppenheimer, Dune: Part Two, Avatar: The Way of Water, Avengers: Endgame, Inception, and Gladiator II.
- Each movie has `title`, `description`, `genre`, `language`, `duration`, `rating`, `posterUrl`, `bannerUrl`, `trailerUrl`, and `showtimes`.
- **Dynamic Spotlight Hero Banners** on the Home page for an immersive cinematic feel.
- Auto-seeding on server startup — no manual DB population required.

### 🔐 Dual-Factor Authentication (Email + Phone OTP)
- Registration requires **both a unique email and a unique phone number**.
- On sign-up, a **6-digit OTP** is generated and must be verified before login is granted.
- Fields: `isEmailVerified`, `isPhoneVerified`, `emailOtp`, `phoneOtp`, `otpExpiresAt` (10-minute TTL).
- Phone-based login OTP flow via `POST /api/auth/send-login-otp`.
- JWT tokens issued on successful verification for stateless, secure sessions.
- Passwords hashed with **bcrypt** (salt rounds: 10).

### 🌙 Light & Dark Mode Theme Toggle
- System-wide theme toggle between **Dark Mode** (cinematic dark navy) and **Light Mode**.
- Seamless transitions with CSS custom properties; preference stored in `localStorage`.
- Accessible toggle button in the Navbar.

### 🪑 Interactive Multi-Tier Seat Selection
- **5-row seating grid** (A–E), 8 seats per row, 40 seats per screen.
- Tiered pricing:
  - Row A — **VIP** (1.5× base price)
  - Row B–C — **Premium** (1.25× base price)
  - Row D–E — **Standard** (1.0× base price)
- Real-time total amount calculation as seats are selected.
- **Seat Locking Mechanism**: Selected seats are temporarily locked for **5 minutes** while the user completes checkout, preventing double-bookings.
- Live countdown timer displayed during the lock period.
- Seats locked by other users are visually flagged as unavailable.
- Auto-unlock on page exit or timer expiry.

### 📱 Scannable QR Code E-Tickets
- Every confirmed booking generates a **unique, scannable QR e-ticket** encoded with booking reference, movie, seats, showtime, theater, and verification status.
- QR codes are displayed on:
  - ✅ The **Booking Confirmation** modal immediately after payment.
  - ✅ The **My Profile** page alongside each booking card.
- Tap/click to expand into a full **Digital Boarding Pass** modal with high-resolution QR.
- **Print Pass** button for physical ticket printing.
- Cancelled bookings display a greyed-out "Cancelled Pass" QR.

### 📝 User Reviews & Ratings
- Embedded `reviewSchema` within the Movie model: `userId`, `userName`, `rating` (1–5 stars), `comment`.
- Dedicated `Review` collection with `movieId` reference for scalable querying.
- Interactive **star rating UI** on the Movie Details page.
- Reviews are displayed with user name, rating stars, and timestamp.
- Protected route: only authenticated users can submit reviews.

### 🏛️ Booking History & User Profile
- `/profile` — Authenticated user dashboard showing:
  - User avatar (initial), name, email, role badge (User / Administrator).
  - Quick stats: Active Passes count, Total Seats Booked, Total Amount Spent.
  - Filterable booking list: **All | Confirmed | Cancelled**.
  - Each booking card shows movie title, theater, showtime, seats, amount, and **QR e-ticket**.
  - **Cancel Booking** with instant refund status.

### 🎛️ Cinema Admin Console
- Protected `/admin` route (role: `admin`).
- Real-time **Revenue Tracking** and **Booking Analytics**.
- Movie Management: Add, edit, and manage the movie catalog.
- Show/Showtime scheduling across partner theaters.
- View system-wide booking logs.
- Default admin credentials: `admin@imovies.com` / `admin123`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 (CRA), React Router v6, Axios, Bootstrap 5 |
| **Backend** | Node.js, Express.js 4 |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (jsonwebtoken), Bcrypt.js |
| **QR Codes** | `qrcode.react` (QRCodeSVG) |
| **Styling** | Vanilla CSS, Bootstrap 5, Google Fonts |
| **Dev Tools** | Nodemon, dotenv, concurrently |

---

## 📁 Project Structure

```
IMovies-Project/
│
├── backend/
│   ├── controllers/         # Business logic (auth, movies, bookings, shows, reviews)
│   │   ├── auth.controller.js
│   │   ├── movie.controller.js
│   │   ├── booking.controller.js
│   │   ├── show.controller.js
│   │   └── review.controller.js
│   ├── models/              # Mongoose schemas
│   │   ├── User.js          # email, phone, OTP fields, verification flags
│   │   ├── Movie.js         # reviewSchema, blockbuster seeder data
│   │   ├── Show.js          # lockedSeats[], bookedSeats[]
│   │   ├── Booking.js       # bookingReference, seats, totalAmount
│   │   ├── Theater.js
│   │   ├── Review.js
│   │   └── Admin.js
│   ├── routes/              # Express API routes
│   │   ├── auth.routes.js
│   │   ├── movie.routes.js
│   │   ├── booking.routes.js
│   │   ├── show.routes.js
│   │   ├── review.routes.js
│   │   └── theater.routes.js
│   ├── middleware/
│   │   ├── auth.js          # JWT verifyToken middleware
│   │   └── errorHandler.js  # Centralized error handling
│   ├── server.js            # Express app, MongoDB connection, auto-seeding
│   └── .env                 # Environment variables (not committed)
│
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   ├── Navbar.jsx       # Navigation + theme toggle
        │   └── QRCodeTicket.jsx # Scannable QR e-ticket component
        ├── pages/
        │   ├── Home.js          # Spotlight banners, movie catalog
        │   ├── MovieDetails.js  # Movie info, reviews, booking CTA
        │   ├── Booking.js       # Seat selection, locking, payment, QR confirmation
        │   ├── ProfilePage.jsx  # User profile, booking history, QR tickets
        │   ├── AdminDashboard.js
        │   ├── LoginPage.jsx    # Email + OTP login
        │   └── RegisterPage.jsx # Dual registration (email + phone)
        ├── services/
        │   └── api.js           # Axios instance + all API calls
        ├── App.js
        ├── App.css
        └── index.css            # Cinematic dark/light theme variables
```

---

## ⚡ Local Installation & Setup

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- A **MongoDB Atlas** cluster (free tier works)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/praveenjaat2267/IMovies-Project.git
cd IMovies-Project
```

### 2. Configure Backend Environment

```bash
cd backend
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/imovies?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
ADMIN_SECRET=admin123
```

> ⚠️ Never commit `.env` to version control.

### 3. Install Backend Dependencies & Start

```bash
npm install
npm run dev
```

The backend starts at **http://localhost:5000**. On first startup, it auto-seeds:
- 8 blockbuster movies with banners & showtimes
- 3 partner theaters (PVR IMAX, INOX Megaplex, Cinepolis)
- Show schedules for all movie-theater combinations
- Default admin account: `admin@imovies.com` / `admin123`

### 4. Install Frontend Dependencies & Start

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

The frontend starts at **http://localhost:3000** and proxies API calls to `localhost:5000`.

---

## 🔑 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register with name, email, phone, password | Public |
| POST | `/api/auth/verify-otp` | Verify email + phone OTP | Public |
| POST | `/api/auth/resend-otp` | Resend verification OTP | Public |
| POST | `/api/auth/login` | Login with email + password → JWT | Public |
| POST | `/api/auth/send-login-otp` | Request phone OTP for login | Public |
| GET | `/api/auth/me` | Get current user profile | 🔒 JWT |

### Movies

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/movies` | List all movies | Public |
| GET | `/api/movies/:id` | Get movie details + reviews | Public |
| POST | `/api/movies` | Create a new movie | 🔒 Admin |
| PUT | `/api/movies/:id` | Update movie details | 🔒 Admin |
| DELETE | `/api/movies/:id` | Delete a movie | 🔒 Admin |

### Shows & Seat Management

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/shows/movie/:movieId` | Get shows for a movie | Public |
| POST | `/api/shows/:id/lock-seats` | Temporarily lock selected seats (5 min) | 🔒 JWT |
| POST | `/api/shows/:id/unlock-seats` | Release locked seats | 🔒 JWT |

### Bookings

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/bookings` | Create a new booking | 🔒 JWT |
| GET | `/api/bookings/user` | Get current user's booking history | 🔒 JWT |
| PUT | `/api/bookings/:id/cancel` | Cancel a booking | 🔒 JWT |
| GET | `/api/bookings` | Get all bookings (admin) | 🔒 Admin |

### Reviews

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/reviews` | Submit a movie review | 🔒 JWT |
| GET | `/api/reviews/movie/:movieId` | Get reviews for a movie | Public |

---

## 🔐 Security Practices

- Passwords are **never stored in plaintext** — always hashed with `bcrypt` (10 salt rounds).
- JWT tokens are signed with a secret key and expire in **7 days**.
- OTP codes expire in **10 minutes** after generation.
- All sensitive routes protected by `verifyToken` middleware.
- Input validation on both client and server for all user-facing forms.
- CORS configured for frontend origin only in production.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the **MIT License**.

---

Built with ❤️ by Praveen | MERN Stack, 2025
