import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, isAdminAuthenticated } from '../../utils/adminAuth';
import Layout from '../../layout/Layout';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminLogin(formData.username, formData.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="admin-login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Admin Login</h1>
            <p>Access the admin panel to manage staff users</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Admin Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter admin username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Admin Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter admin password"
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>

          <div className="login-footer">
            <p>Vansun Studio Admin Portal</p>
            <p className="default-credentials">
              Default: admin / admin2024
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin; 