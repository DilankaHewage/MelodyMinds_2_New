import React, { useState } from "react";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";
import PreviewEventCard from "../components/PreviewEventCard"; // Import Preview Card component
import "./AdvertiserEventing.css";

const AdvertiserEventing = () => {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    district: "",
    artist: "",
    ticketPrice: "",
    ticketLink: "",
  });
  const [poster, setPoster] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null); // For previewing the poster

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    setPoster(file);
    setPosterPreview(file ? URL.createObjectURL(file) : null); // Set poster preview
    console.log("Poster selected:", file); // Debugging log
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Upload poster to Firebase Storage
      let posterUrl = "";
      if (poster) {
        console.log("Uploading poster to Firebase Storage...");
        const storageRef = ref(storage, `event-posters/${Date.now()}-${poster.name}`);
        const snapshot = await uploadBytes(storageRef, poster);
        posterUrl = await getDownloadURL(snapshot.ref);
        console.log("Poster uploaded successfully. URL:", posterUrl);
      }

      // Send event data to the backend
      const token = localStorage.getItem("userToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Ensure correct content type
        },
      };

      const formData = new FormData();
      formData.append("title", eventData.title);
      formData.append("description", eventData.description);
      formData.append("date", eventData.date);
      formData.append("time", eventData.time);
      formData.append("venue", eventData.venue);
      formData.append("district", eventData.district);
      formData.append("artist", eventData.artist);
      formData.append("ticketPrice", eventData.ticketPrice);
      formData.append("ticketLink", eventData.ticketLink);
      formData.append("poster", poster); // Append the file

      console.log("Sending event data to backend...");
      const response = await axios.post("http://localhost:5000/api/events", formData, config);

      alert("Event created successfully!");
      console.log("Event created:", response.data);

      // Reset form fields
      setEventData({
        title: "",
        description: "",
        date: "",
        time: "",
        venue: "",
        district: "",
        artist: "",
        ticketPrice: "",
        ticketLink: "",
      });
      setPoster(null);
      setPosterPreview(null);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event.");
    }
  };

  return (
    <div className="advertiser-eventing">
      <div className="eventing-container">
        {/* Left Section: Input Form */}
        <div className="event-form-container">
          <h2>Create Event</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input type="text" name="title" value={eventData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={eventData.description} onChange={handleChange} required></textarea>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={eventData.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" name="time" value={eventData.time} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Venue</label>
              <input type="text" name="venue" value={eventData.venue} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>District</label>
              <input type="text" name="district" value={eventData.district} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Artist</label>
              <input type="text" name="artist" value={eventData.artist} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Ticket Price (Rs)</label>
              <input type="number" name="ticketPrice" value={eventData.ticketPrice} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Ticket Count</label>
              <input type="number" name="ticketLink" value={eventData.ticketLink} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Poster</label>
              <input type="file" accept="image/*" onChange={handlePosterChange} required />
            </div>
            <button type="submit" className="submit-button">Proceed to Payment</button>
          </form>
        </div>

        {/* Right Section: Event Card Preview */}
     
        <div className="event-preview-container">
          <h2>Event Preview</h2>
          <PreviewEventCard
            event={{
              title: eventData.title || "Event Title",
              description: eventData.description || "Event Description",
              date: eventData.date || "Event Date",
              time: eventData.time || "Event Time",
              venue: eventData.venue || "Event Venue",
              district: eventData.district || "Event District",
              artist: eventData.artist || "Artist Name",
              ticketPrice: eventData.ticketPrice || "Ticket Price",
              ticketLink: eventData.ticketLink || "Ticket Link",
              poster: posterPreview || "/images/empty.jpg", // Use preview URL or default image
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvertiserEventing;