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
  try {
    const response = await validateStaffLoginAPI(username, password);
    return response;
  } catch (error) {
    console.error('Failed to validate staff login:', error);
    return {
      success: false,
      message: error.message || 'Invalid username or password'
    };
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