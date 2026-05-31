require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { getAllowedOrigins, isProduction } = require('./utils/env');
const {
  generalLimiter,
  authLimiter,
  orderLimiter,
  discountLimiter,
  uploadLimiter,
} = require('./middleware/securityMiddleware');

const app = express();
const allowedOrigins = getAllowedOrigins();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.use(generalLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'ByJojo API is healthy',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', orderLimiter, require('./routes/orderRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/discount-codes/validate', discountLimiter);
app.use('/api/discount-codes', require('./routes/discountCodeRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/uploads', uploadLimiter, require('./routes/uploadRoutes'));

app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);

  const status = err.status || err.statusCode || 500;
  const safeMessage = isProduction() && status >= 500
    ? 'Server error'
    : err.message || 'Server error';

  res.status(status).json({ message: safeMessage });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  });
});