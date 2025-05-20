import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './UserProfile.css';

const UserProfile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // State for success message
  const fileInputRef = useRef(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('userToken'); // Get token from localStorage
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
        setFirstName(data.name.split(' ')[0]); // Assuming name is "FirstName LastName"
        setLastName(data.name.split(' ')[1] || '');
        setBio(data.bio || '');
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
      setShowEditOverlay(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('userToken'); // Get token from localStorage
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const updatedData = {
        name: `${firstName} ${lastName}`,
        bio,
      };

      const { data } = await axios.put('http://localhost:5000/api/users/profile', updatedData, config);
      console.log('Profile updated:', data);

      // Dispatch a custom event to update the header
      const event = new CustomEvent('userNameUpdated', { detail: `${firstName} ${lastName}` });
      window.dispatchEvent(event);

      // Set the success message and dismiss it after 1 second
      setSuccessMessage(data.message || 'Profile updated successfully!');
      setTimeout(() => {
        setSuccessMessage(''); // Clear the success message
        navigate('/userdashboard'); // Navigate to the user dashboard
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <div
        className="profile-picture-section"
        onClick={() => setShowEditOverlay(true)}
      >
        {profilePicture ? (
          <img src={profilePicture} alt="Profile" className="profile-pic" />
        ) : (
          <div className="placeholder-pic">No Picture</div>
        )}
        {showEditOverlay && (
          <div className="edit-overlay">
            <button onClick={() => fileInputRef.current.click()}>Edit</button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePictureChange}
              style={{ display: 'none' }}
            />
          </div>
        )}
      </div>

      <div className="form-group">
        <label>First Name</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Last Name</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>


      <button className="save-button" onClick={handleSave}>Save</button>

      {/* Success Message Alert */}
      {successMessage && (
        <div className="success-alert">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default UserProfile;