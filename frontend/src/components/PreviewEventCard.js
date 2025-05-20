import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './PreviewEventCard.css'; // Add relevant CSS file for styling


function PreviewEventCard({ event }) {
  return (
    <div className="event-card">
        <img src={event.poster} alt={event.title} className="event-poster" />
        <div className="event-details">
          <h2>{event.title}</h2>
          <p>Date: {event.date}</p>
          <p>Time: {event.time}</p>
          <p>Venue: {event.venue}</p>
          <p>District: {event.district}</p>
        </div>
      

      <div className="event-actions">
        {/* Static Heart Icon */}
        <div className="favorite-button">
          <i className="fas fa-heart"></i>
          <span>{event.likes || 0}</span> {/* Display the number of likes */}
        </div>

        {/* Static Comment Icon */}
        <div className="comment-button">
          <i className="fas fa-comment"></i>
        </div>
      </div>
    </div>
  );
}

export default PreviewEventCard;