import jwt from 'jsonwebtoken';
import { default as User } from '../models/user.js';

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findOne({ userId: decoded.userId }).select('-password');
    if (user) req.user = user;
  } catch {
    // Invalid token — treat as guest, don't block
  }
  next();
}
