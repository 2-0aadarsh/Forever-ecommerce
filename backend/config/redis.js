// // redisClient.js
// import { createClient } from 'redis';

// const redisClient = createClient({
//   username: 'default',
//   password: 'jvGhRBAAmvIi5s75hIVvPk3gfVe9UwtK',
//   socket: {
//     host: 'redis-17262.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
//     port: 17262,
//   },
// });

// redisClient.on('error', (err) => {
//   console.error('❌ Redis Client Error:', err);
// });

// redisClient.on('connect', () => {
//   console.log('✅ Connected to Redis successfully!');
// });

// export default redisClient;


import Redis from 'ioredis';

const redis = new Redis({
  password: 'jvGhRBAAmvIi5s75hIVvPk3gfVe9UwtK',
  host: 'redis-17262.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: 17262,
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
    console.error('❌ Redis connection failed:', error);
  }
};

export { redis, connectRedis };