const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Customer = require('../models/Customer');

// @desc    Get dashboard stats
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Orders today
    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    // Total revenue
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Revenue today
    const revenueTodayResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: today }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const revenueToday = revenueTodayResult[0]?.total || 0;

    // Revenue last 30 days
    const revenueLast30DaysResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const revenueLast30Days = revenueLast30DaysResult[0]?.total || 0;

    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Pending orders
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['pending', 'preparing'] }
    });

    // Total customers
    const totalCustomers = await Customer.countDocuments();

    // Most ordered items (top 5)
    const popularItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        ordersToday,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        revenueToday: parseFloat(revenueToday.toFixed(2)),
        revenueLast30Days: parseFloat(revenueLast30Days.toFixed(2)),
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        pendingOrders,
        totalCustomers,
        popularItems
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// @desc    Get revenue data over time
// @route   GET /api/analytics/revenue
// @access  Private
exports.getRevenueData = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    // Revenue by day
    const revenueByDay = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Format data
    const formattedData = revenueByDay.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      revenue: parseFloat(item.revenue.toFixed(2)),
      orders: item.orders
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Get revenue data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue data',
      error: error.message
    });
  }
};

// @desc    Get popular items
// @route   GET /api/analytics/popular-items
// @access  Private
exports.getPopularItems = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            itemId: '$items.menuItem',
            name: '$items.name'
          },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] }
          },
          avgPrice: { $avg: '$items.price' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Format data
    const formattedData = popularItems.map(item => ({
      name: item._id.name,
      quantity: item.totalQuantity,
      revenue: parseFloat(item.totalRevenue.toFixed(2)),
      avgPrice: parseFloat(item.avgPrice.toFixed(2))
    }));

    res.json({
      success: true,
      items: formattedData
    });
  } catch (error) {
    console.error('Get popular items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular items',
      error: error.message
    });
  }
};
