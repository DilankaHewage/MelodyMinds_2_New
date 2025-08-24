import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdvertiserAdvertisementManagement.css';

const AdvertiserAdvertisementManagement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get the appropriate token - advertisers use 'token', users use 'userToken'
  const userToken = localStorage.getItem('userToken');
  const advertiserToken = localStorage.getItem('token');
  const token = advertiserToken || userToken; // Use advertiser token if available, otherwise user token

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/advertisements/advertiser/my-ads', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAdvertisements(response.data.data);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      setError('Failed to fetch advertisements');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isEditing) {
        // Update existing advertisement
        await axios.put(`http://localhost:5000/api/advertisements/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setIsEditing(false);
        setEditingId(null);
      } else {
        // Create new advertisement
        await axios.post('http://localhost:5000/api/advertisements', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      // Reset form and refresh list
      setFormData({ title: '', description: '', image: '' });
      fetchAdvertisements();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      setError(error.response?.data?.message || 'Failed to save advertisement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ad) => {
    setIsEditing(true);
    setEditingId(ad._id);
    setFormData({
      title: ad.title,
      description: ad.description,
      image: ad.image || ''
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ title: '', description: '', image: '' });
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advertisement?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/advertisements/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchAdvertisements();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      setError('Failed to delete advertisement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="advertisement-management-container">
      <div className="advertisement-management-box">
        <h2>Manage Your Advertisements</h2>
        
        {/* Create/Edit Form */}
        <div className="advertisement-form">
          <h3>{isEditing ? 'Edit Advertisement' : 'Create New Advertisement'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter advertisement title"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Enter advertisement description"
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="image">Image URL (Optional)</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="Enter image URL"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-buttons">
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
              </button>
              {isEditing && (
                <button type="button" onClick={handleCancelEdit} disabled={loading}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Advertisements List */}
        <div className="advertisements-list">
          <h3>Your Advertisements</h3>
          {loading && <p>Loading...</p>}
          
          {!loading && advertisements.length === 0 && (
            <p>No advertisements found. Create your first one above!</p>
          )}
          
          {!loading && advertisements.length > 0 && (
            <div className="advertisements-grid">
              {advertisements.map((ad) => (
                <div key={ad._id} className="advertisement-card">
                  {ad.image && (
                    <div className="advertisement-image">
                      <img src={ad.image} alt={ad.title} />
                    </div>
                  )}
                  <div className="advertisement-content">
                    <h4>{ad.title}</h4>
                    <p>{ad.description}</p>
                    <div className="advertisement-meta">
                      <span>Created: {new Date(ad.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="advertisement-actions">
                      <button 
                        onClick={() => handleEdit(ad)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(ad._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvertiserAdvertisementManagement;
