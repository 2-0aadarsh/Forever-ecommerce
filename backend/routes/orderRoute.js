import express from 'express';
import {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  listOrders,
  userOrders,
  updateOrderStatus,
  verifyStripe,
  verifyRazorpay
} from '../controllers/orderController.js';

import adminAuth from '../middleware/adminAuth.js';
import { authUser } from '../middleware/auth.js';
import ensureVerifiedUser from '../middleware/ensureVerifiedUser.js';

const orderRouter = express.Router();

// Admin Routes
orderRouter.get('/admin/list', adminAuth, listOrders);
orderRouter.patch('/status/:orderId', adminAuth, updateOrderStatus);

// Verified User Orders
orderRouter.post('/place', authUser, ensureVerifiedUser, placeOrder);
orderRouter.post('/stripe', authUser, ensureVerifiedUser, placeOrderStripe);
orderRouter.post('/razorpay', authUser, ensureVerifiedUser, placeOrderRazorpay);

// User Orders
orderRouter.get('/userorders', authUser, userOrders);

// Payment Verifications
orderRouter.post('/verifyStripe', authUser, verifyStripe);
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay);

export default orderRouter;
