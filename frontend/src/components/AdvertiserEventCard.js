import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EventCard.css';

function AdvertiserEventCard({ event }) {
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);

  // Fetch comment count when card loads
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/comments/event/${event._id}/count`);
        setCommentCount(data.count); // <-- backend should return { count: number }
      } catch (error) {
        console.error('Error fetching comment count:', error);
        setCommentCount(0);
      }
    };
    fetchCommentCount();
  }, [event._id]);

  // Fetch full comments when dialog opens
  useEffect(() => {
    if (showCommentsDialog) {
      const fetchComments = async () => {
        try {
          const { data } = await axios.get(`http://localhost:5000/api/comments/event/${event._id}`);
          setComments(data);
        } catch (error) {
          console.error('Error fetching comments:', error);
          setComments([]);
        }
      };
      fetchComments();
    }
  }, [showCommentsDialog, event._id]);

  const handleCommentClick = (e) => {
    e.stopPropagation();
    setShowCommentsDialog(true);
  };

  const handleCloseDialog = () => {
    setShowCommentsDialog(false);
  };

  return (
    <div className="event-card-container advertiser-event-card">
      <div className="event-card">
        <img src={event.poster} alt={event.title} className="event-poster" />
        <div className="event-details">
          <h2>{event.title}</h2>
          <p>Date: {event.date}</p>
          <p>Time: {event.time}</p>
          <p>Venue: {event.venue}</p>
          <p>District: {event.district}</p>
        </div>
        <div className="event-actions">
          <div className="right-actions">
            <button className="favorite-button">
              <i className="fas fa-heart"></i> <span>20</span>
            </button>
            <button className="comment-button" onClick={handleCommentClick}>
              <i className="fas fa-comment"></i> <span>{commentCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Dialog */}
      {showCommentsDialog && (
        <div className="comments-dialog">
          <div className="comments-dialog-content">
            <h2>Comments</h2>
            {comments.length > 0 ? (
              <ul className="comments-list">
                {comments.map((comment) => (
                  <li key={comment._id} className="comment-item">
                    <strong>{comment.userName || 'User'}:</strong> {comment.content}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No comments yet.</p>
            )}
            <button className="close-dialog-button" onClick={handleCloseDialog}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvertiserEventCard;
