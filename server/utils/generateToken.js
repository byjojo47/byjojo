const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('./env');

function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    getJwtSecret(),
    { expiresIn: '30d' },
  );
}

module.exports = generateToken;