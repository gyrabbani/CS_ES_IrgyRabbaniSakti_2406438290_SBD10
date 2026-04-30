const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Konfigurasi rate limiter untuk endpoint autentikasi (5 request per 15 menit)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit dalam milidetik
  max: 5, // batas maksimal 5 request per IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    payload: null
  }
});

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Terapkan rate limiter spesifik ke endpoint login dan register
app.use('/auth/login', authLimiter);
app.use('/user/login', authLimiter);
app.use('/user/register', authLimiter);

// API routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/items', itemRoutes);
app.use('/transaction', transactionRoutes);
app.use('/reports', reportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    payload: null,
  });
});

app.use(errorHandler);

module.exports = app;