// Authentication utility for staff login with WordPress API integration
import { validateStaffLogin } from './userManagement';

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('staffToken');
  const expiry = localStorage.getItem('staffExpiry');
  
  if (!token || !expiry) {
    return false;
  }
  
  // Check if session has expired
  if (new Date().getTime() > parseInt(expiry)) {
    logout();
    return false;
  }
  
  return true;
};

// Login function with WordPress API
export const login = async (username, password) => {
  try {
    const result = await validateStaffLogin(username, password);
    
    if (result.success) {
      // Create session token (simple timestamp-based token)
      const token = `staff_${Date.now()}`;
      const expiry = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
      
      // Store in localStorage
      localStorage.setItem('staffToken', token);
      localStorage.setItem('staffExpiry', expiry.toString());
      localStorage.setItem('staffUsername', username);
      localStorage.setItem('staffUserData', JSON.stringify(result.user));
      
      return { success: true, message: 'Login successful' };
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

// Logout function
export const logout = () => {
  localStorage.removeItem('staffToken');
  localStorage.removeItem('staffExpiry');
  localStorage.removeItem('staffUsername');
  window.location.href = '/staff/login';
};

// Get current user info
export const getCurrentUser = () => {
  if (!isAuthenticated()) {
    return null;
  }
  
  const userData = localStorage.getItem('staffUserData');
  const user = userData ? JSON.parse(userData) : null;
  
  return {
    username: localStorage.getItem('staffUsername'),
    token: localStorage.getItem('staffToken'),
    ...user
  };
};

// Function to change credentials (for admin use)
export const updateCredentials = (newUsername, newPassword) => {
  // In a real app, this would be an API call
  console.log('Credentials updated:', { username: newUsername, password: '***' });
  return Promise.resolve({ success: true, message: 'Credentials updated successfully' });
}; 