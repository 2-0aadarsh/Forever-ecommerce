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

// Parse CORS_ORIGIN env string into array, trimming any accidental whitespace
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || [];

connectDB();
connectCloudinary();
connectRedis();

// Debug log to inspect incoming origin
app.use((req, res, next) => {
  console.log('Incoming Origin:', req.headers.origin);
  next();
});

// Middleware
app.use(express.json());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow requests like curl/postman
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error(`CORS BLOCKED: ${origin}`);
      return callback(new Error(`CORS policy: No access from origin ${origin}`), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
  credentials: true,
  optionsSuccessStatus: 204,
}));

// Handle preflight
app.options('*', cors());

// Cookie parser
app.use(cookieParser());

// Routes
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin', settingsRouter);

app.get('/', (req, res) => {
  res.send('API Working');
});

app.listen(port, () => {
  console.log(`Server started on PORT: ${port}`);
});
