// middleware/ensureVerifiedUser.js
import User from '../models/userModel.js';

const ensureVerifiedUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before placing an order.",
      });
    }

    next();
  } catch (error) {
    console.error("Verification Middleware Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export default ensureVerifiedUser;