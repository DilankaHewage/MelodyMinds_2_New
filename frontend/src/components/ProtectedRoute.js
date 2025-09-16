import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('userToken');
  const userRole = localStorage.getItem('userRole');
  if (!token) {
    return <Navigate to="/login" />;
  }
  if (role && userRole !== role) {
    // If role is specified and doesn't match, redirect to user dashboard
    return <Navigate to="/userdashboard" />;
  }
  return children;
};

export default ProtectedRoute; 