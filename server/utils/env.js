function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret && isProduction()) {
    throw new Error('JWT_SECRET is required in production');
  }

  return secret || 'dev-secret-change-me';
}

function getAllowedOrigins() {
  const rawOrigins = process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173';

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

module.exports = {
  isProduction,
  getJwtSecret,
  getAllowedOrigins,
};