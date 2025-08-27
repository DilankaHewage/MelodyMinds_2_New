import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventCard.css';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';

function EventCard({ event }) {
  const navigate = useNavigate();
  const [commentCount, setCommentCount] = useState(event.commentCount || 0);
  const [likeCount, setLikeCount] = useState(event.likeCount || 0);

  const handleCardClick = () => {
    navigate(`/event/${event._id}`); // Navigate to the EventDetails page with the event ID
  };

  const handleLikeChange = (liked, newCount) => {
    setLikeCount(newCount);
  };

  const handleCommentChange = (newCount) => {
    setCommentCount(newCount);
  };
  return (
    <div className="event-card-container">
      <div className="event-card" onClick={handleCardClick}>
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
        
        {/* Like and Comment Section */}
        <div className="event-actions">
          <LikeButton 
            eventId={event._id} 
            initialLikeCount={likeCount}
            onLikeChange={handleLikeChange}
          />
          <CommentSection 
            eventId={event._id} 
            initialCommentCount={commentCount}
            onCommentChange={handleCommentChange}
          />
        </div>
      </div>
    </div>
  );
}

export default EventCard;