import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './AdvertiserProfile.css';
import { useNavigate } from 'react-router-dom';


const AdvertiserProfile = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const [personal, setPersonal] = useState({
    firstName: '',
    lastName: '',
    nicNumber: '',
    gender: '',
    country: '',
    telephone: ''
  });

  const [company, setCompany] = useState({
    companyName: '',
    companyPosition: '',
    companyWebsite: '',
    companyTelephone: ''
  });

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        const response = await axios.get('http://localhost:5000/api/advertisers/profile', config);
        const data = response.data;

        setPersonal({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          nicNumber: data.nicNumber || '',
          gender: data.gender || '',
          country: data.country || '',
          telephone: data.telephone || ''
        });

        setCompany({
          companyName: data.companyName || '',
          companyPosition: data.companyPosition || '',
          companyWebsite: data.companyWebsite || '',
          companyTelephone: data.companyTelephone || ''
        });

        if (data.profilePictureUrl) {
          setProfilePicture(data.profilePictureUrl);
        }
      } catch (error) {
        console.error('Failed to fetch advertiser profile:', error);
      }
    };

    fetchProfile();
  }, []);

  // Handlers you need to define in your component:

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleChange = (section, key, value) => {
    if (section === 'personal') {
      setPersonal({ ...personal, [key]: value });
    } else {
      setCompany({ ...company, [key]: value });
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please login to update your profile');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add profile data
      formData.append('firstName', personal.firstName);
      formData.append('lastName', personal.lastName);
      formData.append('nicNumber', personal.nicNumber);
      formData.append('gender', personal.gender);
      formData.append('country', personal.country);
      formData.append('telephone', personal.telephone);
      formData.append('companyName', company.companyName);
      formData.append('companyPosition', company.companyPosition);
      formData.append('companyWebsite', company.companyWebsite);
      formData.append('companyTelephone', company.companyTelephone);

      // Add profile picture if selected
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
      }

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await axios.put('http://localhost:5000/api/advertisers/profile', formData, config);
      
      setMessage('Profile updated successfully!');
      const newFullName = `${personal.firstName} ${personal.lastName}`.trim();
      window.dispatchEvent(new CustomEvent('userNameUpdated', { detail: newFullName }));
      setTimeout(() => {
        navigate('/advertiser-dashboard');
      }, 2000);
      setProfilePictureFile(null); // Clear the file after successful upload
      
      // Update the profile picture URL if a new one was uploaded
      if (response.data.profilePictureUrl) {
        setProfilePicture(response.data.profilePictureUrl);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='advertiser-profile-container'>
    <div className="advertiser-profile">
      <h2>Your Advertiser Profile</h2>
      
      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      <div className="profile-sections">
        {/* Left Section */}
        <div className="profile-box left">

          {[
            { label: 'First Name', key: 'firstName' },
            { label: 'Last Name', key: 'lastName' },
            { label: 'NIC Number', key: 'nicNumber' },
            { label: 'Gender', key: 'gender', type: 'select', options: ['Female', 'Male', 'Other'] },
            { label: 'Country', key: 'country' },
            { label: 'Telephone Number', key: 'telephone' }
          ].map(({ label, key, type, options }) => (
            <div className="form-group" key={key}>
              <label>{label}</label>
              {type === 'select' ? (
                <select value={personal[key]} onChange={(e) => handleChange('personal', key, e.target.value)}>
                  {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                   type="text"
                    value={personal[key]}
                   readOnly={key === 'nicNumber'}
                    onClick={() => {
                    if (key === 'nicNumber') {
                      setMessage("You can't edit your NIC number. Contact admin for changes. admin@gmail.com");
                      setTimeout(() => setMessage(''), 3000); // Clear message after 3s
              }
              }}
          onChange={(e) => handleChange('personal', key, e.target.value)}
                />

              )}
            </div>
          ))}
        </div>

        {/* Right Section */}
        <div className="profile-box right">
          <h2 className="center-heading">Company Information</h2>

          {[
            { label: 'Company Name', key: 'companyName' },
            { label: 'Company Position', key: 'companyPosition' },
            { label: 'Company Website', key: 'companyWebsite' },
            { label: 'Company Telephone', key: 'companyTelephone' }
          ].map(({ label, key }) => (
            <div className="form-group" key={key}>
              <label>{label}</label>
              <input
                type="text"
                value={company[key]}
                onChange={(e) => handleChange('company', key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <button className="save-button" onClick={handleSave} disabled={loading}>
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </div>
    </div>
  );
};

export default AdvertiserProfile;
