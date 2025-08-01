// User management system for admin - WordPress API integration
import { getStaffUsers, createStaffUser as createStaffUserAPI, updateStaffUser as updateStaffUserAPI, deleteStaffUser as deleteStaffUserAPI, validateStaffLogin as validateStaffLoginAPI } from './wordpressApi';

// Get all staff users
export const getAllStaffUsers = async () => {
  try {
    const users = await getStaffUsers();
    return users;
  } catch (error) {
    console.error('Failed to fetch staff users from WordPress API:', error);
    console.log('Falling back to localStorage...');
    
    // Fallback to localStorage if WordPress API is not available
    const STAFF_USERS_KEY = 'staffUsers';
    const users = localStorage.getItem(STAFF_USERS_KEY);
    return users ? JSON.parse(users) : [];
  }
};

// Get available staff users for login (with credentials)
export const getAvailableStaffUsers = async () => {
  try {
    const response = await fetch('https://vansunstudio.com/cms/wp-json/wp/v2/staff_user');
    const users = await response.json();
    
    // Filter active users and extract credentials
    const availableUsers = users
      .filter(user => user.title && user.title !== '') // Filter users with title
      .map(user => {
        // Use title as username since that's what we have
        const username = user.title || '';
        const password = user.password || 'Vansun2024'; // Use password from API if available
        const full_name = user.full_name || user.title || '';
        const email = user.email || '';
        const role = user.role || 'Staff'; // Use role from API
        const is_active = user.is_active !== ''; // Check if active
        
        return {
          id: user.id,
          username,
          password,
          full_name,
          email,
          role,
          is_active
        };
      })
      .filter(user => user.username); // Only users with username
    
    return availableUsers;
  } catch (error) {
    console.error('Failed to fetch available staff users:', error);
    return [];
  }
};

// Create new staff user
export const createStaffUser = async (userData) => {
  try {
    const newUser = await createStaffUserAPI(userData);
    return newUser;
  } catch (error) {
    console.error('Failed to create staff user:', error);
    throw error;
  }
};

// Update staff user
export const updateStaffUser = async (userId, userData) => {
  try {
    const updatedUser = await updateStaffUserAPI(userId, userData);
    return updatedUser;
  } catch (error) {
    console.error('Failed to update staff user:', error);
    throw error;
  }
};

// Delete staff user
export const deleteStaffUser = async (userId) => {
  try {
    await deleteStaffUserAPI(userId);
    return true;
  } catch (error) {
    console.error('Failed to delete staff user:', error);
    throw error;
  }
};

// Get staff user by ID
export const getStaffUserById = async (userId) => {
  try {
    const users = await getAllStaffUsers();
    return users.find(user => user.id === userId);
  } catch (error) {
    console.error('Failed to get staff user by ID:', error);
    return null;
  }
};

// Validate staff login (for regular staff users)
export const validateStaffLogin = async (username, password) => {
  console.log('validateStaffLogin called with:', { username, password });
  
  try {
    // First try WordPress API
    const response = await validateStaffLoginAPI(username, password);
    console.log('API response:', response);
    return response;
  } catch (error) {
    console.error('Failed to validate staff login via API:', error);
    
    // Fallback: Check against WordPress users directly
    try {
      const availableUsers = await getAvailableStaffUsers();
      console.log('Available users from fallback:', availableUsers);
      
      const user = availableUsers.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
      );
      
      console.log('Found user in fallback:', user);
      
      if (user) {
        return {
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            is_active: user.is_active
          }
        };
      } else {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }
    } catch (fallbackError) {
      console.error('Failed to validate staff login via fallback:', fallbackError);
      return {
        success: false,
        message: error.message || 'Invalid username or password'
      };
    }
  }
};

// Role-based access control
export const canViewAllReports = (userRole) => {
  return userRole === 'Manager';
};

export const canManageUsers = (userRole) => {
  return userRole === 'Manager';
};

export const getAvailableRoles = () => {
  return ['Staff', 'Manager'];
}; 