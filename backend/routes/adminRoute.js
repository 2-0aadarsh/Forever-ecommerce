import express from 'express';
import {
  adminSummary,
  getAdminProfile,
  updateAdminProfile,
  adminLogin,
  setupAdmin
} from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';
import rateLimit from 'express-rate-limit';

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

const adminRouter = express.Router();

// Setup initial superadmin (ONLY ONCE)
adminRouter.post('/setup', setupAdmin);

// Admin Login
adminRouter.post('/login', adminLogin);

// Authenticated Routes
adminRouter.get('/summary', adminAuth, adminSummary);
adminRouter.get('/profile', adminAuth, getAdminProfile);
adminRouter.put('/profile', adminAuth, adminLimiter, updateAdminProfile);

export default adminRouter;