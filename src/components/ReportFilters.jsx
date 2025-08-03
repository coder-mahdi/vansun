import React from 'react';
import { canViewAllReports } from '../utils/userManagement';

const ReportFilters = ({ 
  currentUser, 
  staffUsers, 
  selectedStaffFilter, 
  setSelectedStaffFilter,
  showOscarIncome,
  setShowOscarIncome,
  showVansunIncome,
  setShowVansunIncome
}) => {
  if (!canViewAllReports(currentUser?.role)) {
    return null;
  }

  return (
    <div className="filters-section">
      <div className="filter-group">
        <label>Filter by Staff Member:</label>
        <select 
          value={selectedStaffFilter} 
          onChange={(e) => setSelectedStaffFilter(e.target.value)}
          className="staff-filter"
        >
          <option value="all">All Staff Members</option>
          {staffUsers.map(user => (
            <option key={user.id} value={user.username}>
              {user.fullName || user.username} ({user.role})
            </option>
          ))}
        </select>
      </div>
      
      <div className="income-options">
        <label>
          <input 
            type="checkbox" 
            checked={showOscarIncome} 
            onChange={(e) => setShowOscarIncome(e.target.checked)}
          />
          Show Oscar's Income
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={showVansunIncome} 
            onChange={(e) => setShowVansunIncome(e.target.checked)}
          />
          Show Vansun Income
        </label>
      </div>
    </div>
  );
};

export default ReportFilters; 