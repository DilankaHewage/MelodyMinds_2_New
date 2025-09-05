import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './UserProfile.css';

const UserProfile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
 
  const [successMessage, setSuccessMessage] = useState(''); // State for success message

  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('userToken'); // Get token from localStorage
        const storedUserName = localStorage.getItem('userName'); // Get username from localStorage
        
        // First try to get name from localStorage (set during login)
        if (storedUserName) {
          const nameParts = storedUserName.split(' ');
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
        setFirstName(data.name.split(' ')[0]); // Assuming name is "FirstName LastName"
        setLastName(data.name.split(' ')[1] || '');
       
       
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('userToken'); // Get token from localStorage
      const formData = new FormData();
      formData.append('name', `${firstName} ${lastName}`);
   
      

      const { data } = await axios.put('http://localhost:5000/api/users/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      console.log('Profile updated:', data);

      // Dispatch a custom event to update the header with the new name
      const newFullName = `${firstName} ${lastName}`.trim();
      localStorage.setItem('userName', newFullName); // Update userName in localStorage
      window.dispatchEvent(new CustomEvent('userNameUpdated', { detail: newFullName }));

      // Set the success message and dismiss it after 2 seconds
      setSuccessMessage(data.message || 'Profile updated successfully!');
      setTimeout(() => {
        setSuccessMessage(''); // Clear the success message
        navigate('/userdashboard'); // Navigate to the user dashboard
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  return (
    <div className="profile-container">
    <div className="user-profile">
      <h2>User Profile</h2>
      

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
      <div className="info-note">
        <p>Want to be a Advertiser? Email us at admin@gmail.com </p>
      
      </div>
      <button className="save-button" onClick={handleSave}>Save</button>

      {/* Success Message Alert */}
      {successMessage && (
        <div className="success-alert">
          {successMessage}
        </div>
      )}
    </div>
    </div>
  );
};

export default UserProfile;