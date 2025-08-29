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

  const handleCardClick = () => {
    navigate(`/event/${event._id}`); // Navigate to the EventDetails page with the event ID
  };

  const handleLikeChange = (liked, newCount) => {
    setLikeCount(newCount);
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    setShowCommentInput((prev) => !prev);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    const userToken = localStorage.getItem('userToken');
    const advertiserToken = localStorage.getItem('token');
    const token = userToken || advertiserToken;
    if (!token) {
      alert('Please login to comment');
      return;
    }
    if (!newComment.trim()) {
      return;
    }
    setPostingComment(true);
    try {
      await axios.post(`http://localhost:5000/api/comments/${event._id}`,
        { content: newComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
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
      alert('Failed to add comment');
    } finally {
      setPostingComment(false);
    }
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