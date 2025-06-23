import Admin from '../models/adminModel.js';
import dotenv from 'dotenv';
dotenv.config();

const seedAdmin = async () => {
  const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  
  if (!adminExists) {
    await Admin.create({
      name: 'System Admin',
      email: process.env.INITIAL_ADMIN_EMAIL,
      password: process.env.INITIAL_ADMIN_PASSWORD,
      role: 'superadmin'
    });
    console.log('Admin account created');
  } else {
    console.log('Admin account already exists');
  }
};

seedAdmin().catch(console.error);