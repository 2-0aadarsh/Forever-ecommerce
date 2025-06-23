import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { generateOTP } from "../utils/otp.js";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";
import {
  saveToRedis,
  getFromRedis,
  deleteFromRedis,
} from "../utils/redis.js";
import { redis } from "../config/redis.js"; // Ensure path is correct

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register User - Sends OTP after creating the user (unverified)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      address: {
        street: address.street.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        zip: address.zip.trim(),
        country: address.country.trim(),
      },
      isVerified: false,
    });

    const savedUser = await newUser.save();

    // Check cooldown before sending OTP
    const cooldownKey = `cooldown:${email}`;
    const cooldownExists = await redis.get(cooldownKey);
    if (cooldownExists) {
      return res.status(429).json({
        success: false,
        message: "Please wait a few seconds before trying again.",
      });
    }

    // Generate and send OTP
    const otp = generateOTP();
    await saveToRedis(`otp:${email}`, otp, 300); // 5 mins
    await sendVerificationEmail(email, otp, savedUser.name);
    await redis.setex(cooldownKey, 30, "true"); // ⏱️ 30 sec cooldown

    return res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent to email for verification.",
      userId: savedUser._id,
    });
  } catch (error) {
    console.error("Registration Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Try again later.",
      error:error.message
    });
  }
};

// Verify OTP and activate account
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const savedOtp = await getFromRedis(`otp:${email}`);
    if (!savedOtp) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired or not found." });
    }

    if (otp !== savedOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    ).select("-password");

    await deleteFromRedis(`otp:${email}`);
    await deleteFromRedis(`cooldown:${email}`);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user,
    });
  } catch (error) {
    console.error("OTP Verification Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Verification failed. Try again." });
  }
};

// Login User - only if email is verified
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist." });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    const token = createToken(user._id);
    return res.status(200).json({ success: true, token });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Login failed. Try again." });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        {
          role: "admin",
          email: process.env.ADMIN_EMAIL
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      
      return res.status(200).json({ success: true, token });
    }

    return res
      .status(401)
      .json({ success: false, message: "Invalid admin credentials." });
  } catch (error) {
    console.error("Admin Login Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Admin login failed." });
  }
};

// Get Authenticated User Profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Fetch Profile Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const resendOtp = async(req, res)=> {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "User is already verified." });
    }

    // ⏱️ Check Redis cooldown
    const cooldownKey = `cooldown:${email}`;
    const isCooldown = await redis.get(cooldownKey);
    if (isCooldown) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting a new OTP.",
      });
    }

    // Generate OTP and save to Redis
    const otp = generateOTP();
    await saveToRedis(`otp:${email}`, otp, 300); // 5 minutes TTL
    await sendVerificationEmail(email, otp, user.name);
    await redis.setex(cooldownKey, 30, "true"); // 30s cooldown

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:'Error re-sending otp',
      error:error.message
    })
  }
}

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, address } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Update failed. Try again.",
      error: error.message
    });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const otp = generateOTP();
    await saveToRedis(`reset:${email}`, otp, 300); // expires in 5 min
    await sendVerificationEmail(email, otp, user.name);

    return res.status(200).json({ success: true, message: "OTP sent to your email." });
  } catch (err) {
    console.error("Reset OTP error:", err.message);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log(email, otp, newPassword);
    if (!email || !otp || !newPassword)
      return res.status(400).json({ success: false, message: "All fields are required." });

    const cachedOtp = await getFromRedis(`reset:${email}`);
    if (!cachedOtp || cachedOtp !== otp)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await deleteFromRedis(`reset:${email}`);

    return res.status(200).json({ success: true, message: "Password reset successful." });
  } catch (err) {
    console.error("Reset password error:", err.message);
    return res.status(500).json({ success: false, message: "Could not reset password." });
  }
};

export const listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -cartData')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update any user
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone } = req.body;

    // Validate input
    if (!name || !email || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email and phone are required' 
      });
    }

    // Check if email is being used by another user
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use by another account'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim() 
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password -cartData -__v');

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account'
      });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Optionally: Clear any user sessions in Redis
    await deleteFromRedis(`user:${userId}`);

    res.status(200).json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  adminLogin,
  getUserProfile,
  updateUserProfile,
  requestPasswordReset,
  resetPassword,
  updateUser,
  deleteUser
};