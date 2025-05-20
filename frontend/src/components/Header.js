import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header() {
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');       // user token
  const advertiserToken = localStorage.getItem('token');      // advertiser token

  const isLoggedIn = !!userToken || !!advertiserToken;        // logged in if any token exists
  const [userName, setUserName] = useState('');               // user or advertiser name
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        if (userToken) {
          // Fetch user profile
          const config = {
            headers: { Authorization: `Bearer ${userToken}` },
          };
          const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
          setUserName(data.name);
        } else if (advertiserToken) {
          // Fetch advertiser profile
          const config = {
            headers: { Authorization: `Bearer ${advertiserToken}` },
          };
          const { data } = await axios.get('http://localhost:5000/api/advertisers/profile', config);
          const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
          setUserName(fullName);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setUserName('User');
      }
    };

    if (isLoggedIn) {
      fetchUserName();
    }

    // Listen for custom event to update name immediately after login
    const handleUserNameUpdate = (event) => {
      setUserName(event.detail);
    };

    window.addEventListener('userNameUpdated', handleUserNameUpdate);

    return () => {
      window.removeEventListener('userNameUpdated', handleUserNameUpdate);
    };
  }, [isLoggedIn, userToken, advertiserToken]);

  const handleLogout = () => {
    // Remove both tokens for clean logout
    localStorage.removeItem('userToken');
    localStorage.removeItem('token');
    
    setUserName('');
    navigate('/login');
  };

  const handleHomeClick = () => {
    if (userToken) {
      navigate('/userdashboard');
    } else if (advertiserToken) {
      navigate('/advertiser-dashboard');
    } else {
      navigate('/');
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header>
      <div className="header-container">
        <button className="brand-name" onClick={handleHomeClick}>
          <img src="/images/logo.PNG" alt="Logo" className="logo" />
        </button>
        <nav>
          <ul className="nav-links">
            <li>
              <button className="nav-link-button" onClick={handleHomeClick}>
                Home
              </button>
            </li>
            <li>
              <button className="nav-link-button" onClick={() => navigate('/about')}>
                About Us
              </button>
            </li>
            <li>
              <button className="nav-link-button" onClick={() => navigate('/help')}>
                Help
              </button>
            </li>
          </ul>
          {isLoggedIn ? (
            <div className="user-dropdown" ref={dropdownRef}>
              <button className="user-name-button" onClick={toggleDropdown}>
                {userName || 'User'}
              </button>
              {dropdownVisible && (
                <div className="dropdown-menu">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      if (userToken) {
                        navigate('/user-profile');
                      } else if (advertiserToken) {
                        navigate('/advertiser-profile');
                      }
                    }}
                  >
                    Profile
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="login-link" onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
