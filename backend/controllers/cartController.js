import userModel from "../models/userModel.js";

// Add to Cart
const addToCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;

    const userData = await userModel.findById(req.userId);
    if (!userData) return res.status(404).json({ success: false, message: "User not found" });

    let cartData = { ...userData.cartData };

    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }

    await userModel.findByIdAndUpdate(req.userId, { cartData });

    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update Cart
const updateCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;

    const userData = await userModel.findById(req.userId);
    if (!userData) return res.status(404).json({ success: false, message: "User not found" });

    let cartData = { ...userData.cartData };

    if (!cartData[itemId]) cartData[itemId] = {};
    cartData[itemId][size] = quantity;

    await userModel.findByIdAndUpdate(req.userId, { cartData });

    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get User Cart
const getUserCart = async (req, res) => {
  try {
    const userData = await userModel.findById(req.userId);
    if (!userData) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, cartData: userData.cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart };
