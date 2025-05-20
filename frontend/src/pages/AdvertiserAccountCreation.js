import React, { useState } from 'react';
import axios from 'axios'; // Import axios for API requests
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import './AdvertiserAccountCreation.css';

const AdvertiserAccountCreation = () => {
  const navigate = useNavigate(); // Initialize the navigate function using useNavigate
  const [step, setStep] = useState(1); // Track current step
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contactNumber: '',
    nicNumber: '',
    sex: '',
    country: '', // Added country
    telephone: '', // Added telephone
    companyName: '',
    companyPosition: '', // Added companyPosition
    companyWebsite: '', // Added companyWebsite
    companyTelephone: '', // Added companyTelephone
    agreedToTerms: false,
  });
  const [successMessage, setSuccessMessage] = useState(''); // State for success message

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleNextStep = () => {
    // Ensure step 1 fields are filled before moving to step 2
    if (formData.firstName && formData.lastName && formData.email && formData.password) {
      setStep(2);
    } else {
      alert('Please fill out all fields in this step before proceeding.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreedToTerms) {
      alert('You must agree to the terms and conditions.');
      return;
    }

    try {
      // Send data to the backend via POST request
      const response = await axios.post('http://localhost:5000/api/advertisers/register', formData);

      console.log('Advertiser account created successfully:', response.data);

      // Set the success message and dismiss it after 1 second
      setSuccessMessage(response.data.message || 'Account created successfully!');
      setTimeout(() => {
        setSuccessMessage(''); // Clear the success message
        navigate('/advertiser-login'); // Navigate to the advertiser login page
      }, 1000);
    } catch (error) {
      console.error('Error creating advertiser account:', error);

      if (error.response) {
        alert(`Error: ${error.response.data.message || 'Failed to create account'}`);
      } else {
        alert('Failed to create account. Please try again.');
      }
    }
  };

  return (
    <div className={`advertiser-account-container step-${step}`}>
      <div className="advertiser-account-box">
        {step === 1 ? (
          <>
            <h2>Create Advertiser Account</h2>
            <form>
              <div className="input-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="button"
                className="next-button"
                onClick={handleNextStep}
              >
                Next
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>Create Advertiser Account - Step 2</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="contactNumber">Contact Number</label>
                <input
                  type="text"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your contact number"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="nicNumber">NIC Number</label>
                <input
                  type="text"
                  id="nicNumber"
                  name="nicNumber"
                  value={formData.nicNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your NIC number"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="sex">Gender</label>
                <select
                  id="sex"
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Enter your country"
                />
              </div>
              <div className="input-group">
                <label htmlFor="telephone">Telephone</label>
                <input
                  type="text"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  placeholder="Enter your telephone"
                />
              </div>
              <div className="input-group">
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter your company name"
                />
              </div>
              <div className="input-group">
                <label htmlFor="companyPosition">Company Position</label>
                <input
                  type="text"
                  id="companyPosition"
                  name="companyPosition"
                  value={formData.companyPosition}
                  onChange={handleInputChange}
                  placeholder="Enter your company position"
                />
              </div>
              <div className="input-group">
                <label htmlFor="companyWebsite">Company Website</label>
                <input
                  type="text"
                  id="companyWebsite"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleInputChange}
                  placeholder="Enter your company website"
                />
              </div>
              <div className="input-group">
                <label htmlFor="companyTelephone">Company Telephone</label>
                <input
                  type="text"
                  id="companyTelephone"
                  name="companyTelephone"
                  value={formData.companyTelephone}
                  onChange={handleInputChange}
                  placeholder="Enter your company telephone"
                />
              </div>
              <div className="input-group terms-checkbox">
                <input
                  type="checkbox"
                  id="agreedToTerms"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="agreedToTerms">
                  I agree to the terms and conditions of the platform.
                </label>
              </div>
              <button type="submit" className="submit-button">
                Create Account
              </button>
            </form>
          </>
        )}
      </div>

      {/* Success Message Alert */}
      {successMessage && (
        <div className="success-alert">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default AdvertiserAccountCreation;