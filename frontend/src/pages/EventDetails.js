import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './EventDetails.css';
import { FaHeart, FaComment, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const EventDetails = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reactions, setReactions] = useState(20);
  const [isLiked, setIsLiked] = useState(false);

  const [comments, setComments] = useState([]); // Initialize with empty array
  const [newComment, setNewComment] = useState(''); // State to store new comment
  const [showComments, setShowComments] = useState(false);
  const [editingComment, setEditingComment] = useState(null); // Track which comment is being edited
  const [editContent, setEditContent] = useState(''); // Content for editing

  const [errorMessage, setErrorMessage] = useState(''); // State to store error message
  const [successMessage, setSuccessMessage] = useState(''); // State to store success message
  const isLoggedIn = !!localStorage.getItem('userToken'); // Check if the user is logged in
  const currentUserId = localStorage.getItem('userId'); // Get current user ID

  // Fetch comments for the event
  const fetchComments = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/comments/event/${id}`);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // Add a new comment
  const handleAddComment = async () => {
    if (!isLoggedIn) {
      setErrorMessage('You need to log in to post a comment.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (newComment.trim() !== '') {
      try {
        const token = localStorage.getItem('userToken');
        const { data } = await axios.post(
          'http://localhost:5000/api/comments',
          {
            content: newComment,
            eventId: id
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setComments([data, ...comments]); // Add new comment to the beginning
        setNewComment('');
        setSuccessMessage('Comment added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error adding comment:', err);
        setErrorMessage('Failed to add comment. Please try again.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  // Start editing a comment
  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  // Save edited comment
  const handleSaveEdit = async (commentId) => {
    try {
      const token = localStorage.getItem('userToken');
      const { data } = await axios.put(
        `http://localhost:5000/api/comments/${commentId}`,
        { content: editContent },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setComments(comments.map(comment => 
        comment._id === commentId ? data : comment
      ));
      setEditingComment(null);
      setEditContent('');
      setSuccessMessage('Comment updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating comment:', err);
      setErrorMessage('Failed to update comment. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const token = localStorage.getItem('userToken');
        await axios.delete(
          `http://localhost:5000/api/comments/${commentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setComments(comments.filter(comment => comment._id !== commentId));
        setSuccessMessage('Comment deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting comment:', err);
        setErrorMessage('Failed to delete comment. Please try again.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  const handleReaction = () => {
    if (!isLoggedIn) {
      setErrorMessage('You need to log in to react to this event.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (isLiked) {
      setReactions(reactions - 1);
    } else {
      setReactions(reactions + 1);
    }
    setIsLiked(!isLiked);
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details.');
        setLoading(false);
      }
    };

    fetchEventDetails();
    fetchComments(); // Fetch comments when component mounts
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

      {/* Success Dialog */}
      {successMessage && (
        <div className="success-dialog">
          <p>{successMessage}</p>
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
                {comments.map((comment) => (
                  <li key={comment._id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.userName}</span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {editingComment === comment._id ? (
                      <div className="comment-edit">
                        <input
                          type="text"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="edit-comment-input"
                        />
                        <div className="edit-actions">
                          <button 
                            onClick={() => handleSaveEdit(comment._id)}
                            className="save-edit-btn"
                          >
                            <FaCheck />
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="cancel-edit-btn"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="comment-content">
                        <p>{comment.content}</p>
                        {currentUserId === comment.user._id && (
                          <div className="comment-actions">
                            <button 
                              onClick={() => handleEditComment(comment)}
                              className="edit-btn"
                              title="Edit comment"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => handleDeleteComment(comment._id)}
                              className="delete-btn"
                              title="Delete comment"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
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
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
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
                 href="https://www.google.com"
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