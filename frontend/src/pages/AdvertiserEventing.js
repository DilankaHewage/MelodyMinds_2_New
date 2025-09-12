import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";
import PreviewEventCard from "../components/PreviewEventCard"; // Import Preview Card component
import AdvertiserPayment from "../components/AdvertiserPayment"; // Import Advertiser Payment component
import "./AdvertiserEventing.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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
  const [location, setLocation] = useState({ lat: 7.8731, lng: 80.7718 });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationText, setLocationText] = useState("");
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
      setEventData(prev => ({ ...prev, posterUrl: uploadedPosterUrl, lat: location.lat, lng: location.lng }));
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

function LocationPicker({ setLocation, onSelected }) {
  useMapEvents({
    click(e) {
      const next = { lat: e.latlng.lat, lng: e.latlng.lng };
      setLocation(next);
      if (onSelected) {
        onSelected(next);
      }
    },
  });
  return null;
}


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
              <input
                    type="date"
                    name="date"
                    value={eventData.date}
                    onChange={handleChange}
                    required
              min={new Date().toISOString().split("T")[0]} // ✅ disables past dates
              />

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
  <select
    name="district"
    value={eventData.district}
    onChange={handleChange}
    required
  >
    <option value="">-- Select District --</option>
    <option value="Colombo">Colombo</option>
    <option value="Gampaha">Gampaha</option>
    <option value="Kalutara">Kalutara</option>
    <option value="Kandy">Kandy</option>
    <option value="Matale">Matale</option>
    <option value="Galle">Galle</option>
    <option value="Matara">Matara</option>
    <option value="Hambantota">Hambantota</option>
    <option value="Vavuniya">Vavuniya</option>
    <option value="Kilinochchi">Kilinochchi</option>
    <option value="Mannar">Mannar</option>
    <option value="Jaffna">Jaffna</option>
    <option value="Mullaitivu">Mullaitivu</option>
    <option value="Batticaloa">Batticaloa</option>
    <option value="Ampara">Ampara</option>
    <option value="Trincomalee">Trincomalee</option>
    <option value="Kurunegala">Kurunegala</option>
    <option value="Puttalam">Puttalam</option>
    <option value="Anuradhapura">Anuradhapura</option>
    <option value="Polonnaruwa">Polonnaruwa</option>
    <option value="Badulla">Badulla</option>
    <option value="Monaragala">Monaragala</option>
    <option value="Ratnapura">Ratnapura</option>
    <option value="Kegalle">Kegalle</option>
    <option value="NuwaraEliya">Nuwara Eliya</option>
  </select>
</div>

            <div className="form-group">
              <label>Event Location</label>
              <input
                type="text"
                name="eventLocation"
                value={locationText}
                onClick={() => setShowLocationPicker(true)}
                onFocus={() => setShowLocationPicker(true)}
                placeholder="Click to pick on map"
                readOnly
              />
              {showLocationPicker && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, background: '#fff' }}>
                  <button className="close-map-button"
                    type="button"
                    onClick={() => setShowLocationPicker(false)}
                    style={{ position: 'absolute', top: 12, right: 12, zIndex: 1001 }}
                  >
                    Close
                  </button>
                  <MapContainer center={[location.lat, location.lng]} zoom={8} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[location.lat, location.lng]} />
                    <LocationPicker
                      setLocation={setLocation}
                      onSelected={({ lat, lng }) => {
                        setLocationText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                        setShowLocationPicker(false);
                      }}
                    />
                  </MapContainer>
                </div>
              )}
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