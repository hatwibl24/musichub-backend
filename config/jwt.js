const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'musichub_secret_key_for_authentication_2024';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

const generateToken = (userId) => {
  return jwt.sign(
    { user: { id: userId } },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

module.exports = {
  JWT_SECRET,
  JWT_EXPIRE,
  generateToken
}; 