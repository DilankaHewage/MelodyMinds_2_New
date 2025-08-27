import Advertisement from '../models/advertisement.model.js';
import Advertiser from '../models/advertiser.model.js';

// Debug endpoint to test access control
export const debugUserInfo = async (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      message: "Debug information",
      user: {
        _id: req.user._id,
        userType: req.user.userType,
        email: req.user.email || req.user.companyEmail,
        name: req.user.name || `${req.user.firstName} ${req.user.lastName}`.trim()
      }
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error" 
    });
  }
};

// Debug endpoint to see all advertisements in database (for testing only)
export const debugAllAdvertisements = async (req, res) => {
  try {
    // This is for debugging only - shows all advertisements with owner info
    const allAds = await Advertisement.find({}).populate('advertiser', 'companyName firstName lastName email');
    
    res.status(200).json({ 
      success: true, 
      message: "Debug: All advertisements in database",
      totalCount: allAds.length,
      advertisements: allAds.map(ad => ({
        id: ad._id,
        title: ad.title,
        advertiser: {
          id: ad.advertiser._id,
          name: `${ad.advertiser.firstName} ${ad.advertiser.lastName}`.trim(),
          company: ad.advertiser.companyName,
          email: ad.advertiser.email
        },
        isActive: ad.isActive,
        createdAt: ad.createdAt
      }))
    });
  } catch (error) {
    console.error("Error in debug all advertisements:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error" 
    });
  }
};

// Create advertisement (only advertisers)
export const createAdvertisement = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ 
        success: false, 
        message: "Title and description are required" 
      });
    }

    const newAdvertisement = new Advertisement({
      title,
      description,
      image,
      advertiser: req.user._id
    });

    await newAdvertisement.save();
    
    res.status(201).json({ 
      success: true, 
      data: newAdvertisement 
    });
  } catch (error) {
    console.error("Error creating advertisement:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error" 
    });
  }
};

// Get all advertisements (PUBLIC ACCESS - users can see all advertisements, advertisers can see all too)
export const getAllAdvertisements = async (req, res) => {
  try {
    // This endpoint is completely public - users and advertisers can view ALL active advertisements
    // This allows users to browse all ads, and advertisers to see what others are posting
    const advertisements = await Advertisement.find({ isActive: true })
      .populate('advertiser', 'companyName firstName lastName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      data: advertisements 
    });
  } catch (error) {
    console.error("Error fetching advertisements:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error" 
    });
  }
};

// Get advertisements by advertiser (ONLY the advertiser who posted them - not other advertisers)
export const getAdvertisementsByAdvertiser = async (req, res) => {
  try {
    // Check if user is an advertiser
    if (req.user.userType !== 'advertiser') {
      return res.status(403).json({ 
        success: false, 
        message: "Only advertisers can view their own advertisements" 
      });
    }

    // DEBUG: Log the user information to verify authentication
    console.log('=== DEBUG: Advertiser Access Control ===');
    console.log('User ID:', req.user._id);
    console.log('User Type:', req.user.userType);
    console.log('User Email:', req.user.companyEmail || req.user.email);

    // CRITICAL: Only show advertisements created by this specific advertiser
    // Other advertisers cannot see advertisements they didn't create
    const query = { 
      advertiser: req.user._id,  // This ensures only own advertisements are shown
      isActive: true 
    };
    
    console.log('Database Query:', JSON.stringify(query));
    
    const advertisements = await Advertisement.find(query).sort({ createdAt: -1 });
    
    console.log('Found advertisements count:', advertisements.length);
    if (advertisements.length > 0) {
      console.log('Advertisement IDs:', advertisements.map(ad => ad._id));
      console.log('Advertisement advertisers:', advertisements.map(ad => ad.advertiser));
    } else {
      console.log('No advertisements found for this advertiser');
    }
    console.log('=== END DEBUG ===');
    
    res.status(200).json({ 
      success: true, 
      data: advertisements 
    });
  } catch (error) {
    console.error("Error fetching advertiser advertisements:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error" 
    });
  }
};

// Get single advertisement by ID (for users to view)
export const getAdvertisementById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const advertisement = await Advertisement.findById(id)
      .populate('advertiser', 'companyName firstName lastName');
    
    if (!advertisement || !advertisement.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: "Advertisement not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: advertisement 
    });
  } catch (error) {
    console.error("Error fetching advertisement:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error" 
    });
  }
};

// Update advertisement (only the advertiser who posted it)
export const updateAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;
    
    // Check if user is an advertiser
    if (req.user.userType !== 'advertiser') {
      return res.status(403).json({ 
        success: false, 
        message: "Only advertisers can update advertisements" 
      });
    }

    const advertisement = await Advertisement.findById(id);
    
    if (!advertisement) {
      return res.status(404).json({ 
        success: false, 
        message: "Advertisement not found" 
      });
    }

    // Check if the advertiser owns this advertisement
    if (advertisement.advertiser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only update your own advertisements" 
      });
    }

    const updatedAdvertisement = await Advertisement.findByIdAndUpdate(
      id, 
      { title, description, image }, 
      { new: true }
    );
    
    res.status(200).json({ 
      success: true, 
      data: updatedAdvertisement 
    });
  } catch (error) {
    console.error("Error updating advertisement:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error" 
    });
  }
};

// Delete advertisement (only the advertiser who posted it)
export const deleteAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is an advertiser
    if (req.user.userType !== 'advertiser') {
      return res.status(403).json({ 
        success: false, 
        message: "Only advertisers can delete advertisements" 
      });
    }

    const advertisement = await Advertisement.findById(id);
    
    if (!advertisement) {
      return res.status(404).json({ 
        success: false, 
        message: "Advertisement not found" 
      });
    }

    // Check if the advertiser owns this advertisement
    if (advertisement.advertiser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own advertisements" 
      });
    }

    // Soft delete by setting isActive to false
    await Advertisement.findByIdAndUpdate(id, { isActive: false });
    
    res.status(200).json({ 
      success: true, 
      message: "Advertisement deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting advertisement:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error" 
    });
  }
};
