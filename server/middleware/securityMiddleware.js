const rateLimit = require('express-rate-limit');
const { isProduction } = require('../utils/env');

const standardMessage = {
  message: 'Too many requests. Please try again shortly.',
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction() ? 500 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardMessage,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction() ? 20 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login or signup attempts. Please try again later.',
  },
});

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction() ? 30 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many order attempts. Please try again shortly.',
  },
});

const discountLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: isProduction() ? 50 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many discount code attempts. Please try again later.',
  },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction() ? 60 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many upload attempts. Please try again shortly.',
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  orderLimiter,
  discountLimiter,
  uploadLimiter,
};