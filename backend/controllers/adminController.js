import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";
import moment from "moment";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

// Dashboard Analytics
const adminSummary = async (req, res) => {
  try {
    const { range } = req.query;
    const now = new Date();
    let fromDate, prevFromDate, prevToDate;

    switch (range) {
      case "month":
        fromDate = moment(now).subtract(30, "days").toDate();
        prevFromDate = moment(now).subtract(60, "days").toDate();
        prevToDate = moment(now).subtract(30, "days").toDate();
        break;
      case "quarter":
        fromDate = moment(now).subtract(90, "days").toDate();
        prevFromDate = moment(now).subtract(180, "days").toDate();
        prevToDate = moment(now).subtract(90, "days").toDate();
        break;
      default:
        fromDate = moment(now).subtract(7, "days").toDate();
        prevFromDate = moment(now).subtract(14, "days").toDate();
        prevToDate = moment(now).subtract(7, "days").toDate();
    }

    // Parallel data fetching
    const [allOrders, products, users, statusCounts] = await Promise.all([
      Order.find({ createdAt: { $gte: fromDate } })
        .sort({ createdAt: -1 })
        .populate('userId', 'name email phone'),
      Product.find({}),
      User.find({ createdAt: { $gte: fromDate } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: fromDate } } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ])
    ]);

    // Filter out cancelled orders
    const validOrders = allOrders.filter(order => order.status !== "Cancelled");

    // Previous period data
    const [prevOrders, prevUsers] = await Promise.all([
      Order.find({
        createdAt: { $gte: prevFromDate, $lte: prevToDate },
        status: { $ne: "Cancelled" }
      }),
      User.find({ createdAt: { $gte: prevFromDate, $lte: prevToDate } })
    ]);

    // Calculate metrics
    const totalRevenue = validOrders.reduce((sum, order) => sum + order.amount, 0);
    const prevRevenue = prevOrders.reduce((sum, order) => sum + order.amount, 0);

    const percentChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Format status counts
    const formatStatusCounts = (counts) => ({
      pending: counts.find(s => s._id === "Pending")?.count || 0,
      processing: counts.find(s => s._id === "Processing")?.count || 0,
      shipped: counts.find(s => s._id === "Shipped")?.count || 0,
      delivered: counts.find(s => s._id === "Delivered")?.count || 0,
      cancelled: counts.find(s => s._id === "Cancelled")?.count || 0
    });

    // Prepare sales data
    const salesDataMap = {};
    const daysDiff = moment(now).diff(fromDate, "days");
    for (let i = 0; i <= daysDiff; i++) {
      const day = moment(fromDate).add(i, "days").format("YYYY-MM-DD");
      salesDataMap[day] = 0;
    }

    validOrders.forEach((order) => {
      const day = moment(order.createdAt).format("YYYY-MM-DD");
      if (salesDataMap[day] !== undefined) {
        salesDataMap[day] += order.amount;
      }
    });

    const salesData = Object.entries(salesDataMap).map(([date, amount]) => ({
      date,
      amount,
    }));

    // Prepare recent orders
    const recentOrders = validOrders.slice(0, 5).map((order) => {
      const customerName = order.userId?.name || 
                         `${order.address?.firstName || ''} ${order.address?.lastName || ''}`.trim() || 
                         order.userId?.email || 
                         order.userId?.phone || 
                         "Guest Customer";

      return {
        id: order._id.toString().slice(-6).toUpperCase(),
        customer: customerName,
        date: moment(order.createdAt).format("DD MMM YYYY"),
        amount: order.amount,
        status: order.status || "Pending"
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalOrders: validOrders.length,
        totalRevenue,
        totalProducts: products.length,
        bestsellerCount: products.filter(p => p.bestseller).length,
        newCustomers: users.length,
        totalRevenueChange: percentChange(totalRevenue, prevRevenue),
        totalOrdersChange: percentChange(validOrders.length, prevOrders.length),
        newCustomersChange: percentChange(users.length, prevUsers.length),
        salesData,
        recentOrders,
        statusCounts: formatStatusCounts(statusCounts)
      }
    });
  } catch (error) {
    console.error("Admin Summary Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message
    });
  }
};

// Admin Profile Management
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password -__v');
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }
    res.status(200).json({ success: true, admin });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch admin profile' 
    });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name is required' 
      });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      { name: name.trim(), phone: phone?.trim() || "" },
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.status(200).json({ 
      success: true, 
      admin,
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select('+password');
    
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Cannot find Admin' 
      });
    }

    if (!(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Wrong Password! Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    res.status(200).json({ 
      success: true, 
      token 
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
};

export const setupAdmin = async (req, res) => {
  try {

    // Secure setup using a header secret 
    if (req.headers['setup-secret'] !== process.env.ADMIN_SETUP_SECRET) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized admin setup attempt'
      });
    }

    // Check if any admin exists
    const adminExists = await Admin.exists({});
    if (adminExists) {
      return res.status(403).json({
        success: false,
        message: 'Admin already exists'
      });
    }

    // Create first admin
    const admin = await Admin.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created',
      adminId: admin._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export { adminSummary };