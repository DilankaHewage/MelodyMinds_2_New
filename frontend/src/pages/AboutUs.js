import React from 'react';
import './AboutUs.css';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="about-us">
      <div className="about-us-header">
        <h1>About Melody Minds</h1>
        <p>Your gateway to Sri Lanka's vibrant music and event culture.</p>
      </div>
      <div className="about-us-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            Melody Minds is dedicated to connecting music enthusiasts with the best events, concerts, and experiences in Sri Lanka. 
            Whether you're a fan of live performances, cultural shows, or modern music festivals, we aim to be your trusted guide and partner.
          </p>
        </section>
        <section className="about-section">
          <h2>What We Offer</h2>
          <ul>
            <li>Discover upcoming music events and concerts across Sri Lanka.</li>
            <li>Personalized event recommendations based on your interests.</li>
            <li>Easy access to event details, tickets, and updates.</li>
          </ul>
        </section>
        <section className="contact-section">
          <h2>Contact Us</h2>
          <div className="contact-info">
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>Email: <a href="mailto:hello@melodyminds.com">hello@melodyminds.com</a></span>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <span>Address: 247/1, Union Place, Colombo 02, Sri Lanka</span> //Headoffice  address
             </div>
            <div className="contact-item">
              <FaPhoneAlt className="contact-icon" />
              <span>Tel: <a href="tel:+947680802962">+94 7680802962</a></span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;