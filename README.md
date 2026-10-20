<div align="center">

# 🎬 IMovies — Premier Cinematic Ticket Booking

**A production-grade MERN stack movie ticket booking platform**
*Inspired by BookMyShow & District*

![Version](https://img.shields.io/badge/version-2.0.0-red?style=for-the-badge)
![Stack](https://img.shields.io/badge/stack-MERN-00b4d8?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Year](https://img.shields.io/badge/year-2026-orange?style=for-the-badge)

</div>

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Local Setup & Installation](#-local-setup--installation)
- [API Reference](#-api-reference)
- [Security Practices](#-security-practices)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Project Overview

**IMovies** is a full-stack movie ticket booking web application built on the **MERN** stack. Inspired by premium platforms like **BookMyShow** and **District**, it delivers an immersive cinematic experience: dynamic spotlight hero banners, auto-generated multi-city showtimes, tiered seat selection with a 5-minute locking mechanism, scannable QR e-tickets, dual-factor OTP authentication, and a real-time cinema admin console.

> 🎥 Built with production practices in mind: idempotent database seeding, route-order-safe Express APIs, JWT-secured endpoints, and a city-tabbed booking UI that stays in sync with the admin console.

---

## 🚀 Key Features

### 🎞️ Real-World Blockbuster Catalog
- **8 real-world blockbusters** pre-loaded: *Interstellar, The Dark Knight, Oppenheimer, Dune: Part Two, Avatar: The Way of Water, Avengers: Endgame, Inception, Gladiator II*.
- Each movie carries `title`, `description`, `genre[]`, `language`, `duration`, `rating`, `posterUrl`, `bannerUrl`, `trailerUrl`, and `showtimes[]`.
- **Dynamic spotlight hero banners** on the Home page cycle through `bannerUrl` images with cinematic overlays.
- **Direct, playable YouTube trailer links** for every movie.
- Movies are auto-seeded via a `findOneAndUpdate` upsert on every server start. No manual database population required.

### 🏙️ Automated Multi-City Showtimes
- **6 theaters across 3 cities**, auto-generated on every server boot by `backend/utils/showSeeder.js`:

| Theater | City | Screen Format | Base Price |
|---|---|---|---|
| PVR IMAX Phoenix | Mumbai | IMAX 3D | ₹350 |
| INOX R City | Mumbai | 3D | ₹200 |
| INOX Megaplex | Delhi NCR | 4DX | ₹280 |
| PVR Directors Cut | Delhi NCR | IMAX 3D | ₹350 |
| Cinepolis Forum Mall | Bengaluru | 2D | ₹150 |
| Cinepolis Nexus | Bengaluru | 4DX | ₹280 |

- **4 daily timeslots** per theater: `10:30 AM`, `02:15 PM`, `06:30 PM`, `09:45 PM`.
- **192 show documents** seeded on first run (8 movies × 6 theaters × 4 slots).
- The seeder is **idempotent**: restarts only create missing slots, never duplicates.
- Newly added movies **automatically receive shows** across all 6 theaters.
- Admins can trigger **🔄 Sync Shows** per movie from the dashboard.
- Admin and client views read the same show data, so theater formats, prices, and slots are always **synchronized**.
- The booking page offers a **city-tab filter** (Mumbai / Delhi NCR / Bengaluru) grouping shows by theater, with screen-format badges (IMAX, 2D, 3D, 4DX) and tiered pricing.

### 🔐 Dual-Factor Authentication (Email + Phone + OTP)
- Registration requires **both a unique email address and a unique phone number**.
- On sign-up, a **6-digit OTP** (valid for 10 minutes) is generated and stored in `emailOtp` / `phoneOtp`.
- OTPs must be verified before any JWT is issued, enforced via the `isEmailVerified` / `isPhoneVerified` flags.
- **Instant OTP login** tab on the login page (`POST /api/auth/send-login-otp`).
- Passwords are hashed with **Bcrypt** (10 salt rounds) and never stored in plaintext.
- JWTs are signed with `JWT_SECRET`, expire in **7 days**, and are checked by the `verifyToken` middleware on every protected route.
- **Admin promotion** through the `ADMIN_SECRET` environment variable during registration.

### 🌙 Light & Dark Mode
- System-wide cinematic **dark mode** (default) with a one-click switch to light mode.
- Built with CSS custom properties and a `data-theme` attribute for flicker-free transitions.
- Preference persisted in `localStorage` across sessions.
- Accessible toggle in the Navbar with sun/moon icons.

### 🪑 Interactive Tiered Seat Selection
- **5-row seating grid** (A–E) with 8 seats per row, **40 seats per screen**:

| Row | Tier | Price Multiplier |
|---|---|---|
| A | VIP | 1.5× base |
| B, C | Premium | 1.25× base |
| D, E | Standard | 1.0× base |

- Real-time grand total as seats are selected (subtotal + ₹30 convenience fee).
- **5-minute seat locking** during checkout:
  - `POST /api/shows/:id/lock-seats` stores `{ seatNumber, userId, lockedAt, expiresAt }` in the `lockedSeats[]` subdocument.
  - A live **countdown timer** appears in a warning banner.
  - Seats locked by other users show a 🔒 icon and are disabled.
  - Seats are released automatically on page exit via `useEffect` cleanup plus `POST /api/shows/:id/unlock-seats`.
  - Expired locks are purged before every seat-availability check.

### 📱 Scannable QR E-Tickets & Digital Boarding Pass
- Every confirmed booking generates a **unique QR e-ticket** via `qrcode.react`.
- The QR payload encodes the booking reference, movie, seats, showtime, theater, amount, and verification status.
- Shown in two places:
  - ✅ The **Booking Confirmation** modal right after payment.
  - ✅ The **My Profile** page, with one QR per booking card.
- Click to expand into a full **Digital Boarding Pass** modal (200px high-resolution QR).
- **🖨️ Print Pass** button for physical copies.
- Cancelled bookings render a greyed-out **Cancelled Pass**.
- Booking reference format: `IMV-XXXXXX`, derived from the MongoDB ObjectId.

### ⭐ User Reviews & Ratings
- `reviewSchema` embedded in the Movie model: `userId`, `userName`, `rating` (1–5), `comment` (max 500 chars).
- A separate `Review` collection with a `movieId` reference for scalable cross-movie queries.
- Interactive **star rating UI** on the Movie Details page (login required).
- Reviews display avatar initial, name, star rating, and timestamp.
- A sample review is seeded for the first movie on initial startup.

### 🎛️ Real-Time Cinema Admin Console (`/admin`)
- **Role-protected**: accessible only with a `role: 'admin'` JWT.
- **Platform analytics**: total confirmed bookings, cumulative revenue, and total seats booked.
- **Movie management**: add, edit, and delete movies. New movies automatically get multi-city shows.
- **🔄 Sync Shows** per movie: regenerates all 6-theater × 4-slot shows on demand.
- **Show scheduling**: manual showtime form with movie, theater, time, date, and price.
- **Booking logs**: platform-wide booking list with user, movie, seats, and status.
- Default admin account auto-seeded for local development (see [Login Credentials](#4-login-credentials)).

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 (CRA), React Router v6 | SPA routing & UI |
| **Styling** | Bootstrap 5, Vanilla CSS, Google Fonts | Responsive design + dark mode |
| **QR Codes** | `qrcode.react` (QRCodeSVG) | E-ticket generation |
| **HTTP Client** | Axios | API calls with JWT interceptor |
| **Backend** | Node.js 18, Express.js 4 | REST API server |
| **Database** | MongoDB Atlas | Cloud document store |
| **ODM** | Mongoose 7 | Schema validation & queries |
| **Auth** | `jsonwebtoken` (JWT), `bcryptjs` | Stateless auth + password hashing |
| **Dev Tools** | Nodemon, dotenv, concurrently | Development workflow |

---

## 📁 Project Structure

```
IMovies-Project/
│
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js     # Register, OTP verify, login, send-login-OTP
│   │   ├── movie.controller.js    # CRUD + auto-show seeding on create
│   │   ├── booking.controller.js  # Create, cancel, user & admin list
│   │   ├── show.controller.js     # CRUD, lock/unlock seats, syncShowsForMovie
│   │   ├── review.controller.js   # Add & list movie reviews
│   │   └── theater.controller.js  # Theater CRUD
│   ├── models/
│   │   ├── User.js                # email, phone, OTP fields, verification flags
│   │   ├── Movie.js               # reviewSchema, blockbuster seeder array
│   │   ├── Show.js                # lockedSeats[], bookedSeats[]
│   │   ├── Booking.js             # bookingReference, seats, totalAmount
│   │   ├── Theater.js             # name, city, screens[]
│   │   ├── Review.js              # movieId reference, rating, comment
│   │   └── Admin.js               # Dedicated admin collection
│   ├── routes/
│   │   ├── auth.routes.js         # /register, /login, /verify-otp, /send-login-otp, /me
│   │   ├── movie.routes.js        # /movies (CRUD + nested reviews)
│   │   ├── booking.routes.js      # /bookings (static routes before :id wildcard)
│   │   ├── show.routes.js         # /shows (sync + lock/unlock + CRUD)
│   │   ├── review.routes.js
│   │   └── theater.routes.js
│   ├── middleware/
│   │   ├── auth.js                # verifyToken, verifyAdmin
│   │   └── errorHandler.js        # Centralized notFound + errorHandler
│   ├── utils/
│   │   └── showSeeder.js          # THEATER_CATALOG, SHOWTIME_SLOTS, seedAllShows, seedShowsForMovie
│   ├── server.js                  # Express app, MongoDB, auto-seeding pipeline
│   └── .env                       # Environment config (not committed)
│
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   ├── Navbar.jsx             # City selector, theme toggle, admin link
        │   └── QRCodeTicket.jsx       # Scannable QR e-ticket + boarding pass modal
        ├── pages/
        │   ├── Home.js                # Spotlight banners, movie catalog, genre filters
        │   ├── MovieDetails.js        # Movie info, trailer, reviews & rating UI
        │   ├── Booking.js             # City-tabbed showtimes, tiered seat grid, lock timer, QR modal
        │   ├── ProfilePage.jsx        # Booking history, QR tickets, cancel
        │   ├── AdminDashboard.js      # Analytics, movie/show management, sync shows
        │   ├── LoginPage.jsx          # Password + instant OTP login tabs
        │   └── RegisterPage.jsx       # Dual registration (email + phone)
        ├── services/
        │   └── api.js                 # Axios instance, JWT interceptor, all API methods
        ├── App.js
        ├── App.css
        └── index.css                  # CSS custom properties for dark/light themes
```

---

## ⚡ Local Setup & Installation

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- A free **MongoDB Atlas** cluster ([create one here](https://www.mongodb.com/atlas/database))
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/praveenjaat2267/IMovies-Project.git
cd IMovies-Project
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/imovies?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
ADMIN_SECRET=choose_a_strong_admin_secret
```

> ⚠️ Never commit `.env` to version control. It is listed in `.gitignore`.
> Use a long, random `JWT_SECRET` and a strong `ADMIN_SECRET`, especially outside local development.

Start the backend:

```bash
npm run dev
```

**On first startup, the server automatically:**
1. Upserts 8 blockbuster movies with banners, trailers, and showtimes.
2. Syncs 6 theaters across Mumbai, Delhi NCR, and Bengaluru.
3. Seeds **192 show documents** (8 movies × 6 theaters × 4 daily timeslots).
4. Creates the default admin account.
5. Inserts a sample movie review.

Expected console output:

```
Server is running on port 5000
MongoDB Connected Successfully
Synced 8 blockbuster movies with banners & showtimes!
[ShowSeeder] Synced 6 theaters across 3 cities.
[ShowSeeder] +192 new show slots created. Total: 192
```

On later restarts the seeder only fills in missing slots, so you will not see duplicates.

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

The React app starts at **http://localhost:3000** and proxies all `/api` calls to `localhost:5000`.

### 4. Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@imovies.com` | `admin123` |
| User | Register at `/register` | (your choice) |

> 💡 On the Login page, click **"⚡ Fill Demo Admin"** to auto-fill the admin credentials.
>
> 🔒 These are **development-only** defaults. Change the admin password and remove the demo shortcut before any public deployment.

### Troubleshooting

| Problem | Fix |
|---|---|
| `MongoNetworkError` / cannot connect | Add your IP to the Atlas Network Access list and double-check `MONGO_URI`. |
| Port 5000 already in use | Change `PORT` in `backend/.env` and update the frontend proxy to match. |
| Frontend shows no movies | Make sure the backend is running and printed the seeding messages above. |
| `401` on protected routes | Log in again; your JWT may have expired (7-day lifetime). |

---

## 🔑 API Reference

All routes are prefixed with `/api`. Protected routes expect an `Authorization: Bearer <token>` header.

### Authentication — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/register` | Register with name, email, phone, password | Public |
| `POST` | `/verify-otp` | Verify registration OTP | Public |
| `POST` | `/resend-otp` | Resend OTP to email & phone | Public |
| `POST` | `/login` | Login with email/phone + password or OTP | Public |
| `POST` | `/send-login-otp` | Request instant phone/email login OTP | Public |
| `GET` | `/me` | Get current user profile | 🔒 JWT |

### Movies — `/api/movies`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | List all movies (search, genre, language filters) | Public |
| `GET` | `/:id` | Get movie details + embedded reviews | Public |
| `GET` | `/:id/reviews` | Get all reviews for a movie | Public |
| `POST` | `/:id/reviews` | Submit a review (auto-attaches movieId) | 🔒 JWT |
| `POST` | `/` | Create movie (auto-seeds shows) | 🔒 Admin |
| `PUT` | `/:id` | Update movie | 🔒 Admin |
| `DELETE` | `/:id` | Delete movie | 🔒 Admin |

### Shows — `/api/shows`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | All shows (filter by movieId, theaterId) | Public |
| `GET` | `/movie/:movieId` | Shows for a specific movie | Public |
| `POST` | `/sync/:movieId` | Regenerate all city shows for a movie | 🔒 Admin |
| `GET` | `/:id` | Single show with seat availability | Public |
| `POST` | `/:id/lock-seats` | Lock seats for 5 minutes during checkout | 🔒 JWT |
| `POST` | `/:id/unlock-seats` | Release locked seats | 🔒 JWT |
| `POST` | `/` | Create a show manually | 🔒 Admin |
| `DELETE` | `/:id` | Delete a show | 🔒 Admin |

### Bookings — `/api/bookings`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | All bookings (admin analytics) | 🔒 Admin |
| `GET` | `/user` | Current user's booking history | 🔒 JWT |
| `POST` | `/` | Create booking + payment record | 🔒 JWT |
| `PUT` | `/:id/cancel` | Cancel booking & release seats | 🔒 JWT |
| `GET` | `/:id` | Single booking detail | 🔒 JWT |

### Theaters — `/api/theaters`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | All theaters | Public |
| `POST` | `/` | Add a theater | 🔒 Admin |
| `DELETE` | `/:id` | Remove a theater | 🔒 Admin |

---

## 🔐 Security Practices

- Passwords are **never stored in plaintext**; they are hashed with `bcrypt` (10 salt rounds).
- JWTs are signed with a secret stored in `.env` and expire in **7 days**.
- OTP codes expire **10 minutes** after generation.
- `verifyToken` protects all user routes; `verifyAdmin` additionally checks `role === "admin"`.
- Input is validated on both the client (forms) and the server (controllers) for all user-facing endpoints.
- Express routes follow the **static-before-wildcard** rule so `/:id` never intercepts `/user` or `/sync`.
- CORS is open during development. Restrict `origin` to your frontend URL in production.
- Replace all demo credentials and secrets before deploying publicly.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Praveen Jaat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**IMovies v2.0** — Built with ❤️ by [Praveen Kumar](https://github.com/praveenjaat2267)

*MERN Stack · MongoDB Atlas · Express · React · Node.js · 2026*

</div>