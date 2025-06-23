// middleware/auth.js
import jwt from 'jsonwebtoken';
import validator from "validator";


const authUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token" });
    }
    const token = authHeader.split(" ")[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error("🔐 Auth error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const validateRegisterUser = (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    if (!/^\d{10,}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Phone number must be at least 10 digits." });
    }

    const requiredFields = ["street", "city", "state", "zip", "country"];
    for (const field of requiredFields) {
      if (!address[field] || typeof address[field] !== "string" || address[field].trim() === "") {
        return res.status(400).json({
          success: false,
          message: `Address field "${field}" is required.`,
        });
      }
    }
    
    next(); // validation passed, move to controller

  } catch (err) {
    console.error("Validation Middleware Error:", err.message);
    return res.status(500).json({ success: false, message: "Validation failed. Try again." });
  }
};

export { authUser, validateRegisterUser };