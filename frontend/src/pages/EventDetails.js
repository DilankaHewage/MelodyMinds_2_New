import React, { useEffect, useState,useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './EventDetails.css';
import { FaHeart, FaComment, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import StripeCheckout from '../components/StripeCheckout';

import LikeButton from '../components/LikeButton';



const EventDetails = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [likeCount, setLikeCount] = useState(0);

  const [comments, setComments] = useState([]); // Initialize with empty array
  const [newComment, setNewComment] = useState(''); // State to store new comment
  const [showComments, setShowComments] = useState(false);
  const [editingComment, setEditingComment] = useState(null); // Track which comment is being edited
  const [editContent, setEditContent] = useState(''); // Content for editing

  const [errorMessage, setErrorMessage] = useState(''); // State to store error message
  const [successMessage, setSuccessMessage] = useState(''); // State to store success message
  const isLoggedIn = !!localStorage.getItem('userToken'); // Check if the user is logged in
  const currentUserId = localStorage.getItem('userId'); // Get current user ID

  // Ticket purchase state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [availableTickets, setAvailableTickets] = useState(0);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Fetch comments for the event

  const fetchComments = useCallback(async () => {

    try {
      const { data } = await axios.get(`http://localhost:5000/api/comments/${id}`);
      setComments(data?.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }, [id]);

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
          `http://localhost:5000/api/comments/${id}`,
          { content: newComment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setComments([data.data, ...comments]); // Add new comment to the beginning
        setNewComment('');
        setSuccessMessage('Comment added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchComments(); // Refresh comments
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
        comment._id === commentId ? data.data : comment
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
    if (!isLoggedIn) {
      setErrorMessage('You need to log in to delete comments.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.delete(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data?.success) {
        setComments(comments.filter(comment => comment._id !== commentId));
        setSuccessMessage('Comment deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('You can only delete your own comments.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setErrorMessage('You can only delete your own comments.');
      } else if (err?.response?.status === 401) {
        setErrorMessage('Please log in again.');
      } else {
        setErrorMessage('Failed to delete comment. Please try again.');
      }
      console.error('Error deleting comment:', err);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Fetch like count for initial render
  const fetchLikeCount = useCallback(async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/likes/${id}/count`);
      const count = data?.data?.likeCount ?? 0;
      setLikeCount(count);
    } catch (err) {
      console.error('Error fetching like count:', err);
    }
  }, [id]);

  // Fetch user information
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const userId = localStorage.getItem('userId');
      
      if (token && userId) {
        const { data } = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserInfo(data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Ticket purchase functions
  const handleBuyTicketsClick = async () => {
    if (!isLoggedIn) {
      setErrorMessage('You need to log in to buy tickets.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    // Refresh event data to get latest ticket availability
    try {
      const { data } = await axios.get(`http://localhost:5000/api/events/${id}`);
      const latestAvailableTickets = parseInt(data.ticketLink) || 0;
      
      if (latestAvailableTickets === 0) {
        setErrorMessage('Sorry, this event is now sold out.');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      setEvent(data);
      setAvailableTickets(latestAvailableTickets);
      setTicketQuantity(1);
      setShowTicketModal(true);
    } catch (error) {
      console.error('Error fetching latest event data:', error);
      setErrorMessage('Failed to load ticket information. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleCloseModal = () => {
    setShowTicketModal(false);
    setShowStripeCheckout(false);
    setTicketQuantity(1);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 5 && value <= availableTickets) {
      setTicketQuantity(value);
    }
  };

  const handleProceedToPayment = () => {
    setShowTicketModal(false);
    setShowStripeCheckout(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    setSuccessMessage(`Payment successful! You have purchased ${paymentData.tickets} ticket(s).`);
    setTimeout(() => setSuccessMessage(''), 5000);
    
    // Update available tickets locally
    let newAvailableTickets;
    if (paymentData.remainingTickets !== undefined) {
      // Use the remaining tickets count from the backend response
      newAvailableTickets = paymentData.remainingTickets;
    } else {
      // Fallback to local calculation
      newAvailableTickets = Math.max(0, availableTickets - ticketQuantity);
    }
    
    setAvailableTickets(newAvailableTickets);
    
    // Also update the event object to reflect the new ticket count
    if (event) {
      setEvent({
        ...event,
        ticketLink: newAvailableTickets.toString()
      });
    }
    
    // Optionally refresh event data from server to ensure accuracy
    try {
      const { data } = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(data);
      setAvailableTickets(parseInt(data.ticketLink) || 0);
    } catch (error) {
      console.error('Error refreshing event data:', error);
      // Don't show error to user as the payment was successful
    }
    
    handleCloseModal();
  };

  const handlePaymentError = (errorMessage) => {
    setErrorMessage(errorMessage);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const getTotalAmount = () => {
    const pricePerTicket = parseFloat(event.ticketPrice) || 0;
    return (pricePerTicket * ticketQuantity);
  };

  // Fetch user information
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const userId = localStorage.getItem('userId');
      
      if (token && userId) {
        const { data } = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserInfo(data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Ticket purchase functions
  const handleBuyTicketsClick = async () => {
    if (!isLoggedIn) {
      setErrorMessage('You need to log in to buy tickets.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    // Refresh event data to get latest ticket availability
    try {
      const { data } = await axios.get(`http://localhost:5000/api/events/${id}`);
      const latestAvailableTickets = parseInt(data.ticketLink) || 0;
      
      if (latestAvailableTickets === 0) {
        setErrorMessage('Sorry, this event is now sold out.');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      setEvent(data);
      setAvailableTickets(latestAvailableTickets);
      setTicketQuantity(1);
      setShowTicketModal(true);
    } catch (error) {
      console.error('Error fetching latest event data:', error);
      setErrorMessage('Failed to load ticket information. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleCloseModal = () => {
    setShowTicketModal(false);
    setShowStripeCheckout(false);
    setTicketQuantity(1);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 5 && value <= availableTickets) {
      setTicketQuantity(value);
    }
  };

  const handleProceedToPayment = () => {
    setShowTicketModal(false);
    setShowStripeCheckout(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    setSuccessMessage(`Payment successful! You have purchased ${paymentData.tickets} ticket(s).`);
    setTimeout(() => setSuccessMessage(''), 5000);
    
    // Update available tickets locally
    let newAvailableTickets;
    if (paymentData.remainingTickets !== undefined) {
      // Use the remaining tickets count from the backend response
      newAvailableTickets = paymentData.remainingTickets;
    } else {
      // Fallback to local calculation
      newAvailableTickets = Math.max(0, availableTickets - ticketQuantity);
    }
    
    setAvailableTickets(newAvailableTickets);
    
    // Also update the event object to reflect the new ticket count
    if (event) {
      setEvent({
        ...event,
        ticketLink: newAvailableTickets.toString()
      });
    }
    
    // Optionally refresh event data from server to ensure accuracy
    try {
      const { data } = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(data);
      setAvailableTickets(parseInt(data.ticketLink) || 0);
    } catch (error) {
      console.error('Error refreshing event data:', error);
      // Don't show error to user as the payment was successful
    }
    
    handleCloseModal();
  };

  const handlePaymentError = (errorMessage) => {
    setErrorMessage(errorMessage);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const getTotalAmount = () => {
    const pricePerTicket = parseFloat(event.ticketPrice) || 0;
    return (pricePerTicket * ticketQuantity);
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

    const fetchCommentsData = async () => {
      try {

        const { data } = await axios.get(`http://localhost:5000/api/comments/${id}`);
        setComments(data?.data || []);

      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };

    fetchEventDetails();

    fetchCommentsData(); // Fetch comments when component mounts

    fetchLikeCount();

    
    // Fetch user info if logged in
    if (isLoggedIn) {
      fetchUserInfo();
    }
  }, [id, isLoggedIn]);


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
     <div
    className="event-details-page"
    style={{ "--event-bg": `url(${event.poster})` }}
  >
    <div className="overlay">
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

      {/* Ticket Purchase Modal */}
      {showTicketModal && (
        <div className="modal-overlay">
          <div className="ticket-modal">
            <div className="modal-header">
              <h2>Buy Tickets</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="available-tickets">
                <p><strong>Available Tickets: {availableTickets}</strong></p>
              </div>
              
              <div className="ticket-selection">
                <label htmlFor="ticketQuantity">Number of Tickets (Max 5):</label>
                <select
                  id="ticketQuantity"
                  value={ticketQuantity}
                  onChange={handleQuantityChange}
                  className="ticket-quantity-select"
                >
                  {[...Array(Math.min(5, availableTickets))].map((_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="price-breakdown">
                <p><strong>Price per ticket: LKR {event.ticketPrice}</strong></p>
                <p><strong>Quantity: {ticketQuantity}</strong></p>
                <div className="total-amount">
                  <h3>Total Amount: LKR {getTotalAmount().toFixed(2)}</h3>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="payment-btn" 
                  onClick={handleProceedToPayment}
                  disabled={availableTickets === 0 || ticketQuantity > availableTickets}
                >
                  {availableTickets === 0 ? 'Sold Out' : 
                   ticketQuantity > availableTickets ? 'Not Enough Tickets' : 
                   'Proceed to Payment'}
                </button>
                <button className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Checkout Modal */}
      {showStripeCheckout && (
        <div className="modal-overlay">
          <div className="stripe-modal">
            <div className="modal-header">
              <h2>Complete Payment</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>×</button>
            </div>
            <StripeCheckout
              eventId={event._id}
              ticketQuantity={ticketQuantity}
              totalAmount={getTotalAmount()}
              currency="LKR"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handleCloseModal}
              userInfo={userInfo}
            />
          </div>
        </div>
      )}

      {/* Centered Event Title */}
 
      <div className="event-content"> 
        {/* Left Section */}
        <div className="event-left">
          <div className="event-image">
            <img src={event.poster} alt={event.title} className="event-poster-large" />
          </div>

          {/* Interaction Section Below Poster */}
          <div className="interaction-section">
            <LikeButton
              eventId={event._id}
              initialLikeCount={likeCount}
              onLikeChange={(liked, newCount) => setLikeCount(newCount)}
            />
            <button

              className={`reaction-button ${isLiked ? 'liked' : ''}`}
              onClick={handleReaction}
            >
              <FaHeart className="icon" /> {reactions}
            </button>
            <button

              className="commenting-button"
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
                      <span className="comment-author">{comment.user?.firstName} {comment.user?.lastName}</span>
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
                        {String(currentUserId) === String(comment.user?._id) && (
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
          <div className="event-title-container">
           <h1 className="event-title">{event.title}</h1>
          </div>
          <div className="event-info">
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Time:</strong> {event.time}</p>
            <p><strong>Venue:</strong> {event.venue}</p>
            <p><strong>District:</strong> {event.district}</p>
            <p><strong>Artist:</strong> {event.artist}</p>
            <p><strong>Ticket Prices:</strong> {event.ticketPrice}</p>
            {event.ticketLink && (
              <button
                onClick={handleBuyTicketsClick}
                className="buy-tickets-link">
                Buy Tickets
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default EventDetails;