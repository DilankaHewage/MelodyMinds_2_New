import Event from "../models/event.model.js";
import mongoose from "mongoose";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig.js";

export const createEvent = async (req, res) => {
  try {
    // Check if user is authenticated and is an advertiser
    if (!req.user || req.user.userType !== 'advertiser') {
      return res.status(403).json({ 
        success: false,
        message: "Only advertisers can create events" 
      });
    }

    const { title, description, date, time, venue, district, artist, ticketPrice, ticketLink } = req.body;

    // Check if poster is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Poster is required" });
    }

    // Upload poster to Firebase Storage
    const storageRef = ref(storage, `event-posters/${Date.now()}-${req.file.originalname}`);
    const snapshot = await uploadBytes(storageRef, req.file.buffer);
    const posterUrl = await getDownloadURL(snapshot.ref);

    // Create event document with poster URL and advertiser ID
    const event = new Event({
      title,
      description,
      date,
      time,
      venue,
      district,
      artist,
      ticketPrice,
      ticketLink,
      poster: posterUrl,
      advertiser: req.user._id, // Link event to the advertiser who created it
      isActive: true
    });

    // Save the event
    const savedEvent = await event.save();
    res.status(201).json({
      success: true,
      data: savedEvent
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }); // Fetch all active events from the database
    
    // Get like and comment counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const likeCount = await mongoose.model('Like').countDocuments({
          event: event._id,
          isActive: true
        });
        
        const commentCount = await mongoose.model('Comment').countDocuments({
          event: event._id,
          isActive: true
        });
        
        return {
          ...event.toObject(),
          likeCount,
          commentCount
        };
      })
    );
    
    res.status(200).json(eventsWithCounts); // Send events with counts as JSON response
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id); // Fetch event by ID
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
};

// Get events by advertiser (ONLY the advertiser who created them)
export const getEventsByAdvertiser = async (req, res) => {
  try {
    // Check if user is an advertiser
    if (req.user.userType !== 'advertiser') {
      return res.status(403).json({ 
        success: false, 
        message: "Only advertisers can view their own events" 
      });
    }

    // DEBUG: Log the user information to verify authentication
    console.log('=== DEBUG: Event Access Control ===');
    console.log('User ID:', req.user._id);
    console.log('User Type:', req.user.userType);
    console.log('User Email:', req.user.companyEmail || req.user.email);

    // CRITICAL: Only show events created by this specific advertiser
    // Other advertisers cannot see events they didn't create
    const query = { 
      advertiser: req.user._id,  // This ensures only own events are shown
      isActive: true 
    };
    
    console.log('Database Query:', JSON.stringify(query));
    
    const events = await Event.find(query).sort({ createdAt: -1 });
    
    // Get like and comment counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const likeCount = await mongoose.model('Like').countDocuments({
          event: event._id,
          isActive: true
        });
        
        const commentCount = await mongoose.model('Comment').countDocuments({
          event: event._id,
          isActive: true
        });
        
        return {
          ...event.toObject(),
          likeCount,
          commentCount
        };
      })
    );
    
    console.log('Found events count:', eventsWithCounts.length);
    if (eventsWithCounts.length > 0) {
      console.log('Event IDs:', eventsWithCounts.map(event => event._id));
      console.log('Event advertisers:', eventsWithCounts.map(event => event.advertiser));
    } else {
      console.log('No events found for this advertiser');
    }
    console.log('=== END DEBUG ===');
    
    res.status(200).json({ 
      success: true, 
      data: eventsWithCounts 
    });
  } catch (error) {
    console.error("Error fetching advertiser events:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error" 
    });
  }
};

// Update event (only by the advertiser who created it)
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is an advertiser
    if (req.user.userType !== 'advertiser') {
      return res.status(403).json({ 
        success: false, 
        message: "Only advertisers can update events" 
      });
    }

    // Find the event and check ownership
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }

    // Check if the advertiser owns this event
    if (event.advertiser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only update your own events" 
      });
    }

    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    console.error("Error updating event:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error" 
    });
  }
};

// Delete event (only by the advertiser who created it)
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is an advertiser
    if (req.user.userType !== 'advertiser') {
      return res.status(403).json({ 
        success: false, 
        message: "Only advertisers can delete events" 
      });
    }

    // Find the event and check ownership
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }

    // Check if the advertiser owns this event
    if (event.advertiser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own events" 
      });
    }

    // Soft delete - mark as inactive instead of removing
    event.isActive = false;
    await event.save();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting event:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error" 
    });
  }
};