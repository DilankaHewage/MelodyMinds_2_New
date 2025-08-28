import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EventCard.css';
import LikeButton from './LikeButton';

function EventCard({ event }) {
  const navigate = useNavigate();
  const [commentCount, setCommentCount] = useState(0);
  const [likeCount, setLikeCount] = useState(event.likeCount || 0);

  // Fetch comment count for this event
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/comments/event/${event._id}/count`);
        setCommentCount(response.data.count || 0);
      } catch (error) {
        console.error('Error fetching comment count:', error);
        setCommentCount(0);
      }
    };

    fetchCommentCount();
  }, [event._id]);

  const handleCardClick = () => {
    navigate(`/event/${event._id}`); // Navigate to the EventDetails page with the event ID
  };

  const handleLikeChange = (liked, newCount) => {
    setLikeCount(newCount);
  };

  const handleCommentClick = (e) => {
    e.stopPropagation(); // Prevent card click
    navigate(`/event/${event._id}`); // Navigate to event details to see comments
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
          <button 
            className="comment-button"
            onClick={handleCommentClick}
            title="View comments"
          >
            💬 <span>{commentCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventCard;