import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserAdvertisements.css';

const UserAdvertisements = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:5000/api/advertisements');
      setAdvertisements(response.data.data);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      setError('Failed to fetch advertisements');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-advertisements-container">
      <div className="user-advertisements-box">
        <div className="advertisements-header">
          <h1>Discover Amazing Offers</h1>
          <p>Explore the latest advertisements from our trusted partners</p>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading advertisements...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchAdvertisements} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && advertisements.length === 0 && (
          <div className="no-advertisements">
            <h3>No Advertisements Available</h3>
            <p>Check back later for exciting offers and promotions!</p>
          </div>
        )}

        {!loading && !error && advertisements.length > 0 && (
          <div className="advertisements-grid">
            {advertisements.map((ad) => (
              <div key={ad._id} className="advertisement-card">
                {ad.image && (
                  <div className="advertisement-image">
                    <img src={ad.image} alt={ad.title} />
                  </div>
                )}
                <div className="advertisement-content">
                  <h3>{ad.title}</h3>
                  <p>{ad.description}</p>
                  <div className="advertisement-footer">
                    <div className="advertiser-info">
                      <span className="company-name">
                        {ad.advertiser?.companyName || 'Company Name'}
                      </span>
                      <span className="posted-date">
                        Posted: {new Date(ad.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAdvertisements;
