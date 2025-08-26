import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CommentSection.css';

const CommentSection = ({ eventId, initialCommentCount = 0, onCommentChange }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Get the appropriate token
  const userToken = localStorage.getItem('userToken');
  const advertiserToken = localStorage.getItem('token');
  const token = userToken || advertiserToken;

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [eventId, showComments]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/comments/${eventId}`);
      setComments(response.data.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!token) {
      alert('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/comments/${eventId}`, {
        content: newComment.trim()
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Add new comment to the list
      setComments(prev => [response.data.data, ...prev]);
      setNewComment('');
      
      // Update comment count in parent
      if (onCommentChange) {
        onCommentChange(comments.length + 1);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) return;

    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Remove comment from the list
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      
      // Update comment count in parent
      if (onCommentChange) {
        onCommentChange(comments.length - 1);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comment-section">
      <button
        className="comment-toggle-button"
        onClick={() => setShowComments(!showComments)}
      >
        💬 <span>{initialCommentCount} </span>
      </button>

      {showComments && (
        <div className="comments-container">
          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows="3"
              className="comment-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="comment-submit-btn"
              disabled={loading || !newComment.trim()}
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">
                      {comment.user.firstName} {comment.user.lastName}
                    </span>
                    <span className="comment-date">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
