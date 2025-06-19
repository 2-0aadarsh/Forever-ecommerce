// middleware/auth.js
import jwt from 'jsonwebtoken';

const authUser = (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('🔐 Auth error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export default authUser;