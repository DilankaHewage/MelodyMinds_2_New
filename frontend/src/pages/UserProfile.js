import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';
import PurchaseHistory from '../components/PurchaseHistory';
import { useMessage } from '../components/Message';

const UserProfile = ({ userName, setUserName }) => {
  const navigate = useNavigate();
  const { showSuccess, showError, MessageContainer } = useMessage();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    profilePicture: null
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('userToken');
      console.log('Token from localStorage:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }
  
      console.log('Making request to profile endpoint...');
      const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Profile response:', response.data);
      setUser(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        bio: response.data.bio || '',
        profilePicture: null
      });
    } catch (error) {
      console.error('=== FRONTEND PROFILE ERROR ===');
      console.error('Error fetching user profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      console.error('=== END FRONTEND ERROR ===');
      
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Failed to load profile: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      profilePicture: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('bio', formData.bio);
      if (formData.profilePicture) {
        formDataToSend.append('profilePicture', formData.profilePicture);
      }

      const response = await axios.put('http://localhost:5000/api/users/profile', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUser(response.data);
      setUserName(response.data.name);
      
      // Update localStorage with new name
      localStorage.setItem('userName', response.data.name);
      
      // Dispatch custom event to update name across components
      window.dispatchEvent(new CustomEvent('userNameUpdated', { detail: response.data.name }));
      
      showSuccess('Profile updated successfully!');
      
      // Navigate to user dashboard after successful update
      setTimeout(() => {
        navigate('/userdashboard');
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    setUserName('');
    navigate('/'); // Use navigate instead of window.location.href
  };

  if (loading) {
    return <div className="user-profile-container">Loading...</div>;
  }

  if (error) {
    return <div className="user-profile-container">Error: {error}</div>;
  }

  return (
    <div className='profile-background'>
    <div className="user-profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        <div className="user-info">
          <span>Welcome,{user?.name || 'User'}</span>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`tab-button ${activeTab === 'purchase-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchase-history')}
        >
          Purchase History
        </button>
        <button 
          className="tab-button logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <div className="profile-form-container">
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="wording"> Want to be a advertiser? Contact us at admin@gmail.com </div>

              <button type="submit" className="submit-button">
                Update Profile
              </button>
            </form>
          </div>
        )}

        {activeTab === 'purchase-history' && (
          <PurchaseHistory />
        )}
      </div>
      <MessageContainer />
    </div>
    </div>
  );
};

export default UserProfile;