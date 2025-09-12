import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Home.css';
import { useMemo } from 'react';


const districts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
  'Galle', 'Matara', 'Hambantota', 'Vavuniya', 'Kilinochchi', 'Mannar', 'Jaffna', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle', 'NuwaraEliya'
];

const Home = () => {
  const [events, setEvents] = useState([]); // State to store events fetched from the backend
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [isDistrictListVisible, setIsDistrictListVisible] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [nearMeEnabled, setNearMeEnabled] = useState(false);
   const [radiusKm, setRadiusKm] = useState(20); 
  

  // Fetch comment counts for all events
  const fetchCommentCounts = useCallback(async (eventList) => {
    try {
      const counts = {};
      await Promise.all(eventList.map(async (event) => {
        try {
          const res = await axios.get(`http://localhost:5000/api/comments/event/${event._id}/count`);
          counts[event._id] = res.data.count;
        } catch (err) {
          counts[event._id] = 0;
        }
      }));
      setCommentCounts(counts);
    } catch (error) {
      console.error('Error fetching comment counts:', error);
    }
  }, []);

  // Fetch events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/events'); // Fetch all events from the backend
        // Sort events by creation date (newest first)
        const sortedEvents = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setEvents(sortedEvents);
        fetchCommentCounts(sortedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, [fetchCommentCounts]);

  // Refetch comment counts when the page/tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCommentCounts(events);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [events, fetchCommentCounts]);

const toRadians = (deg) => (deg * Math.PI) / 180;
  const distanceKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter and search events based on filters and search term
const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        const isSearchMatch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
        const isDateMatch = selectedDate
          ? new Date(event.date).toDateString() === selectedDate.toDateString()
          : true;
        const isDistrictMatch = selectedDistricts.length > 0
          ? selectedDistricts.includes(event.district)
          : true;

        let isNearMeMatch = true;
        if (nearMeEnabled) {
          if (!userLocation) return false; // wait for location
          const lat = Number(event.lat);
          const lng = Number(event.lng);
          if (isNaN(lat) || isNaN(lng)) return false;
          const d = distanceKm(userLocation.lat, userLocation.lng, lat, lng);
          console.log(
            `UserLocation: (${userLocation.lat}, ${userLocation.lng}) | ` +
            `Event: ${event.title}, EventLocation: (${lat}, ${lng}) | ` +
            `Distance: ${d.toFixed(2)} km`
          );
          isNearMeMatch = d <= radiusKm;
        }

        return isSearchMatch && isDateMatch && isDistrictMatch && isNearMeMatch;
      })
      .sort((a, b) => {
        if (nearMeEnabled && userLocation && a.lat && a.lng && b.lat && b.lng) {
          const da = distanceKm(userLocation.lat, userLocation.lng, Number(a.lat), Number(a.lng));
          const db = distanceKm(userLocation.lat, userLocation.lng, Number(b.lat), Number(b.lng));
          return da - db;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [events, searchTerm, selectedDate, selectedDistricts, nearMeEnabled, userLocation, radiusKm]);

  // Near Me handler
  const handleNearMe = () => {
    if (!nearMeEnabled) {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setNearMeEnabled(true); // Enable after location is set
        },
        () => {
          alert('Unable to retrieve your location');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setNearMeEnabled(false);
      setUserLocation(null);
    }
  };

  const clearFilters = () => {
    setSelectedDate(null);
    setSelectedDistricts([]);
    setSearchTerm('');
    setIsDistrictListVisible(false);
  };

  return (
    <div className="home-page">
      {/* Search Bar Section */}
      {/* Search Bar Section */}
<div className="search-bar">
  <div className="input-wrap">
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    {searchTerm && (
      <button 
        className="clear-btn" 
        onClick={() => setSearchTerm("")}
      >
        ×
      </button>
    )}

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
                      e.stopPropagation();
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
                setIsDistrictListVisible(false);
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

        <div className="clear-filters">
          <button onClick={clearFilters}>Clear Filters</button>
        </div>

        <div className="near-me-section" style={{ marginTop: 16 }}>
          <button onClick={handleNearMe}>{nearMeEnabled ? 'Show All' : 'Near Me'}</button>
        </div>

        {nearMeEnabled && (
          <div className="radius-filter">
            <label>Distance : </label>
            <select value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))}>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={30}>30 km</option>
            </select>
          </div>
        )}
      </div>

      {/* Event Cards */}
      <div className="event-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventCard key={event._id} event={event} commentCount={commentCounts ? commentCounts[event._id] || 0 : 0} />
          ))
        ) : (
          <p>No events match your filters</p>
        )}
      </div>
    </div>
  );
};

export default Home;