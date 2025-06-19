import express from 'express';
import { loginUser, registerUser, adminLogin, getUserProfile } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);

// New route using your middleware
userRouter.get('/profile', authUser, getUserProfile); // Middleware must be applied

export default userRouter;
