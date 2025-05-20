import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './AdvertiserProfile.css';

const AdvertiserProfile = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleSave = () => {
    console.log({ personal, company, profilePicture });
    alert('Advertiser profile updated!');
  };

  return (
    <div className="advertiser-profile">
      <h2>Your Advertiser Profile</h2>
      <div className="profile-sections">
        {/* Left Section */}
        <div className="profile-box left">
          <div className="profile-picture" onClick={() => fileInputRef.current.click()}>
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" />
            ) : (
              <div className="placeholder">Upload Picture</div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePictureChange}
              style={{ display: 'none' }}
            />
          </div>

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

      <button className="save-button" onClick={handleSave}>Update Profile</button>
    </div>
  );
};

export default AdvertiserProfile;
// AdvertiserProfile.css