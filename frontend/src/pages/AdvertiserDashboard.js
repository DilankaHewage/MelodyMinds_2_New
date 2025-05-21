import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './AdvertiserDashboard.css';
import AdvertiserEventCard from '../components/AdvertiserEventCard';

const AdvertiserDashboard = () => {
  const [events, setEvents] = useState([]); // State to store events fetched from the backend
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/events'); // Fetch all events from the backend
        const sortedEvents = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setEvents(sortedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleAddEventClick = () => {
    navigate('/advertiser-eventing'); // Navigate to the eventing page
  };

  return (
    <div className="advertiser-dashboard">
      <h2 className="dashboard-heading">Advertiser Dashboard</h2>

      {/* Events Grid */}
      <div className="event-grid">
        {/* Add Event Sketch */}
        <div className="event-card empty-card" onClick={handleAddEventClick}>
          <p>Add a new event</p>
          <button className="add-event-btn">+ Add Event</button> // Button to add a new event
        </div>

        {/* Render Fetched Events */}
        {events.length > 0 ? (
          events.map((event) => (
            <AdvertiserEventCard key={event.id} event={event} /> // Render each event using EventCard
          ))
        ) : (
          <p className="no-events-message">No events available</p>
        )}
      </div>
    </div>
  );
};

export default AdvertiserDashboard;