const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

// @desc    Get all categories with items
// @route   GET /api/menu/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('order');
    
    // Get items for each category
    const categoriesWithItems = await Promise.all(
      categories.map(async (category) => {
        const items = await MenuItem.find({ 
          category: category._id,
          isAvailable: true 
        });
        
        return {
          id: category._id,
          name: category.name,
          icon: category.icon,
          items
        };
      })
    );

    res.json({
      success: true,
      categories: categoriesWithItems
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// @desc    Create category
// @route   POST /api/menu/categories
// @access  Private
exports.createCategory = async (req, res) => {
  try {
    const { name, icon, order } = req.body;

    const category = await Category.create({
      name,
      icon,
      order
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/menu/categories/:id
// @access  Private
exports.updateCategory = async (req, res) => {
  try {
    const { name, icon, order, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, icon, order, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/menu/categories/:id
// @access  Private
exports.deleteCategory = async (req, res) => {
  try {
    // Check if category has items
    const itemCount = await MenuItem.countDocuments({ category: req.params.id });
    
    if (itemCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with items. Remove items first.'
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

// @desc    Get all menu items
// @route   GET /api/menu/items
// @access  Public
exports.getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true })
      .populate('category', 'name icon')
      .sort('name');

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items',
      error: error.message
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/items/:id
// @access  Public
exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
      .populate('category', 'name icon');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu item',
      error: error.message
    });
  }
};

// @desc    Create menu item
// @route   POST /api/menu/items
// @access  Private
exports.createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      isVeg,
      isPopular,
      prepTime
    } = req.body;

    const item = await MenuItem.create({
      name,
      description,
      price,
      category,
      image,
      isVeg,
      isPopular,
      prepTime
    });

    const populatedItem = await MenuItem.findById(item._id)
      .populate('category', 'name icon');

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      item: populatedItem
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating menu item',
      error: error.message
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/items/:id
// @access  Private
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name icon');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      item
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating menu item',
      error: error.message
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/items/:id
// @access  Private
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item',
      error: error.message
    });
  }
};
