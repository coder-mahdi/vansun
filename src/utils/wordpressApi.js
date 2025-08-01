// WordPress API service for staff user management
const WORDPRESS_API_BASE = import.meta.env.VITE_WORDPRESS_API_URL || 'https://vansunstudio.com/cms/wp-json';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${WORDPRESS_API_BASE}/vansun/v1${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Get all staff users
export const getStaffUsers = async () => {
  return await apiRequest('/staff-users');
};

// Create new staff user
export const createStaffUser = async (userData) => {
  return await apiRequest('/staff-users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

// Update staff user
export const updateStaffUser = async (userId, userData) => {
  return await apiRequest(`/staff-users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
};

// Delete staff user
export const deleteStaffUser = async (userId) => {
  return await apiRequest(`/staff-users/${userId}`, {
    method: 'DELETE'
  });
};

// Validate staff login
export const validateStaffLogin = async (username, password) => {
  return await apiRequest('/staff-login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}; 