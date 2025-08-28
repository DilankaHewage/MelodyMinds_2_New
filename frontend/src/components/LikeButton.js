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
    // Fetch current like count for accuracy
    const fetchLikeCount = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/likes/${eventId}/count`);
        const count = response.data?.data?.likeCount ?? 0;
        setLikeCount(count);
      } catch (error) {
        console.error('Error fetching like count:', error);
      }
    };

    fetchLikeCount();

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
      const newCount = newLikedState ? likeCount + 1 : Math.max(0, likeCount - 1);
      setLiked(newLikedState);
      setLikeCount(newCount);
      if (onLikeChange) onLikeChange(newLikedState, newCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      if (error?.response?.status === 401) {
        alert('Please login to like events');
      } else if (error?.response?.status === 403) {
        alert('You are not allowed to like this event');
      } else if (error?.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to update like');
      }
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
