import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './UserDashboard.css';
import EventCard from '../components/EventCard';
import DatePicker from 'react-datepicker';

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [userName, setUserName] = useState(''); // State to store the user's name
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [isDistrictListVisible, setIsDistrictListVisible] = useState(false); 
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
    'Galle', 'Matara', 'Hambantota', 'Vavuniya', 'Kilinochchi', 'Mannar', 'Jaffna', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle', 'NuwaraEliya'
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/events');
        const sortedEvents = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const fetchUserName = async () => {
      const token = localStorage.getItem('userToken'); // Check if the user is logged in
      if (token) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const { data } = await axios.get('http://localhost:5000/api/users/profile', config); // Fetch user profile
          setUserName(data.name); // Set the user's name
        } catch (error) {
          console.error('Error fetching user profile:', error); // Handle error
        }
      }
    };

    fetchEvents();
    fetchUserName();
  }, []);



  // Filter and search events based on filters and search term
  const filteredEvents = events.filter(event => {
    const isSearchMatch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const isDateMatch = selectedDate
      ? new Date(event.date).toDateString() === selectedDate.toDateString()
      : true;
    const isDistrictMatch = selectedDistricts.length > 0
      ? selectedDistricts.includes(event.district)
      : true;
    return isSearchMatch && isDateMatch && isDistrictMatch;
  });

  const clearFilters = () => {
    setSelectedDate(null);
    setSelectedDistricts([]);
    setSearchTerm('');
    setIsDistrictListVisible(false);
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1 >Welcome to Melody Minds, {userName.split(' ')[0]}</h1> {/* Display the user's first name */}
      </div>

      {/* Search Bar Section */}
      <div className="search-bar">
  <div className="input-wrap">
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    {!searchTerm && (
      <div className="placeholder-rail">
        <span className="placeholder-runner">Explore Your Musical World</span>
      </div>
    )}
  </div>
</div>
      


       {/* Filter Section */}
       <div className="filter-section">
        <h2>Customize Your Event Search</h2>

        {/* Date Filter */}
        <div className="filter-date">
          <label className="date-styling">Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            isClearable
            placeholderText="Select a Date"
          />
        </div>

        {/* District Filter */}
        <div className="filter-district">
  <label className="text-styling">Select District:</label>
  <button
    className="toggle-district-btn"
    onClick={() => setIsDistrictListVisible(!isDistrictListVisible)}
  >
    {selectedDistricts.length > 0 ? (
      selectedDistricts.map((district, index) => (
        <span key={index} className="selected-district">
          {district}
          <button
            className="remove-district-btn"
            onClick={(e) => {
              e.stopPropagation(); // Prevent dropdown toggle
              setSelectedDistricts(selectedDistricts.filter(d => d !== district));
            }}
          >
            &times;
          </button>
        </span>
      ))
    ) : (
      'Select District'
    )}
  </button>
  {isDistrictListVisible && (
    <select
      multiple
      className="district-dropdown"
      value={selectedDistricts}
      onChange={(e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedDistricts(selectedOptions);
        setIsDistrictListVisible(false); // Hide the dropdown after selection
      }}
    >
      {districts.map((district, index) => (
        <option key={index} value={district}>
          {district}
        </option>
      ))}
    </select>
  )}
</div>
        {/* Clear Filters */}
        <div className="clear-filters">
          <button onClick={clearFilters}>Clear Filters</button>
        </div>
      </div>

      {/* Event Cards */}
      <div className="event-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventCard key={event._id} event={event} />
          ))
        ) : (
          <p>No events match your filters</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;