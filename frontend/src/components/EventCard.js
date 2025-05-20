import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventCard.css';

function EventCard({ event }) {
  const navigate = useNavigate();
  const [showCommentBar, setShowCommentBar] = useState(false); // State to toggle comment bar
  const [newComment, setNewComment] = useState(''); // State to store the new comment
  const [errorMessage, setErrorMessage] = useState(''); // State to store error message
  const [reactions, setReactions] = useState(20); // Initial heart reactions set to 20
  const [commentsCount, setCommentsCount] = useState(5); // Initial comment count set to 5
  const [isLiked, setIsLiked] = useState(false); // State to track if the heart is liked

  const handleCardClick = () => {
    navigate(`/event/${event._id}`); // Navigate to the EventDetails page with the event ID
  };

  const handleCommentClick = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    const isLoggedIn = !!localStorage.getItem('userToken'); // Check if the user is logged in
    if (!isLoggedIn) {
      setErrorMessage('You should log in to comment here.'); // Set error message
      setTimeout(() => setErrorMessage(''), 3000); // Clear the error message after 3 seconds
      return;
    }
    setShowCommentBar(!showCommentBar); // Toggle the comment bar
    setErrorMessage(''); // Clear any previous error message
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    const isLoggedIn = !!localStorage.getItem('userToken'); // Check if the user is logged in
    if (!isLoggedIn) {
      setErrorMessage('You should log in to favorite this event.'); // Set error message
      setTimeout(() => setErrorMessage(''), 3000); // Clear the error message after 3 seconds
      return;
    }
    if (isLiked) {
      setReactions(reactions - 1); // Decrease the reaction count
    } else {
      setReactions(reactions + 1); // Increase the reaction count
    }
    setIsLiked(!isLiked); // Toggle the liked state
  };

  const handlePostComment = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (!newComment.trim()) {
      setErrorMessage('Please enter a comment before posting.'); // Set error message
      setTimeout(() => setErrorMessage(''), 3000); // Clear the error message after 3 seconds
    } else {
      setCommentsCount(commentsCount + 1); // Increment the comment count
      setNewComment(''); // Clear the input field
      setShowCommentBar(false); // Dismiss the comment bar
      setErrorMessage(''); // Clear the error message
    }
  };

  return (
    <div className="event-card-container">
      {errorMessage && (
        <div className="error-dialog">
          <p>{errorMessage}</p>
        </div>
      )}
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
        <div className="event-actions">
          <button
            className={`favorite-button ${isLiked ? 'liked' : ''}`}
            onClick={handleFavoriteClick}
          >
            <i className="fas fa-heart"></i> <span>{reactions}</span>
          </button>
          <button className="comment-button" onClick={handleCommentClick}>
            <i className="fas fa-comment"></i> <span>{commentsCount}</span>
          </button>
        </div>
        {showCommentBar && (
          <div className="comment-bar" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
            />
            <button
              onClick={handlePostComment}
              className="the-post-button"
            >
              Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventCard;