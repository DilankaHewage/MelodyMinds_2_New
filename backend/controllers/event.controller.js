import Event from "../models/event.model.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig.js";

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, district, artist, ticketPrice, ticketLink } = req.body;

    // Check if poster is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Poster is required" });
    }

    // Upload poster to Firebase Storage
    const storageRef = ref(storage, `event-posters/${Date.now()}-${req.file.originalname}`);
    const snapshot = await uploadBytes(storageRef, req.file.buffer);
    const posterUrl = await getDownloadURL(snapshot.ref);

    // Create event document with poster URL
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
    });

    // Save the event
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find(); // Fetch all events from the database
    res.status(200).json(events); // Send events as JSON response
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