import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LikeButton.css';

const LikeButton = ({ eventId, initialLikeCount = 0, onLikeChange }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  // Get the appropriate token
  const userToken = localStorage.getItem('userToken');
  const advertiserToken = localStorage.getItem('token');
  const token = userToken || advertiserToken;

  useEffect(() => {
    // Check if user has liked this event
    if (token) {
      checkUserLike();
    }
  }, [eventId, token]);

  const checkUserLike = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/likes/${eventId}/check`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLiked(response.data.data.liked);
    } catch (error) {
      console.error('Error checking user like:', error);
    }
  };

  const handleLikeToggle = async () => {
    if (!token) {
      alert('Please login to like events');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/likes/${eventId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const newLikedState = response.data.liked;
      setLiked(newLikedState);
      
      // Update like count
      if (newLikedState) {
        setLikeCount(prev => prev + 1);
      } else {
        setLikeCount(prev => Math.max(0, prev - 1));
      }

      // Notify parent component
      if (onLikeChange) {
        onLikeChange(newLikedState, newLikedState ? likeCount + 1 : likeCount - 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`like-button ${liked ? 'liked' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleLikeToggle}
      disabled={loading}
      title={liked ? 'Unlike' : 'Like'}
    >
      <span className="like-icon">
        {liked ? '❤️' : '🤍'}
      </span>
      <span className="like-count">{likeCount}</span>
    </button>
  );
};

export default LikeButton;
