import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentAdmin, adminLogout, isAdminAuthenticated } from '../../utils/adminAuth';
import { getAllStaffUsers } from '../../utils/userManagement';
import Layout from '../../layout/Layout';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentAdmin = getCurrentAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const staffUsers = await getAllStaffUsers();
      setUsers(staffUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Session timeout monitoring
  useEffect(() => {
    const checkSession = () => {
      if (!isAdminAuthenticated()) {
        adminLogout();
        navigate('/admin/login');
      }
    };

    // Check session every minute
    const interval = setInterval(checkSession, 60000);
    
    // Also check on user activity
    const handleUserActivity = () => {
      checkSession();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [navigate]);

  const handleLogout = () => {
    adminLogout();
  };

  const getActiveUsersCount = () => {
    return users.filter(user => user.isActive).length;
  };

  const getInactiveUsersCount = () => {
    return users.filter(user => !user.isActive).length;
  };

  return (
    <Layout>
      <div className="admin-dashboard-container">
        <div className="dashboard-header">
          <div className="admin-info">
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {currentAdmin?.username}!</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <p className="stat-number">{loading ? '...' : users.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Active Users</h3>
              <p className="stat-number">{loading ? '...' : getActiveUsersCount()}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>Inactive Users</h3>
              <p className="stat-number">{loading ? '...' : getInactiveUsersCount()}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-cards">
              <Link to="/admin/users/create" className="action-card">
                <div className="card-icon">➕</div>
                <h3>Create User</h3>
                <p>Add a new staff member</p>
              </Link>

              <Link to="/admin/users/manage" className="action-card">
                <div className="card-icon">👥</div>
                <h3>Manage Users</h3>
                <p>View and edit all staff users</p>
              </Link>
            </div>
          </div>


        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard; 