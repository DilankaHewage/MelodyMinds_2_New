import express from "express";
import multer from "multer";
import { 
  createEvent, 
  getAllEvents, 
  getEventById, 
  getEventsByAdvertiser,
  updateEvent,
  deleteEvent
} from "../controllers/event.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public routes (no authentication required)
router.get("/", getAllEvents); // All users can see all events
router.get("/:id", getEventById); // All users can see individual events

// Protected routes (authentication required)
router.post("/", protect, upload.single("poster"), createEvent); // Only advertisers can create events
router.get("/advertiser/my-events", protect, getEventsByAdvertiser); // Advertisers see only their own events
router.put("/:id", protect, updateEvent); // Advertisers can update only their own events
router.delete("/:id", protect, deleteEvent); // Advertisers can delete only their own events

export default router; // event.route.js 