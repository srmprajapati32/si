require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const { scheduleExpiryCheck } = require('./jobs/expiryCheck');

const authRoutes = require('./routes/auth');
const instrumentRoutes = require('./routes/instruments');
const verificationRoutes = require('./routes/verifications');
const observationRoutes = require('./routes/observations');
const certificateRoutes = require('./routes/certificates');
const verifyRoutes = require('./routes/verify');
const dashboardRoutes = require('./routes/dashboard');
const auditLogRoutes = require('./routes/auditLogs');
const userRoutes = require('./routes/users');
const businessRoutes = require('./routes/businesses');

const app = express();

app.use(helmet());

// Netlify Frontend के लिए CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://strong-horse-f5c2df.netlify.app/', // अपना Netlify URL यहाँ डालें
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ success: true, message: 'OVS API is running.' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/instruments', instrumentRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/businesses', businessRoutes);

// Generic /api router for observations (Auth middleware applies inside)
app.use('/api', observationRoutes);

// Static files
app.use('/storage', express.static(path.join(__dirname, '..', 'storage')));

// 404 & Error Handling
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));
app.use(errorHandler);

// Server Start Point
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;