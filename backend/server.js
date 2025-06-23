// server.js
import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import { connectRedis } from './config/redis.js';

import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import adminRouter from './routes/adminRoute.js';
import settingsRouter from './routes/settingsRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();
connectRedis(); // Redis starts once on server start

// Middleware
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error(`CORS policy: No access from origin ${origin}`), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
// Handle preflight requests
app.options('*', cors());

// app.use(cors());
app.use(cookieParser());

// Routes
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/admin', adminRouter);
app.use("/api/admin", settingsRouter);

app.get('/', (req, res) => {
  res.send('API Working');
});

app.listen(port, () => {
  console.log(`Server started on PORT: ${port}`);
});
