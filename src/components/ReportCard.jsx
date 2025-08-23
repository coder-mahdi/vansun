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

  // Ensure report has jewelry field for backward compatibility and adjusted amounts
  const reportWithJewelry = {
    ...report,
    jewelry: report.jewelry || [],
    adjustedServicePrice: report.adjustedServicePrice || report.servicePrice,
    adjustedJewelryPrice: report.adjustedJewelryPrice || report.jewelryPrice
  };
  
  const employeeIncome = calculateEmployeeIncome(reportWithJewelry, 'staff');
  const oscarIncome = showOscarIncome ? calculateOscarIncome(reportWithJewelry) : null;
  const vansunIncome = showVansunIncome ? calculateVansunIncome(reportWithJewelry) : null;
  const managerIncome = currentUser?.role === 'Manager' ? calculateEmployeeIncome(reportWithJewelry, 'manager') : null;

  return (
    <div className={`report-card ${isSelected ? 'selected' : ''}`}>
      <div className="report-header">
        <h3>{report.customerName || 'Anonymous Customer'}</h3>
        <span className="report-date">{formatDate(report.date)}</span>
      </div>
      
      <div className="report-summary">
        <div className="summary-item services-section">
          <span>Services:</span>
          <div className="services-details">
            <div className="services-list">
              {report.services.map((service, index) => (
                <div key={index} className="service-detail">
                  <span>{service.name} (Qty: {service.quantity})</span>
                </div>
              ))}
            </div>
            <div className="services-total">
              <span>${(parseFloat(report.servicePrice) || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="summary-item jewelry-section">
          <span>Jewelry:</span>
          <div className="jewelry-details">
            <div className="jewelry-list">
              {report.jewelry.map((jewelry, index) => (
                <div key={index} className="jewelry-detail">
                  <span>{jewelry.name} (Qty: {jewelry.quantity})</span>
                </div>
              ))}
            </div>
            <div className="jewelry-total">
              <span>${(parseFloat(report.jewelryPrice) || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="summary-item">
          <span>After Care:</span>
                          <span>${(parseFloat(report.adjustedAfterCarePrice || report.afterCarePrice) || 0).toFixed(2)}</span>
        </div>
        {report.customPrice > 0 && (
          <div className="summary-item custom-price">
            <span>Custom Price:</span>
            <span>${(parseFloat(report.customPrice) || 0).toFixed(2)}</span>
          </div>
        )}
        {report.customPrice > 0 && report.customPrice > report.servicePrice && (
          <div className="summary-item">
            <span>Jewelry Amount:</span>
            <span>${((parseFloat(report.customPrice) - parseFloat(report.servicePrice)) || 0).toFixed(2)}</span>
          </div>
        )}
        {report.customPrice > 0 && report.customPrice <= report.servicePrice && (
          <div className="summary-item">
            <span>Jewelry Amount:</span>
            <span>$0.00</span>
          </div>
        )}
        {report.tip > 0 && (
          <div className="summary-item">
            <span>Tip:</span>
            <span>${(parseFloat(report.tip) || 0).toFixed(2)}</span>
          </div>
        )}
        <div className={`summary-item ${report.customPrice > 0 ? 'custom-total' : ''}`}>
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