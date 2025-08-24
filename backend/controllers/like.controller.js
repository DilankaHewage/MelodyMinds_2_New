import Like from '../models/like.model.js';
import Event from '../models/event.model.js';

// Toggle like (like/unlike)
export const toggleLike = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Check if user already liked this event
    const existingLike = await Like.findOne({
      event: eventId,
      user: userId,
      isActive: true
    });

    if (existingLike) {
      // Unlike - mark as inactive
      existingLike.isActive = false;
      await existingLike.save();
      
      res.status(200).json({
        success: true,
        message: "Event unliked successfully",
        liked: false
      });
    } else {
      // Like - create new like
      const newLike = new Like({
        event: eventId,
        user: userId,
        isActive: true
      });
      await newLike.save();
      
      res.status(201).json({
        success: true,
        message: "Event liked successfully",
        liked: true
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Get like count for an event
export const getLikeCount = async (req, res) => {
  try {
    const { eventId } = req.params;

    const likeCount = await Like.countDocuments({
      event: eventId,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: { likeCount }
    });
  } catch (error) {
    console.error("Error getting like count:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Check if current user has liked an event
export const checkUserLike = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const like = await Like.findOne({
      event: eventId,
      user: userId,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: { liked: !!like }
    });
  } catch (error) {
    console.error("Error checking user like:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Get all likes for an event (for debugging)
export const getEventLikes = async (req, res) => {
  try {
    const { eventId } = req.params;

    const likes = await Like.find({
      event: eventId,
      isActive: true
    }).populate('user', 'firstName lastName email');

    res.status(200).json({
      success: true,
      data: likes
    });
  } catch (error) {
    console.error("Error getting event likes:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
