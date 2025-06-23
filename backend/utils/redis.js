import { redis } from '../config/redis.js';

const saveToRedis = async (key, value, expiry = 300) => {
  try {
    await redis.setex(key, expiry, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to Redis:', error.message);
    process.exit(1);
  }
};

// Fetch data from Redis using key
const getFromRedis = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null; // Always return an object or null
  } catch (error) {
    console.error('Redis Fetch Error:', error);
    return null; // Return null instead of a string error message
  }
};

const deleteFromRedis = async (key) => {
  try {
    await redis.del(key);
    console.log(`Deleted key ${key} from Redis`);
  } catch (error) {
    console.error(`Error deleting key ${key} from Redis:`, error);
  }
};

export { saveToRedis, getFromRedis, deleteFromRedis };