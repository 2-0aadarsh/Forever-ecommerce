import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Admin from '../models/adminModel.js';

dotenv.config();

const adminAuth = async (req, res, next) => {
  try {
    
    const tokenHeader = req.headers.token || req.headers.authorization;

    if (!tokenHeader) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // If coming from Authorization, parse "Bearer <token>"
    const token = tokenHeader.startsWith('Bearer ')
      ? tokenHeader.slice(7)
      : tokenHeader;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided." 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: "Token verification failed. Please login again." 
      });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden. You do not have admin privileges." 
      });
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: "Admin user not found. Please re-authenticate." 
      });
    }

    req.user = admin;
    next();
  } catch (error) {
    console.error("Admin Auth Error:", error);
    res.status(401).json({ 
      success: false, 
      message: "Unauthorized access. Invalid or expired token." 
    });
  }
};

export default adminAuth;













/*import jwt from 'jsonwebtoken';

const adminAuth = (req, res, next) => {
  try {
    // Accept token from Authorization header or custom token header
    const authHeader = req.headers.authorization || req.headers.token;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: No token provided'
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Not an admin'
      });
    }

    // Attach admin info to request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

export default adminAuth;
*/