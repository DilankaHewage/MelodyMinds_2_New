import React from 'react';
import './Help.css';
import { useNavigate } from 'react-router-dom';

function HelpPage() {
  const navigate = useNavigate();

  // Check if user is logged in (from localStorage)
  const user = JSON.parse(localStorage.getItem('user'));

  const handleBackClick = () => {
    if (user) {
      navigate('/userdashboard'); // change this route if your dashboard path is different
    } else {
      navigate('/');
    }
  };

  return (
    <div className="help-container">
      <h1>Help & Support</h1>
      <p>Welcome to the Melody Minds Help Center. Here’s how you can make the most of our platform:</p> // a brief introduction

      <section className="help-section">
        <h2>🎟 How to Book Tickets</h2>
        <ul>
          <li>Go to the <strong>Home</strong> page and browse events.</li>
          <li>Click on an event you’re interested in.</li>
          <li>Select the number of tickets and proceed with payment.</li>
        </ul>
      </section>

      <section className="help-section">
        <h2>📝 How to Post an Event</h2>
        <ul>
          <li>Log in as an <strong>Advertiser</strong>.</li>
          <li>Click on <strong>"Create Event"</strong> from your dashboard.</li>
          <li>Fill in event details and publish it.</li> 
        </ul>
      </section>

      <section className="help-section">
        <h2>💬 How to React to an Event</h2>
        <ul>
          <li>Click the heart button or comment below the event on the homepage.</li>
          <li>OR click the event to comment and like it there.</li>
        </ul>
      </section>

      <section className="help-section">
        <h2>🔐 Account Issues</h2>
        <ul>
          <li>Use the <strong>Login</strong> page to access your account.</li>
          <li>If you forgot your password, click <strong>“Forgot Password”</strong> to reset.</li>
          <li>Update your profile info from the <strong>User Profile</strong> page.</li>
        </ul>
      </section>

      <section className="help-section">
        <h2>📩 Contact Support</h2>
        <p>If you have any further issues, please reach out:</p>
        <ul>
          <li>Email: hello@melodyminds.com</li>
          <li>Phone: +94 7680802962</li>
        </ul>
      </section>

      <button className="back-home-button" onClick={handleBackClick}>
        Back to Home
      </button>
    </div>
  );
}

export default HelpPage;
