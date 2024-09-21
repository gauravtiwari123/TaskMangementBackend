const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const authMiddleware = async (req, res, next) => {
  let token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Please authenticate' });
  }

  try {
    const decoded = jwt.verify(token, 'secretKey');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = authMiddleware;
