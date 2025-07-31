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
  const users = getAllStaffUsers();
  const newUser = {
    id: Date.now().toString(),
    username: userData.username,
    password: userData.password,
    fullName: userData.fullName,
    email: userData.email,
    role: userData.role || 'Staff', // Default role is Staff
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveStaffUsers(users);
  return newUser;
};

// Update staff user
export const updateStaffUser = (userId, userData) => {
  const users = getAllStaffUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    saveStaffUsers(users);
    return users[userIndex];
  }
  return null;
};

// Delete staff user
export const deleteStaffUser = (userId) => {
  const users = getAllStaffUsers();
  const filteredUsers = users.filter(user => user.id !== userId);
  saveStaffUsers(filteredUsers);
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
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    };
  }
  
  return {
    success: false,
    message: 'Invalid username or password'
  };
};

// Role-based access control
export const canViewAllReports = (userRole) => {
  return userRole === 'Manager' || userRole === 'Supervisor';
};

export const canManageUsers = (userRole) => {
  return userRole === 'Supervisor';
};

export const getAvailableRoles = () => {
  return ['Staff', 'Manager', 'Supervisor'];
}; 