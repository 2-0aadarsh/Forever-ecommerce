import express from 'express';
import {
  loginUser,
  registerUser,
  verifyOtp,
  adminLogin,
  getUserProfile,
  resendOtp,
  updateUserProfile,
  requestPasswordReset,
  resetPassword,
  listUsers,
  updateUser,
  deleteUser
} from '../controllers/userController.js';

import { authUser, validateRegisterUser } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import rateLimit from 'express-rate-limit';

// Rate limiting for admin operations
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

const userRouter = express.Router();

// ==================== Public Routes ====================
userRouter.post('/register', validateRegisterUser, registerUser); // User registration
userRouter.post('/verify-otp', verifyOtp);                       // OTP verification
userRouter.post('/resend-otp', resendOtp);                       // Resend OTP
userRouter.post('/forgot-password', requestPasswordReset);       // Password reset request
userRouter.post('/reset-password', resetPassword);               // Password reset
userRouter.post('/login', loginUser);                            // User login
userRouter.post('/admin', adminLogin);                           // Admin login

// ==================== Authenticated User Routes ====================
userRouter.get('/profile', authUser, getUserProfile);            // Get user profile
userRouter.put('/profile', authUser, updateUserProfile);         // Update own profile

// ==================== Admin-Only Routes ====================
userRouter.get('/list', adminAuth, listUsers);                   // List all users (paginated)
userRouter.put('/:userId', adminAuth, adminLimiter, updateUser); // Admin edit user
userRouter.delete('/:userId', adminAuth, adminLimiter, deleteUser); // Admin delete user

export default userRouter;