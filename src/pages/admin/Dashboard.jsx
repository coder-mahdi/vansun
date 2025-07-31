import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentAdmin, adminLogout } from '../../utils/adminAuth';
import { getAllStaffUsers } from '../../utils/userManagement';
import Layout from '../../layout/Layout';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentAdmin = getCurrentAdmin();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const staffUsers = getAllStaffUsers();
    setUsers(staffUsers);
    setLoading(false);
  };

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
              <p className="stat-number">{users.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Active Users</h3>
              <p className="stat-number">{getActiveUsersCount()}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>Inactive Users</h3>
              <p className="stat-number">{getInactiveUsersCount()}</p>
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

              <div className="action-card">
                <div className="card-icon">📊</div>
                <h3>Analytics</h3>
                <p>View user activity reports</p>
              </div>

              <div className="action-card">
                <div className="card-icon">⚙️</div>
                <h3>Settings</h3>
                <p>Admin panel settings</p>
              </div>
            </div>
          </div>

          <div className="recent-users">
            <h2>Recent Users</h2>
            {loading ? (
              <div className="loading">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="no-users">
                <p>No staff users created yet.</p>
                <Link to="/admin/users/create" className="create-first-user">
                  Create First User
                </Link>
              </div>
            ) : (
              <div className="users-list">
                {users.slice(0, 5).map(user => (
                  <div key={user.id} className="user-item">
                    <div className="user-avatar">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <h4>{user.fullName || user.username}</h4>
                      <p>{user.username} • {user.role}</p>
                      <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="user-actions">
                      <Link to={`/admin/users/edit/${user.id}`} className="edit-btn">
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
                {users.length > 5 && (
                  <div className="view-all-users">
                    <Link to="/admin/users/manage">View All Users</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard; 