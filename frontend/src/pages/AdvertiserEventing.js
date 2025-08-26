import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";
import PreviewEventCard from "../components/PreviewEventCard"; // Import Preview Card component
import AdvertiserPayment from "../components/AdvertiserPayment"; // Import Advertiser Payment component
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [posterUrl, setPosterUrl] = useState(null);

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
      // Upload poster to Firebase Storage first
      let uploadedPosterUrl = "";
      if (poster) {
        console.log("Uploading poster to Firebase Storage...");
        const storageRef = ref(storage, `event-posters/${Date.now()}-${poster.name}`);
        const snapshot = await uploadBytes(storageRef, poster);
        uploadedPosterUrl = await getDownloadURL(snapshot.ref);
        console.log("Poster uploaded successfully. URL:", uploadedPosterUrl);
        setPosterUrl(uploadedPosterUrl);
      }

      // Set poster URL in event data and show payment modal
      setEventData(prev => ({ ...prev, posterUrl: uploadedPosterUrl }));
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error uploading poster:", error);
      alert("Failed to upload poster. Please try again.");
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    alert("Payment successful! Your event has been published.");
    console.log("Payment successful:", paymentIntent);

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
    setPosterUrl(null);
    setShowPaymentModal(false);
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
    alert(`Payment failed: ${error}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  // Calculate publication fee (5 times the ticket price)
  const calculatePublicationFee = () => {
    const ticketPrice = parseFloat(eventData.ticketPrice) || 0;
    return ticketPrice * 5;
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
          
          {/* Display publication fee */}
          {eventData.ticketPrice && (
            <div className="publication-fee-info">
              <p><strong>Publication Fee: Rs. {calculatePublicationFee().toLocaleString()}</strong></p>
              <small>This is 5 times your ticket price and is required to publish your event.</small>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <AdvertiserPayment
          amount={calculatePublicationFee()}
          eventData={{ ...eventData, posterUrl }}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
};

export default AdvertiserEventing;