import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redis.on('error', (err) => {
  console.log('Redis Client Error', err);
  process.exit(1);
});
redis.on('connect', () => console.log('Redis connected'));

const connectRedis = async () => {
  try {
    await redis.ping(); // Ping Redis to ensure the connection is working
  } catch (error) {
    console.error('Redis connection failed:', error);
  }
};

export { redis, connectRedis };