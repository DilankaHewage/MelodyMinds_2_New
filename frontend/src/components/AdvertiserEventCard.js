import React, { useState } from 'react';
import './EventCard.css';

function AdvertiserEventCard({ event }) {
  const [showCommentsDialog, setShowCommentsDialog] = useState(false); // State to toggle the comments dialog

  const comments = [
    'Amazing event! Can’t wait to attend.',
    'Looking forward to this!',
    'The lineup looks fantastic!',
    'This is going to be epic!',
    'I’ve already got my tickets!',
  ]; // Predefined comments

  const handleCommentClick = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    setShowCommentsDialog(true); // Open the comments dialog
  };

  const handleCloseDialog = () => {
    setShowCommentsDialog(false); // Close the comments dialog
  };

  return (
    <div className="event-card-container advertiser-event-card">
      <div className="event-card">
        <img
          src={event.poster}
          alt={event.title}
          className="event-poster"
        />
        <div className="event-details">
          <h2>{event.title}</h2>
          <p>Date: {event.date}</p>
          <p>Time: {event.time}</p>
          <p>Venue: {event.venue}</p>
          <p>District: {event.district}</p>
        </div>
        <div className="event-actions">
          <div className="right-actions">
            <button className="favorite-button">
              <i className="fas fa-heart"></i> <span>20</span>
            </button>
            <button className="comment-button" onClick={handleCommentClick}>
              <i className="fas fa-comment"></i> <span>5</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Dialog */}
      {showCommentsDialog && (
        <div className="comments-dialog">
          <div className="comments-dialog-content">
            <h2>Comments</h2>
            <ul className="comments-list">
              {comments.map((comment, index) => (
                <li key={index} className="comment-item">
                  {comment}
                </li>
              ))}
            </ul>
            <button className="close-dialog-button" onClick={handleCloseDialog}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvertiserEventCard;