import express from 'express';
import {
  createVirtualDrill,
  getAllVirtualDrills,
  getVirtualDrillById,
  updateVirtualDrill,
  deleteVirtualDrill,
  toggleReleaseStatus,
  getMyVirtualDrills
} from '../controllers/virtualdrillController.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import VirtualDrill from '../models/virtualdrill.model.js';

const router = express.Router();

// Public routes (no authentication required)
// GET /api/virtualdrills/public - Get only released virtual drills for public viewing
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    // Build filter for only released drills
    const filter = { released: true };
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructions: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [drills, total] = await Promise.all([
      VirtualDrill.find(filter)
        .populate('createdBy', 'name')
        .select('-__v') // Exclude version field
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VirtualDrill.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Public virtual drills fetched successfully',
      data: {
        drills,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Protected routes (authentication required)
// Apply authentication middleware to all routes below
router.use(authMiddleware);

// GET /api/virtualdrills/my - Get current user's virtual drills
router.get('/my', getMyVirtualDrills);

// GET /api/virtualdrills - Get all virtual drills (with access control)
router.get('/', getAllVirtualDrills);

// POST /api/virtualdrills - Create new virtual drill (authenticated users only)
router.post('/', createVirtualDrill);

// GET /api/virtualdrills/:id - Get specific virtual drill by ID
router.get('/:id', getVirtualDrillById);

// PUT /api/virtualdrills/:id - Update virtual drill (creator or admin only)
router.put('/:id', updateVirtualDrill);

// DELETE /api/virtualdrills/:id - Delete virtual drill (creator or admin only)
router.delete('/:id', deleteVirtualDrill);

// Admin-only routes
// PATCH /api/virtualdrills/:id/toggle-release - Toggle release status (admin only)
router.patch('/:id/toggle-release', roleMiddleware('admin'), toggleReleaseStatus);

// Additional admin routes
// GET /api/virtualdrills/admin/all - Get all virtual drills for admin (including unreleased)
router.get('/admin/all', roleMiddleware('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, released, createdBy } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Filter by released status if specified
    if (released !== undefined) {
      filter.released = released === 'true';
    }
    
    // Filter by creator if specified
    if (createdBy) {
      filter.createdBy = createdBy;
    }
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructions: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [drills, total] = await Promise.all([
      VirtualDrill.find(filter)
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VirtualDrill.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Admin virtual drills fetched successfully',
      data: {
        drills,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/virtualdrills/admin/stats - Get statistics for admin dashboard
router.get('/admin/stats', roleMiddleware('admin'), async (req, res) => {
  try {
    const [
      totalDrills,
      releasedDrills,
      unreleasedDrills,
      recentDrills
    ] = await Promise.all([
      VirtualDrill.countDocuments(),
      VirtualDrill.countDocuments({ released: true }),
      VirtualDrill.countDocuments({ released: false }),
      VirtualDrill.find()
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name createdAt released createdBy')
    ]);

    res.status(200).json({
      success: true,
      message: 'Virtual drill statistics fetched successfully',
      data: {
        statistics: {
          total: totalDrills,
          released: releasedDrills,
          unreleased: unreleasedDrills,
          releaseRate: totalDrills > 0 ? ((releasedDrills / totalDrills) * 100).toFixed(2) : 0
        },
        recentDrills
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Institute admin routes (can manage drills for their institute)
// GET /api/virtualdrills/institute/drills - Get drills for institute admin's institute
router.get('/institute/drills', roleMiddleware('institute-admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const instituteAdminId = req.user.id;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find drills created by users from the same institute
    // This would require additional logic to find users from the same institute
    // For now, showing drills created by the institute admin
    const [drills, total] = await Promise.all([
      VirtualDrill.find({ createdBy: instituteAdminId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VirtualDrill.countDocuments({ createdBy: instituteAdminId })
    ]);

    res.status(200).json({
      success: true,
      message: 'Institute virtual drills fetched successfully',
      data: {
        drills,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
