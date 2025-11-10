import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getCurrentUser, logout } from '../../utils/auth';
import { canViewAllReports, canManageUsers } from '../../utils/userManagement';
import Layout from '../../layout/Layout';

const SITE_URL = 'https://vansunstudio.com';

const Dashboard = () => {
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
  };

  // Check user permissions
  const canViewReports = currentUser ? canViewAllReports(currentUser.role) : false;
  const canManageStaff = currentUser ? canManageUsers(currentUser.role) : false;

  return (
    <Layout>
      <Helmet>
        <title>Staff Dashboard | Vansun Studio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${SITE_URL}/staff/dashboard`} />
      </Helmet>
      <div className="staff-dashboard-container">
        <div className="dashboard-header">
          <div className="user-info">
            <h1>Staff Dashboard</h1>
            <p>Welcome back, {currentUser?.full_name || currentUser?.username}!</p>
            {currentUser?.role && (
              <p className="user-role">Role: {currentUser.role}</p>
            )}
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

        <div className="dashboard-content">
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-cards">
              <Link to="/staff/sales-report" className="action-card">
                <div className="card-icon">📝</div>
                <h3>Create Report</h3>
                <p>Submit a new sales report</p>
              </Link>

              {canViewReports && (
                <Link to="/staff/view-reports" className="action-card">
                  <div className="card-icon">📊</div>
                  <h3>View Reports</h3>
                  <p>View and analyze sales reports</p>
                </Link>
              )}

              {canManageStaff && (
                <Link to="/staff/manage-users" className="action-card">
                  <div className="card-icon">👥</div>
                  <h3>Manage Staff</h3>
                  <p>Manage staff users and permissions</p>
                </Link>
              )}
            </div>
          </div>

          <div className="recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">📝</div>
                <div className="activity-content">
                  <h4>Sales Report Submitted</h4>
                  <p>Today at 2:30 PM</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">📊</div>
                <div className="activity-content">
                  <h4>Monthly Report Generated</h4>
                  <p>Yesterday at 4:15 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard; 