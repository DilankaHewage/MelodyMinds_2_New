import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './EventDetails.css';
import { FaHeart, FaComment } from 'react-icons/fa';

const EventDetails = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reactions, setReactions] = useState(20);
  const [isLiked, setIsLiked] = useState(false);

  const [comments, setComments] = useState([
    'Amazing event! Can’t wait to attend.',
    'Looking forward to this!',
    'The lineup looks fantastic!',
    'This is going to be epic!',
    'I’ve already got my tickets!',
  ]); // Initialize with 5 pre-existing comments

  const [newComment, setNewComment] = useState(''); // State to store new comment
  const [showComments, setShowComments] = useState(false);


  const [errorMessage, setErrorMessage] = useState(''); // State to store error message
  const isLoggedIn = !!localStorage.getItem('userToken' ); // Check if the user is logged in

  const handleReaction = () => {
    if (!isLoggedIn) {
      setErrorMessage('You need to log in to react to this event.'); // Set error message
      setTimeout(() => setErrorMessage(''), 3000); // Clear the error message after 3 seconds
      return;
    }
    if (isLiked) {
      setReactions(reactions - 1); // Decrement reaction count
    } else {
      setReactions(reactions + 1); // Increment reaction count
    }
    setIsLiked(!isLiked); // Toggle the like state
  };

  const handleAddComment = () => {
    if (!isLoggedIn) {
      setErrorMessage('You need to log in to post a comment.'); // Set error message
      setTimeout(() => setErrorMessage(''), 3000); // Clear the error message after 3 seconds
      return;
    }
    if (newComment.trim() !== '') {
      setComments([...comments, newComment]); // Add new comment to the list
      setNewComment(''); // Clear the input field
    }
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/events/${id}`); // Fetch event by ID
        setEvent(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details.');
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  if (loading) {
    return <p>Loading event details...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!event) {
    return <p>Event not found!</p>;
  }

  return (
    <div className="event-details-page">
      {/* Error Dialog */}
      {errorMessage && (
        <div className="error-dialog">
          <p>{errorMessage}</p>
        </div>
      )}

  

      {/* Centered Event Title */}
      <div className="event-title-container">
        <h1 className="event-title">{event.title}</h1>
      </div>

      <div className="event-content"> 
        {/* Left Section */}
        <div className="event-left">
          <div className="event-image">
            <img src={event.poster} alt={event.title} className="event-poster-large" />
          </div>

          {/* Interaction Section Below Poster */}
          <div className="interaction-section">
            <button
              className={`reaction-button ${isLiked ? 'liked' : ''}`}
              onClick={handleReaction}
            >
              <FaHeart className="icon" /> {reactions}
            </button>
            <button
              className="comment-button"
              onClick={() => setShowComments(!showComments)}
            >
              <FaComment className="icon" /> {comments.length}
            </button>
          </div>

          {/* Comment Section */}
          {showComments && (
            <div className="comment-section">
              <h2>Comments</h2>
              <ul className="comment-list">
                {comments.map((comment, index) => (
                  <li key={index} className="comment-item">{comment}</li>
                ))}
              </ul>
              {isLoggedIn ? (
                <div className="add-comment">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="comment-input"
                  />
                  <button onClick={handleAddComment} className="add-comment-button">Post</button>
                </div>
              ) : (
                <p className="login-message">Log in to post a comment.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="event-right">
          <div className="event-info">
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Time:</strong> {event.time}</p>
            <p><strong>Venue:</strong> {event.venue}</p>
            <p><strong>District:</strong> {event.district}</p>
            <p><strong>Artist:</strong> {event.artist}</p>
            <p><strong>Ticket Prices:</strong> {event.ticketPrice}</p>
            {event.ticketLink && (
              <a
                 href="https://www.google.com" // Updated link to redirect to Google
                 target="_blank"
                  rel="noopener noreferrer"
                 className="buy-tickets-link">
               Buy Tickets
             </a>
)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;