const jwt = require('jsonwebtoken');
const User = require('../models/User');
exports.authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if(!header || !header.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  const token = header.split(' ')[1];
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('-password');
    if(!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = user;
    next();
  } catch(err){ return res.status(401).json({ message: 'Token error', error: err.message }); }
};
exports.authorize = (...roles) => (req, res, next) => {
  if(!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if(!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};
