import axios from 'axios';

// Base Axios Instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Inject JWT token into headers if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Uniform error handling & session expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const originalRequest = error.config;
            if (!originalRequest._retry && !window.location.pathname.includes('/login')) {
                console.warn('Session expired. Redirecting to login.');
                localStorage.removeItem('token');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
            }
        }
        return Promise.reject(error);
    }
);

// Modular API Service Endpoints
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/me')
};

export const movieAPI = {
    getAll: (params) => api.get('/movies', { params }),
    getById: (id) => api.get(`/movies/${id}`),
    create: (data) => api.post('/movies', data),
    update: (id, data) => api.put(`/movies/${id}`, data),
    delete: (id) => api.delete(`/movies/${id}`)
};

export const theaterAPI = {
    getAll: (params) => api.get('/theaters', { params }),
    getById: (id) => api.get(`/theaters/${id}`),
    create: (data) => api.post('/theaters', data),
    delete: (id) => api.delete(`/theaters/${id}`)
};

export const showAPI = {
    getAll: (params) => api.get('/shows', { params }),
    getByMovie: (movieId) => api.get(`/shows/movie/${movieId}`),
    getById: (id) => api.get(`/shows/${id}`),
    create: (data) => api.post('/shows', data),
    delete: (id) => api.delete(`/shows/${id}`),
    lockSeats: (id, seats, lockDurationMinutes = 5) => api.post(`/shows/${id}/lock-seats`, { seats, lockDurationMinutes }),
    unlockSeats: (id, seats) => api.post(`/shows/${id}/unlock-seats`, { seats })
};

export const bookingAPI = {
    create: (data) => api.post('/bookings', data),
    getUserBookings: () => api.get('/bookings/user'),
    getAllBookings: () => api.get('/bookings'),
    getById: (id) => api.get(`/bookings/${id}`),
    cancel: (id) => api.put(`/bookings/${id}/cancel`)
};

export const reviewAPI = {
    getByMovie: (movieId) => api.get(`/reviews/movie/${movieId}`),
    create: (data) => api.post('/reviews', data)
};

export default api;
