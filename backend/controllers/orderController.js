import orderModel from "../models/orderModel.js";
import User from "../models/userModel.js";
import Stripe from 'stripe';
import razorpay from 'razorpay';

const currency = 'inr';
const deliveryCharge = 10;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// COD Order
const placeOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, amount, address, subtotal } = req.body;

    const cleanAddress = {
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country
    };
    
    const formattedItems = items.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      image: Array.isArray(item.image) ? item.image[0] : item.image,
      productId: item.productId,
      subtotal: item.subtotal
    }));
   
    const orderData = {
      userId,
      items: formattedItems,
      address: cleanAddress,
      amount,
      subtotal,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await User.findByIdAndUpdate(userId, { cartData: {} });

    const isValidAddress =
      cleanAddress.street &&
      cleanAddress.city &&
      cleanAddress.state &&
      cleanAddress.zip &&
      cleanAddress.country;

    if (isValidAddress) {
      const user = await User.findById(userId);
      const exists = user.address.some((a) =>
        a.street === cleanAddress.street &&
        a.city === cleanAddress.city &&
        a.state === cleanAddress.state &&
        a.zip === cleanAddress.zip &&
        a.country === cleanAddress.country
      );

      if (!exists) {
        await User.findByIdAndUpdate(userId, {
          $push: { address: cleanAddress },
        });
      }
    }

    res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    console.error("Order placement failed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Stripe Order
const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, amount, address } = req.body;
    const { origin } = req.headers;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: { name: 'Delivery Charges' },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: 'payment',
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Razorpay Order
const placeOrderRazorpay = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
    };

    razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.json({ success: false, message: error });
      }
      res.json({ success: true, order });
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Stripe
const verifyStripe = async (req, res) => {
  const { orderId, success } = req.body;
  const userId = req.userId;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await User.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Razorpay
const verifyRazorpay = async (req, res) => {
  try {
    const userId = req.userId;
    const { razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    if (orderInfo.status === 'paid') {
      await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
      await User.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: 'Payment Failed' });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Admin: Get All Orders with populated user info
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("userId", "name email addresses")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update Order Status (PATCH)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    if (!orderId || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID and status are required." });
    }

    await orderModel.findByIdAndUpdate(orderId, { status });

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// User Orders
const userOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  verifyRazorpay,
  verifyStripe,
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  listOrders,
  userOrders,
  updateOrderStatus
};
