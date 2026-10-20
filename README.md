# IMovies - Movie Ticket Booking System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application designed to simplify movie ticket bookings with real-time seat selection, user history management, and robust administrative controls.

## ?? Tech Stack
* **Frontend:** React.js, React Router, Bootstrap, Axios, Custom Dark Mode UI
* **Backend:** Node.js, Express.js, Mongoose ODM, JWT Authentication
* **Database:** MongoDB Atlas

## ? Key Features
* **User Authentication:** Secure signup and login powered by JWT (JSON Web Tokens) and Bcrypt encryption.
* **Movie Catalog & Browsing:** Explore current blockbusters, view detailed descriptions, ratings, genres, and showtimes.
* **Interactive Seat Selection:** Dynamic, real-time seat picking grid categorized by tiers (Standard, Premium, VIP) with instant calculation and booking confirmation.
* **User Booking History:** Dedicated profile view to track active bookings, review ticket details, and cancel reservations with automated refunds.
* **Admin Control Suite:** Comprehensive management dashboard to add/edit movies, schedule showtimes across partner theaters, and monitor system-wide analytics and booking logs.

## ?? Project Structure
`	ext
IMovies-Project/
¦
+-- backend/
¦   +-- controllers/   # Business logic for movies, bookings, and users
¦   +-- models/        # Mongoose schemas (Movie, Theater, Booking, User)
¦   +-- routes/        # Express API routing endpoints
¦   +-- server.js      # Main Express server and DB connection
¦   +-- .env           # Environment configuration
¦
+-- frontend/
    +-- public/        # Static assets and HTML template
    +-- src/
        +-- components/# Reusable UI components (Navbar, etc.)
        +-- pages/     # View pages (Home, Login, Register, SeatSelection, MyBookings, Admin)
        +-- App.js     # Main React routing setup
        +-- index.css  # Custom cinematic dark-mode styles
`

## ?? Getting Started & Installation

1. **Clone the Repository:**
   `ash
   git clone [https://github.com/praveenjaat2267/IMovies-Project.git](https://github.com/praveenjaat2267/IMovies-Project.git)
   cd IMovies-Project
   `\n
2. **Setup the Backend:**
   `ash
   cd backend
   npm install
   ``n   * Create a .env file in the ackend folder and add your configuration:
     `env
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     ``n   * Run the server:
     `ash
     npm run dev
     `\n
3. **Setup the Frontend:**
   * Open a new terminal window, navigate to the frontend folder, and run:
     `ash
     cd frontend
     npm install
     npm start
     ``n   * Access the application in your browser at http://localhost:3000.
