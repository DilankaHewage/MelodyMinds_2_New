import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios'; // Import axios for API calls
import './UserAccountCreation.css'; // Your custom CSS

const UserAccountCreation = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [emailError, setEmailError] = useState(''); // State to store email validation error
  const [backendMessage, setBackendMessage] = useState(''); // State to store backend message
  const [showDialog, setShowDialog] = useState(false); // State to control dialog visibility

  const validateEmail = (email) => {
    if (!email.includes('@') || !email.includes('.com')) {
      return 'Please insert a valid email';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData({ ...formData, [name]: value });

    // Validate email only when the email field is being updated
    if (name === 'email') {
      setEmailError(validateEmail(value));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Validate email on blur (when the user leaves the email field)
    if (name === 'email') {
      setEmailError(validateEmail(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page

    // Check if email is invalid before submitting
    if (emailError) {
      alert('Please fix the errors before submitting the form.');
      return;
    }

    console.log('Form submitted'); // Log that form was submitted

    // Combine firstName and lastName into a single name field
    const combinedData = {
      name: `${formData.firstName} ${formData.lastName}`, // Combine first and last name
      email: formData.email,
      password: formData.password,
    };

    console.log('Form Data Before Submission:', combinedData); // Log form data before submitting

    try {
      // Send data to backend API (POST request)
      const response = await axios.post('http://localhost:5000/api/users/register', combinedData);
      console.log('User Account Created Response:', response.data); // Log successful response from API

      // Set backend message and show dialog
      setBackendMessage(response.data.message || 'Account created successfully!');
      setShowDialog(true); // Show dialog

      // Navigate to the login page after a short delay
      setTimeout(() => {
        setShowDialog(false); // Hide dialog
        navigate('/login');
      }, 1000); // 1-second delay
    } catch (error) {
      console.error('Error creating account:', error); // Log error in case of failure

      // Handle backend error message
      if (error.response && error.response.data && error.response.data.message) {
        // Check if the error message indicates the user already exists
        if (error.response.data.message.toLowerCase().includes('email already in use')) {
          setBackendMessage('This user already exists'); // Set custom error message
        } else {
          setBackendMessage(error.response.data.message); // Use the backend error message
        }
      } else {
        setBackendMessage('Failed to create account. Please try again.');
      }
      setShowDialog(true); // Show dialog

      // Automatically dismiss the dialog after 3 seconds
      setTimeout(() => {
        setShowDialog(false); // Hide dialog
      }, 3000); // 3-second delay
    }
  };

  return (
    <div className="user-account-creation-container">
      <div className="user-account-box">
        <h2>Create User Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
              onBlur={handleBlur} // Validate email on blur
              placeholder="Enter your email"
              required
            />
            {emailError && <p className="error-message">{emailError}</p>} {/* Display email error */}
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="create-account-button"
            disabled={!!emailError} // Disable button if emailError exists
          >
            Create Account
          </button>
        </form>
      </div>

      {/* Dialog Box */}
      {showDialog && (
        <div className="dialog-box">
          <p>{backendMessage}</p>
        </div>
      )}
    </div>
  );
};

export default UserAccountCreation;