import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated } from '../utils/adminAuth';

const AdminProtectedRoute = ({ children }) => {
  if (!isAdminAuthenticated()) {
    // Redirect to admin login if not authenticated
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute; 