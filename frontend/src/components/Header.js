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

  // Helper function to refresh user name
  const refreshUserName = async () => {
    if (!isLoggedIn) return;
    
    try {
      if (userToken) {
        const config = {
          headers: { Authorization: `Bearer ${userToken}` },
        };
        const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
        setUserName(data.name);
      } else if (advertiserToken) {
        const config = {
          headers: { Authorization: `Bearer ${advertiserToken}` },
        };
        const { data } = await axios.get('http://localhost:5000/api/advertisers/profile', config);
        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        setUserName(fullName);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        if (userToken) {
          // First try to get userName from localStorage (set during login)
          const storedUserName = localStorage.getItem('userName');
          if (storedUserName) {
            setUserName(storedUserName);
            return;
          }
          
          // If not in localStorage, fetch user profile
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

    // Listen for custom event to update name immediately after login or profile update
    const handleUserNameUpdate = (event) => {
      setUserName(event.detail);
    };

    // Listen for page visibility change to refresh name when user returns to the page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLoggedIn) {
        fetchUserName();
      }
    };

    // Listen for window focus to refresh name when user returns to the tab
    const handleWindowFocus = () => {
      if (isLoggedIn) {
        fetchUserName();
      }
    };

    window.addEventListener('userNameUpdated', handleUserNameUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('userNameUpdated', handleUserNameUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isLoggedIn, userToken, advertiserToken]);

  const handleLogout = () => {
    // Remove both tokens for clean logout
    localStorage.removeItem('userToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    setUserName('');
    navigate('/login');
  };

  const handleHomeClick = async () => {
    const userToken = localStorage.getItem('userToken');
    const advertiserToken = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // Refresh user name before navigation
    await refreshUserName();

    // Not logged in
    if (!userToken && !advertiserToken) {
      navigate('/');
      return;
    }

    // Admin user
    if (userRole === 'admin') {
      navigate('/admin-dashboard');
      return;
    }

    // Regular user
    if (userToken && userRole === 'user') {
      navigate('/userdashboard');
      return;
    }

    // Advertiser
    if (advertiserToken) {
      navigate('/advertiser-dashboard');
      return;
    }

    // fallback
    navigate('/');
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
              <button className="nav-link-button" onClick={async () => {
                await refreshUserName();
                navigate('/about');
              }}>
                About Us
              </button>
            </li>
            <li>
              <button className="nav-link-button" onClick={async () => {
                await refreshUserName();
                navigate('/help');
              }}>
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
                    onClick={async () => {
                      await refreshUserName();
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