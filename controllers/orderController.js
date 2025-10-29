const Order = require('../models/Order');
const Customer = require('../models/Customer');
const MenuItem = require('../models/MenuItem');
const { sendOrderReceipt } = require('../utils/email');

const generateOrderNumber = async () => {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const lastNumber = lastOrder && lastOrder.orderNumber ? parseInt(lastOrder.orderNumber.slice(1)) : 0;
    const newNumber = lastNumber + 1;
    return `M${newNumber.toString().padStart(6, '0')}`; // e.g., M000001
};


// @desc    Create order after successful payment
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
  try {
    const {
      tableNumber,
      customerEmail,
      items,
      subtotal,
      gst,
      total,
      paymentId
    } = req.body;

    const orderNumber = await generateOrderNumber();
    console.log("req.body: ",req.body);
    // Validate required fields
    if (!tableNumber || !customerEmail || !items || !total || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create order
    const order = await Order.create({
      orderNumber,
      tableNumber,
      customerEmail,
      items,
      subtotal,
      gst,
      total,
      paymentId,
      paymentStatus: 'completed',
      orderStatus: 'pending'
    });

    // Update or create customer
    let customer = await Customer.findOne({ email: customerEmail });
    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent += total;
      customer.lastOrderAt = new Date();
      await customer.save();
    } else {
      await Customer.create({
        email: customerEmail,
        totalOrders: 1,
        totalSpent: total,
        lastOrderAt: new Date()
      });
    }

    // Populate order with menu items
    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem');

    // Send receipt email
    try {
      await sendOrderReceipt(populatedOrder, customerEmail);
      populatedOrder.receiptSent = true;
      await populatedOrder.save();
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:orderId
// @access  Public
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.menuItem');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Private
exports.getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate, limit = 50 } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.orderStatus = status;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate('items.menuItem')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      total: totalOrders,
      orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: 'Order status is required'
      });
    }

    const validStatuses = ['pending', 'preparing', 'completed', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = orderStatus;
    
    if (orderStatus === 'completed') {
      order.completedAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};
