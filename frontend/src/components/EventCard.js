import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EventCard.css';
import LikeButton from './LikeButton';

function EventCard({ event }) {
  const navigate = useNavigate();
  const [commentCount, setCommentCount] = useState(0);
  const [likeCount, setLikeCount] = useState(event.likeCount || 0);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [message, setMessage] = useState(null); 
  const [messageType, setMessageType] = useState(null); 

  // Fetch comment count for this event
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/comments/${event._id}/count`);
        const count = response.data?.data?.commentCount ?? 0;
        setCommentCount(count);
      } catch (error) {
        console.error('Error fetching comment count:', error);
        setCommentCount(0);
      }
    };

    fetchCommentCount();
  }, [event._id]);

  useEffect(() => {
  if (message) {
    const timer = setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [message]);

  const handleCardClick = () => {
    navigate(`/event/${event._id}`); // Navigate to the EventDetails page with the event ID
  };

  const handleLikeChange = (liked, newCount) => {
    setLikeCount(newCount);
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    setShowCommentInput((prev) => !prev);
    setMessage(null);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    const userToken = localStorage.getItem('userToken');
    const advertiserToken = localStorage.getItem('token');
    const token = userToken || advertiserToken;
    if (!token) {
      setMessage(" Please login to comment");
      setMessageType("error");
      return;
    }
    if (!newComment.trim()) {
      setMessage("Comment cannot be empty");
      setMessageType("error");
      return;
    }
    setPostingComment(true);
    try {
      await axios.post(`http://localhost:5000/api/comments/${event._id}`,
        { content: newComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      setMessage("Comment added successfully!");
      setMessageType("success");
      // refresh count
      try {
        const response = await axios.get(`http://localhost:5000/api/comments/${event._id}/count`);
        const count = response.data?.data?.commentCount ?? (commentCount + 1);
        setCommentCount(count);
      } catch {
        setCommentCount((c) => c + 1);
      }
      setShowCommentInput(false);
    } catch (error) {
      console.error('Error adding comment:', error);
      setMessage(" Failed to add comment. Try again.");
      setMessageType("error");
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div className="event-card-container">

{message && (
      <div className={`global-message ${messageType}`}>
        {message}
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
        
        {/* Like and Comment Section */}
        <div className="event-action" onClick={(e) => e.stopPropagation()}>
          <LikeButton 
            eventId={event._id} 
            initialLikeCount={likeCount}
            onLikeChange={handleLikeChange}
          />
          <button 
            className="comment-button"
            onClick={handleCommentClick}
            title="Add comment"
          >
            💬 <span>{commentCount}</span>
          </button>
        </div>
        {showCommentInput && (
          <form className="comment-inline-form" onSubmit={submitComment} onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              disabled={postingComment}
            />
            <button className="posting-button" type="submit" disabled={postingComment || !newComment.trim()}>
              {postingComment ? 'Posting...' : 'Post'}
            </button>
          </form>
        )}
        
      </div>
    </div>
  );
}

export default EventCard;