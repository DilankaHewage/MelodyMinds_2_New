import express from "express";
import multer from "multer";
import { createEvent, getAllEvents } from "../controllers/event.controller.js";
import { getEventById } from "../controllers/event.controller.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to fetch all events
router.get("/", getAllEvents);

// Route to fetch a single event by ID
router.get("/:id", getEventById);

// Route to create an event with poster upload
router.post("/", upload.single("poster"), createEvent);

export default router; // event.route.js 