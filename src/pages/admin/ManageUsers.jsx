import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getAllStaffUsers, 
  updateStaffUser, 
  deleteStaffUser, 
  getAvailableRoles 
} from '../../utils/userManagement';
import Layout from '../../layout/Layout';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    fullName: '',
    email: '',
    role: '',
    isActive: true
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getAllStaffUsers();
    setUsers(allUsers);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      fullName: user.fullName || '',
      email: user.email || '',
      role: user.role,
      isActive: user.isActive
    });
    setEditMode(true);
    setMessage({ type: '', text: '' });
  };

  const handleUpdate = () => {
    try {
      const updatedUser = updateStaffUser(selectedUser.id, editForm);
      if (updatedUser) {
        setMessage({ type: 'success', text: 'User updated successfully!' });
        loadUsers();
        setEditMode(false);
        setSelectedUser(null);
      } else {
        setMessage({ type: 'error', text: 'Failed to update user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update user' });
    }
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        deleteStaffUser(userId);
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        loadUsers();
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(null);
          setEditMode(false);
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete user' });
      }
    }
  };

  const handleToggleActive = (user) => {
    try {
      const updatedUser = updateStaffUser(user.id, { isActive: !user.isActive });
      if (updatedUser) {
        setMessage({ type: 'success', text: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully!` });
        loadUsers();
      } else {
        setMessage({ type: 'error', text: 'Failed to update user status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user status' });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="admin-dashboard-container">
        <div className="dashboard-header">
          <div className="admin-info">
            <h1>Manage Users</h1>
            <p>Edit, activate, and manage staff user accounts</p>
          </div>
          <Link to="/admin/dashboard" className="back-to-dashboard">
            ← Back to Admin Dashboard
          </Link>
        </div>

        <div className="manage-users-container">
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="users-grid">
            <div className="users-list">
              <h2>All Users ({users.length})</h2>
              <div className="users-table">
                <div className="table-header">
                  <span>Username</span>
                  <span>Full Name</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span>Created</span>
                  <span>Actions</span>
                </div>
                {users.map((user) => (
                  <div key={user.id} className={`table-row ${selectedUser?.id === user.id ? 'selected' : ''}`}>
                    <span>{user.username}</span>
                    <span>{user.fullName || 'N/A'}</span>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span>{formatDate(user.createdAt)}</span>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      <button 
                        className={`toggle-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleActive(user)}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {editMode && selectedUser && (
              <div className="edit-user-panel">
                <h2>Edit User</h2>
                <div className="edit-form">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    >
                      {getAvailableRoles().map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                      />
                      Active Account
                    </label>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => {
                        setEditMode(false);
                        setSelectedUser(null);
                        setMessage({ type: '', text: '' });
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="update-btn"
                      onClick={handleUpdate}
                    >
                      Update User
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageUsers; 