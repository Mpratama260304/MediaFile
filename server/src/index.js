require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');
const User = require('./models/User');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiter
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/api/folders', require('./routes/folders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large. Maximum size is 10 GB.' });
  }

  if (err.message && err.message.includes('File type')) {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mediafile.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@12345',
        role: 'admin',
      });
      console.log(`Default admin created: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
};

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await createDefaultAdmin();
  });
}

module.exports = app;
