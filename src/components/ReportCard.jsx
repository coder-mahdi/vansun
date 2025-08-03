import React from 'react';
import { calculateEmployeeIncome, calculateOscarIncome, calculateVansunIncome } from '../utils/salesData';

const ReportCard = ({ 
  report, 
  isSelected, 
  onSelect, 
  currentUser, 
  showOscarIncome, 
  showVansunIncome 
}) => {

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Ensure report has jewelry field for backward compatibility
  const reportWithJewelry = {
    ...report,
    jewelry: report.jewelry || []
  };
  
  const employeeIncome = calculateEmployeeIncome(reportWithJewelry, 'staff');
  const oscarIncome = showOscarIncome ? calculateOscarIncome(reportWithJewelry) : null;
  const vansunIncome = showVansunIncome ? calculateVansunIncome(reportWithJewelry) : null;
  const managerIncome = currentUser?.role === 'Manager' ? calculateEmployeeIncome(reportWithJewelry, 'manager') : null;

  return (
    <div 
      className={`report-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(report)}
    >
      <div className="report-header">
        <h3>{report.customerName || 'Anonymous Customer'}</h3>
        <span className="report-date">{formatDate(report.date)}</span>
      </div>
      
      <div className="report-summary">
        <div className="summary-item">
          <span>Services:</span>
          <span>${(parseFloat(report.servicePrice) || 0).toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span>Jewelry:</span>
          <span>${(parseFloat(report.jewelryPrice) || 0).toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span>After Care:</span>
          <span>${(parseFloat(report.afterCarePrice) || 0).toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span>Tip:</span>
          <span>${(parseFloat(report.tip) || 0).toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span>Total:</span>
          <span>${(parseFloat(report.afterTax) || 0).toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span>Payment:</span>
          <span>{report.paymentMethod || 'Cash'}</span>
        </div>
        {currentUser?.role === 'Staff' && (
          <div className="summary-item employee-income">
            <span>Employee Income:</span>
            <span>${(employeeIncome?.totalIncome || 0).toFixed(2)}</span>
          </div>
        )}
        
        {currentUser?.role === 'Manager' && managerIncome && (
          <div className="summary-item manager-income">
            <span>Manager Income:</span>
            <span>${(managerIncome?.totalIncome || 0).toFixed(2)}</span>
          </div>
        )}
        
        {oscarIncome && (
          <div className="summary-item oscar-income">
            <span>Oscar's Income:</span>
            <span>${(oscarIncome?.totalIncome || 0).toFixed(2)}</span>
          </div>
        )}
        
        {vansunIncome && (
          <div className="summary-item vansun-income">
            <span>Vansun Income:</span>
            <span>${(vansunIncome?.totalIncome || 0).toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard; 