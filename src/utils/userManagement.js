// User management system for admin
const STAFF_USERS_KEY = 'staffUsers';

// Get all staff users
export const getAllStaffUsers = () => {
  const users = localStorage.getItem(STAFF_USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Save all staff users
const saveStaffUsers = (users) => {
  localStorage.setItem(STAFF_USERS_KEY, JSON.stringify(users));
};

// Create new staff user
export const createStaffUser = (userData) => {
  return new Promise((resolve, reject) => {
    try {
      const users = getAllStaffUsers();
      
      // Check if username already exists
      const existingUser = users.find(user => user.username === userData.username);
      if (existingUser) {
        reject({ success: false, message: 'Username already exists' });
        return;
      }

      // Validate password strength
      if (userData.password.length < 6) {
        reject({ success: false, message: 'Password must be at least 6 characters long' });
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        username: userData.username,
        password: userData.password, // In production, this should be hashed
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role || 'staff',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: null
      };

      users.push(newUser);
      saveStaffUsers(users);

      resolve({ 
        success: true, 
        message: 'Staff user created successfully',
        user: { ...newUser, password: undefined } // Don't return password
      });
    } catch (error) {
      reject({ success: false, message: 'Failed to create user' });
    }
  });
};

// Update staff user
export const updateStaffUser = (userId, userData) => {
  return new Promise((resolve, reject) => {
    try {
      const users = getAllStaffUsers();
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        reject({ success: false, message: 'User not found' });
        return;
      }

      // Check if new username conflicts with other users
      const usernameConflict = users.find(user => 
        user.id !== userId && user.username === userData.username
      );
      if (usernameConflict) {
        reject({ success: false, message: 'Username already exists' });
        return;
      }

      // Update user data
      users[userIndex] = {
        ...users[userIndex],
        username: userData.username,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role || users[userIndex].role,
        isActive: userData.isActive !== undefined ? userData.isActive : users[userIndex].isActive
      };

      // Update password if provided
      if (userData.password) {
        if (userData.password.length < 6) {
          reject({ success: false, message: 'Password must be at least 6 characters long' });
          return;
        }
        users[userIndex].password = userData.password;
      }

      saveStaffUsers(users);

      resolve({ 
        success: true, 
        message: 'User updated successfully',
        user: { ...users[userIndex], password: undefined }
      });
    } catch (error) {
      reject({ success: false, message: 'Failed to update user' });
    }
  });
};

// Delete staff user
export const deleteStaffUser = (userId) => {
  return new Promise((resolve, reject) => {
    try {
      const users = getAllStaffUsers();
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        reject({ success: false, message: 'User not found' });
        return;
      }

      users.splice(userIndex, 1);
      saveStaffUsers(users);

      resolve({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      reject({ success: false, message: 'Failed to delete user' });
    }
  });
};

// Get staff user by ID
export const getStaffUserById = (userId) => {
  const users = getAllStaffUsers();
  return users.find(user => user.id === userId);
};

// Validate staff login (for regular staff users)
export const validateStaffLogin = (username, password) => {
  const users = getAllStaffUsers();
  const user = users.find(u => u.username === username && u.isActive);
  
  if (user && user.password === password) {
    // Update last login
    user.lastLogin = new Date().toISOString();
    saveStaffUsers(users);
    return { success: true, user: { ...user, password: undefined } };
  }
  
  return { success: false, message: 'Invalid credentials or user is inactive' };
}; 