import VirtualDrill from '../models/virtualdrill.model.js';

// Add logger
const log = {
  info: (...args) => console.info(new Date().toISOString(), "[virtualdrillController]", ...args),
  warn: (...args) => console.warn(new Date().toISOString(), "[virtualdrillController]", ...args),
  error: (...args) => console.error(new Date().toISOString(), "[virtualdrillController]", ...args),
};

// Create a new virtual drill
export const createVirtualDrill = async (req, res) => {
  try {
    const { name, description, assests, targets, instructions, released } = req.body;
    const userId = req.user.id;

    log.info("Creating new virtual drill", { name, userId });

    // Validate required fields
    if (!name) {
      log.warn("Virtual drill creation failed - name is required");
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Validate assets structure if provided
    if (assests && Array.isArray(assests)) {
      for (const asset of assests) {
        if (!asset.name || !asset.type || !asset.imageURL) {
          log.warn("Virtual drill creation failed - invalid asset structure");
          return res.status(400).json({
            success: false,
            message: 'Each asset must have name, type, and imageURL'
          });
        }
        
        // Validate asset type
        if (!['model', 'text', 'raw'].includes(asset.type)) {
          log.warn("Virtual drill creation failed - invalid asset type", { type: asset.type });
          return res.status(400).json({
            success: false,
            message: 'Asset type must be model, text, or raw'
          });
        }
      }
    }

    const virtualDrill = new VirtualDrill({
      name,
      description: description || '',
      assests: assests || [],
      targets: targets || [],
      instructions: instructions || '',
      released: released || false,
      createdBy: userId
    });

    const savedDrill = await virtualDrill.save();
    log.info("Virtual drill created successfully", { drillId: savedDrill._id, name });

    res.status(201).json({
      success: true,
      message: 'Virtual drill created successfully',
      data: savedDrill
    });
  } catch (error) {
    log.error('Error creating virtual drill:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all virtual drills (with pagination and filtering)
export const getAllVirtualDrills = async (req, res) => {
  try {
    const { page = 1, limit = 10, released, search } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    log.info("Fetching virtual drills", { page, limit, released, search, userId, userRole });

    // Build filter object
    const filter = {};
    
    // If not admin, only show released drills or drills created by the user
    if (userRole !== 'admin') {
      filter.$or = [
        { released: true },
        { createdBy: userId }
      ];
    }

    // Filter by released status if specified
    if (released !== undefined) {
      filter.released = released === 'true';
    }

    // Add search functionality
    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { instructions: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [drills, total] = await Promise.all([
      VirtualDrill.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VirtualDrill.countDocuments(filter)
    ]);

    log.info("Virtual drills fetched successfully", { count: drills.length, total });

    res.status(200).json({
      success: true,
      message: 'Virtual drills fetched successfully',
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
    log.error('Error fetching virtual drills:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get virtual drill by ID
export const getVirtualDrillById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    log.info("Fetching virtual drill by ID", { drillId: id, userId });

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      log.warn("Invalid drill ID format", { drillId: id });
      return res.status(400).json({
        success: false,
        message: 'Invalid drill ID format'
      });
    }

    const drill = await VirtualDrill.findById(id).populate('createdBy', 'name email');

    if (!drill) {
      log.warn("Virtual drill not found", { drillId: id });
      return res.status(404).json({
        success: false,
        message: 'Virtual drill not found'
      });
    }

    // Check access permissions
    if (userRole !== 'admin' && !drill.released && drill.createdBy._id.toString() !== userId) {
      log.warn("Access denied to virtual drill", { drillId: id, userId });
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    log.info("Virtual drill fetched successfully", { drillId: id });

    res.status(200).json({
      success: true,
      message: 'Virtual drill fetched successfully',
      data: drill
    });
  } catch (error) {
    log.error('Error fetching virtual drill:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update virtual drill
export const updateVirtualDrill = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    log.info("Updating virtual drill", { drillId: id, userId });

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      log.warn("Invalid drill ID format", { drillId: id });
      return res.status(400).json({
        success: false,
        message: 'Invalid drill ID format'
      });
    }

    const drill = await VirtualDrill.findById(id);

    if (!drill) {
      log.warn("Virtual drill not found for update", { drillId: id });
      return res.status(404).json({
        success: false,
        message: 'Virtual drill not found'
      });
    }

    // Check permissions - only admin or creator can update
    if (userRole !== 'admin' && drill.createdBy?.toString() !== userId) {
      log.warn("Update access denied", { drillId: id, userId });
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate assets structure if being updated
    if (updateData.assests && Array.isArray(updateData.assests)) {
      for (const asset of updateData.assests) {
        if (!asset.name || !asset.type || !asset.imageURL) {
          log.warn("Virtual drill update failed - invalid asset structure");
          return res.status(400).json({
            success: false,
            message: 'Each asset must have name, type, and imageURL'
          });
        }
        
        if (!['model', 'text', 'raw'].includes(asset.type)) {
          log.warn("Virtual drill update failed - invalid asset type", { type: asset.type });
          return res.status(400).json({
            success: false,
            message: 'Asset type must be model, text, or raw'
          });
        }
      }
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.createdBy;

    const updatedDrill = await VirtualDrill.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    log.info("Virtual drill updated successfully", { drillId: id });

    res.status(200).json({
      success: true,
      message: 'Virtual drill updated successfully',
      data: updatedDrill
    });
  } catch (error) {
    log.error('Error updating virtual drill:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete virtual drill
export const deleteVirtualDrill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    log.info("Deleting virtual drill", { drillId: id, userId });

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      log.warn("Invalid drill ID format", { drillId: id });
      return res.status(400).json({
        success: false,
        message: 'Invalid drill ID format'
      });
    }

    const drill = await VirtualDrill.findById(id);

    if (!drill) {
      log.warn("Virtual drill not found for deletion", { drillId: id });
      return res.status(404).json({
        success: false,
        message: 'Virtual drill not found'
      });
    }

    // Check permissions - only admin or creator can delete
    if (userRole !== 'admin' && drill.createdBy?.toString() !== userId) {
      log.warn("Delete access denied", { drillId: id, userId });
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await VirtualDrill.findByIdAndDelete(id);
    log.info("Virtual drill deleted successfully", { drillId: id });

    res.status(200).json({
      success: true,
      message: 'Virtual drill deleted successfully'
    });
  } catch (error) {
    log.error('Error deleting virtual drill:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Toggle release status (admin only)
export const toggleReleaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    log.info("Toggling release status", { drillId: id, userId });

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      log.warn("Invalid drill ID format", { drillId: id });
      return res.status(400).json({
        success: false,
        message: 'Invalid drill ID format'
      });
    }

    const drill = await VirtualDrill.findById(id);

    if (!drill) {
      log.warn("Virtual drill not found for release toggle", { drillId: id });
      return res.status(404).json({
        success: false,
        message: 'Virtual drill not found'
      });
    }

    const updatedDrill = await VirtualDrill.findByIdAndUpdate(
      id,
      { released: !drill.released, updatedAt: new Date() },
      { new: true }
    ).populate('createdBy', 'name email');

    log.info("Release status toggled successfully", { drillId: id, newStatus: updatedDrill.released });

    res.status(200).json({
      success: true,
      message: `Virtual drill ${updatedDrill.released ? 'released' : 'unreleased'} successfully`,
      data: updatedDrill
    });
  } catch (error) {
    log.error('Error toggling release status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get virtual drills by current user
export const getMyVirtualDrills = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    log.info("Fetching user's virtual drills", { userId, page, limit });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [drills, total] = await Promise.all([
      VirtualDrill.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VirtualDrill.countDocuments({ createdBy: userId })
    ]);

    log.info("User's virtual drills fetched successfully", { count: drills.length, total });

    res.status(200).json({
      success: true,
      message: 'Your virtual drills fetched successfully',
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
    log.error('Error fetching user virtual drills:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
