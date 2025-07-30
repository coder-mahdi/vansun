// Admin authentication utility
const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin2024'
};

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  const expiry = localStorage.getItem('adminExpiry');
  
  if (!token || !expiry) {
    return false;
  }
  
  // Check if session has expired
  if (new Date().getTime() > parseInt(expiry)) {
    adminLogout();
    return false;
  }
  
  return true;
};

// Admin login function
export const adminLogin = (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const token = `admin_${Date.now()}`;
        const expiry = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
        
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminExpiry', expiry.toString());
        localStorage.setItem('adminUsername', username);
        
        resolve({ success: true, message: 'Admin login successful' });
      } else {
        reject({ success: false, message: 'Invalid admin credentials' });
      }
    }, 500);
  });
};

// Admin logout function
export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminExpiry');
  localStorage.removeItem('adminUsername');
  window.location.href = '/admin/login';
};

// Get current admin info
export const getCurrentAdmin = () => {
  if (!isAdminAuthenticated()) {
    return null;
  }
  
  return {
    username: localStorage.getItem('adminUsername'),
    token: localStorage.getItem('adminToken')
  };
}; 