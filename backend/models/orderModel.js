import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  subtotal: { 
    type: Number,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [orderItemSchema],
  amount: { 
    type: Number, 
    required: true 
  },
  subtotal: {
    type: Number,
    required: true
  },
  shipping: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User.addresses'
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'PayPal', 'COD'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  trackingNumber: {
    type: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual population to get address details
orderSchema.virtual('address', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Indexes for better performance
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;










/*
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    uppercase: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Street cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  zip: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{5,10}(-\d{4})?$/, 'Invalid ZIP code format']
  },
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Country cannot exceed 50 characters']
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: (items) => items.length > 0,
      message: 'At least one order item is required'
    }
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  shippingFee: {
    type: Number,
    required: [true, 'Shipping fee is required'],
    min: [0, 'Shipping fee cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  shippingAddress: {
    type: addressSchema,
    required: [true, 'Shipping address is required']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: [
        'ORDER_PLACED', 
        'PROCESSING', 
        'SHIPPED', 
        'OUT_FOR_DELIVERY', 
        'DELIVERED', 
        'CANCELLED',
        'RETURN_REQUESTED',
        'REFUNDED'
      ],
      message: 'Invalid order status'
    },
    default: 'ORDER_PLACED'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: {
      values: ['COD', 'STRIPE', 'PAYPAL', 'RAZORPAY', 'BANK_TRANSFER'],
      message: 'Invalid payment method'
    }
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: {
      values: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
      message: 'Invalid payment status'
    },
    default: 'PENDING'
  },
  transactionId: {
    type: String,
    trim: true,
    maxlength: [100, 'Transaction ID cannot exceed 100 characters']
  },
  trackingNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Tracking number cannot exceed 50 characters']
  }
}, {
  timestamps: true,  // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.zip': 1 });

// Virtual for formatted order number
orderSchema.virtual('orderNumber').get(function() {
  return `ORD-${this._id.toString().substring(18, 24).toUpperCase()}`;
});

// Pre-save hook to calculate prices
orderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce(
      (sum, item) => sum + (item.unitPrice * item.quantity), 0
    );
    this.totalAmount = this.subtotal + this.shippingFee;
  }
  next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
*/ 