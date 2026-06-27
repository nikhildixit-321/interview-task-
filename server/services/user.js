const jwt = require('jsonwebtoken')

const secret = process.env.JWT_SECRET || 'nikhil'

const createToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email
  }

  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

const validateToken = (token) => {
  return jwt.verify(token, secret);
}

module.exports = {
  validateToken,
  createToken
}
