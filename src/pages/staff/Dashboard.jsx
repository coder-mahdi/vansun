import React from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, logout } from '../../utils/auth';
import Layout from '../../layout/Layout';

const Dashboard = () => {
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <Layout>
      <div className="staff-dashboard-container">
        <div className="dashboard-header">
          <div className="user-info">
            <h1>Staff Dashboard</h1>
            <p>Welcome back, {currentUser?.username}!</p>
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
                <div className="card-icon">📊</div>
                <h3>Submit Sales Report</h3>
                <p>Create and submit a new sales report</p>
              </Link>

              <Link to="/staff/reports" className="action-card">
                <div className="card-icon">📋</div>
                <h3>View Reports</h3>
                <p>View and print existing sales reports</p>
              </Link>

              <div className="action-card">
                <div className="card-icon">📈</div>
                <h3>Analytics</h3>
                <p>View sales analytics and trends</p>
              </div>

              <div className="action-card">
                <div className="card-icon">📊</div>
                <h3>Sales Reports</h3>
                <p>Submit and view sales reports</p>
              </div>
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