import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import AdvertiserLoginPage from './pages/AdvertiserLoginPage';
import UserAccountCreation from './pages/UserAccountCreation';
import AdvertiserAccountCreation from './pages/AdvertiserAccountCreation';
import Header from './components/Header';
import Footer from './components/Footer';
import UserProfile from './pages/UserProfile';
import AdvertiserProfile from './pages/AdvertiserProfile';
import UserDashboard from './pages/UserDashboard';
import EventDetails from './pages/EventDetails';
import AdvertiserDashboard from './pages/AdvertiserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import '@fortawesome/fontawesome-free/css/all.min.css';
import AboutUs from './pages/AboutUs';
import { useState } from 'react';
import AdvertiserEventing from './pages/AdvertiserEventing';
import Help from './pages/Help'; 
import AdminDashboard from './pages/AdminDashboard';
import AdvertiserAdvertisementManagement from './pages/AdvertiserAdvertisementManagement';
import UserAdvertisements from './pages/UserAdvertisements';


function App() {
  const [userName, setUserName] = useState(''); // State to store the user's name


  return (
    <Router>
      <div className="App">
      <Header userName={userName} setUserName={setUserName} />
     
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/advertiser-login" element={<AdvertiserLoginPage />} />
            <Route path="/create-user-account" element={<UserAccountCreation />} />
            <Route path="/create-advertiser-account" element={<AdvertiserAccountCreation />} />
            <Route path="/user-profile" element={<UserProfile userName={userName} setUserName={setUserName} />} />
            <Route path="/advertiser-profile" element={<AdvertiserProfile />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/about" element={<AboutUs/>} />
            <Route path="/help" element={<Help/>} />
            <Route path="/advertiser-eventing" element={<AdvertiserEventing />} />
            <Route
              path="/userdashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
           <Route path="/advertiser-dashboard" element={<AdvertiserDashboard />} />
           <Route
             path="/advertiser-advertisements"
             element={
               <ProtectedRoute>
                 <AdvertiserAdvertisementManagement />
               </ProtectedRoute>
             }
           />
           <Route path="/advertisements" element={<UserAdvertisements />} />
           <Route
             path="/admin-dashboard"
             element={
               <ProtectedRoute role="admin">
                 <AdminDashboard />
               </ProtectedRoute>
             }
           />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;