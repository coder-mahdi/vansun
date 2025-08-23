import React from 'react';
import { calculateEmployeeIncome, calculateOscarIncome, calculateVansunIncome } from '../utils/salesData';
import { canViewAllReports } from '../utils/userManagement';

const ReportDetails = ({ selectedReport, currentUser }) => {
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

  if (!selectedReport) return null;

  return (
    <div className="report-details">
      <h2>Report Details</h2>
      <div className="details-card">
        <div className="detail-section">
          <h3>Transaction Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span>Date & Time:</span>
              <span>{formatDate(selectedReport.date)}</span>
            </div>
            <div className="detail-item">
              <span>Staff Member:</span>
              <span>{selectedReport.staffMember}</span>
            </div>
            <div className="detail-item">
              <span>Customer Name:</span>
              <span>{selectedReport.customerName || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span>Customer Phone:</span>
              <span>{selectedReport.customerPhone || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span>Payment Method:</span>
              <span>{selectedReport.paymentMethod || 'Cash'}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Services</h3>
          <div className="services-list">
            {selectedReport.services.map((service, index) => (
              <div key={index} className="service-item">
                <div className="service-info">
                  <span className="service-name">{service.name}</span>
                  <span className="service-quantity">Qty: {service.quantity}</span>
                </div>
                <div className="service-price">
                  <span>${((selectedReport.servicePrice / selectedReport.services.length) * service.quantity || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
            <div className="service-total">
              <span>Total Services:</span>
              <span>${(selectedReport.servicePrice || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Jewelry</h3>
          <div className="jewelry-list">
            {selectedReport.jewelry.map((jewelry, index) => (
              <div key={index} className="jewelry-item">
                <div className="jewelry-info">
                  <span className="jewelry-name">{jewelry.name}</span>
                  <span className="jewelry-quantity">Qty: {jewelry.quantity}</span>
                </div>
                <div className="jewelry-price">
                  <span>${((selectedReport.jewelryPrice / selectedReport.jewelry.length) * jewelry.quantity || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
            <div className="jewelry-total">
              <span>Total Jewelry:</span>
              <span>${(selectedReport.jewelryPrice || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {selectedReport.afterCare && selectedReport.afterCare.length > 0 && (
          <div className="detail-section">
            <h3>After Care</h3>
            <div className="after-care-list">
              {selectedReport.afterCare.map((afterCare, index) => (
                <div key={index} className="after-care-item">
                  <span>After Care {index + 1}</span>
                  <span>Qty: {afterCare.quantity} (${(parseFloat(afterCare.quantity) * 15 || 0).toFixed(2)})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="detail-section">
          <h3>Pricing Breakdown</h3>
          <div className="pricing-breakdown">
            {selectedReport.customPrice > 0 ? (
              <>
                <div className="price-item">
                  <span>Original Service Amount:</span>
                  <span>${(selectedReport.servicePrice || 0).toFixed(2)}</span>
                </div>
                <div className="price-item">
                  <span>Original Jewelry Amount:</span>
                  <span>${(selectedReport.jewelryPrice || 0).toFixed(2)}</span>
                </div>
                {selectedReport.afterCarePrice > 0 && (
                  <div className="price-item">
                    <span>After Care Amount:</span>
                    <span>${(selectedReport.adjustedAfterCarePrice || selectedReport.afterCarePrice || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="price-item custom-price">
                  <span>Custom Price (No Tax):</span>
                  <span>${(selectedReport.customPrice || 0).toFixed(2)}</span>
                </div>
                <div className="price-item">
                  <span>Adjusted Service Amount:</span>
                  <span>${(selectedReport.adjustedServicePrice || selectedReport.servicePrice || 0).toFixed(2)}</span>
                </div>
                <div className="price-item">
                  <span>Adjusted Jewelry Amount:</span>
                  <span>${(selectedReport.adjustedJewelryPrice || 0).toFixed(2)}</span>
                </div>
                {selectedReport.adjustedAfterCarePrice > 0 && (
                  <div className="price-item">
                    <span>Adjusted After Care Amount:</span>
                    <span>${(selectedReport.adjustedAfterCarePrice || 0).toFixed(2)}</span>
                  </div>
                )}
                {selectedReport.tip > 0 && (
                  <div className="price-item">
                    <span>Tip:</span>
                    <span>${(selectedReport.tip || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="price-item total custom-total">
                  <span>Total Amount:</span>
                  <span>${(selectedReport.afterTax || 0).toFixed(2)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="price-item">
                  <span>Service Amount:</span>
                  <span>${(selectedReport.servicePrice || 0).toFixed(2)}</span>
                </div>
                <div className="price-item">
                  <span>Jewelry Amount:</span>
                  <span>${(selectedReport.jewelryPrice || 0).toFixed(2)}</span>
                </div>
                {selectedReport.afterCarePrice > 0 && (
                  <div className="price-item">
                    <span>After Care Amount:</span>
                    <span>${(selectedReport.adjustedAfterCarePrice || selectedReport.afterCarePrice || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="price-item">
                  <span>Before Tax:</span>
                  <span>${(selectedReport.beforeTax || 0).toFixed(2)}</span>
                </div>
                <div className="price-item">
                  <span>Tax Amount (12%):</span>
                  <span>${(selectedReport.taxAmount || 0).toFixed(2)}</span>
                </div>
                {selectedReport.tip > 0 && (
                  <div className="price-item">
                    <span>Tip (Not Taxed):</span>
                    <span>${(selectedReport.tip || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="price-item total">
                  <span>Total Amount:</span>
                  <span>${(selectedReport.afterTax || 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {currentUser?.role === 'Staff' && (
          <div className="detail-section">
            <h3>Employee Income</h3>
            {(() => {
              const selectedReportWithJewelry = {
                ...selectedReport,
                jewelry: selectedReport.jewelry || [],
                adjustedServicePrice: selectedReport.adjustedServicePrice || selectedReport.servicePrice,
                adjustedJewelryPrice: selectedReport.adjustedJewelryPrice || selectedReport.jewelryPrice
              };
              const employeeIncome = calculateEmployeeIncome(selectedReportWithJewelry, 'staff');
              return (
                <div className="employee-income-breakdown">
                  {selectedReport.customPrice > 0 && (
                    <div className="income-item custom-note">
                      <span>Income based on Custom Price distribution</span>
                    </div>
                  )}
                  <div className="income-item">
                    <span>Service Amount (50%):</span>
                    <span>${(employeeIncome?.serviceIncome || 0).toFixed(2)}</span>
                  </div>
                  <div className="income-item">
                    <span>Jewelry Amount (3%):</span>
                    <span>${(employeeIncome?.jewelryIncome || 0).toFixed(2)}</span>
                  </div>
                  <div className="income-item">
                    <span>After Care Income (3% of profit):</span>
                    <span>${(employeeIncome?.afterCareIncome || 0).toFixed(2)}</span>
                  </div>
                  {(employeeIncome?.tipIncome || 0) > 0 && (
                    <div className="income-item">
                      <span>Tips:</span>
                      <span>${(employeeIncome?.tipIncome || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="income-item total">
                    <span>Total Employee Income:</span>
                    <span>${(employeeIncome?.totalIncome || 0).toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {currentUser?.role === 'Manager' && (
          <div className="detail-section">
            <h3>Manager Income (Vansun)</h3>
            {(() => {
              const selectedReportWithJewelry = {
                ...selectedReport,
                jewelry: selectedReport.jewelry || [],
                adjustedServicePrice: selectedReport.adjustedServicePrice || selectedReport.servicePrice,
                adjustedJewelryPrice: selectedReport.adjustedJewelryPrice || selectedReport.jewelryPrice
              };
              const managerIncome = calculateEmployeeIncome(selectedReportWithJewelry, 'manager');
              return (
                <div className="manager-income-breakdown">
                  {selectedReport.customPrice > 0 && (
                    <div className="income-item custom-note">
                      <span>Income based on Custom Price distribution</span>
                    </div>
                  )}
                  <div className="income-item">
                    <span>Service Amount (50%):</span>
                    <span>${(managerIncome?.serviceIncome || 0).toFixed(2)}</span>
                  </div>
                  <div className="income-item">
                    <span>Jewelry Income (After Reductions & Cuts):</span>
                    <span>${(managerIncome?.jewelryIncome || 0).toFixed(2)}</span>
                  </div>
                  <div className="income-item">
                    <span>After Care Income (Full profit):</span>
                    <span>${(managerIncome?.afterCareIncome || 0).toFixed(2)}</span>
                  </div>
                  {(managerIncome?.tipIncome || 0) > 0 && (
                    <div className="income-item">
                      <span>Tips:</span>
                      <span>${(managerIncome?.tipIncome || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="income-item total">
                    <span>Total Manager Income:</span>
                    <span>${(managerIncome?.totalIncome || 0).toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Oscar's Income (for Manager/Supervisor) */}
        {canViewAllReports(currentUser?.role) && (
          <div className="detail-section">
            <h3>Oscar's Income</h3>
            {(() => {
              const selectedReportWithJewelry = {
                ...selectedReport,
                jewelry: selectedReport.jewelry || [],
                adjustedServicePrice: selectedReport.adjustedServicePrice || selectedReport.servicePrice,
                adjustedJewelryPrice: selectedReport.adjustedJewelryPrice || selectedReport.jewelryPrice
              };
              const oscarIncome = calculateOscarIncome(selectedReportWithJewelry);
              return (
                <div className="oscar-income-breakdown">
                  {selectedReport.customPrice > 0 && (
                    <div className="income-item custom-note">
                      <span>Income based on Custom Price distribution</span>
                    </div>
                  )}
                  <div className="income-item">
                    <span>Service Amount (50%):</span>
                    <span>${(oscarIncome?.serviceIncome || 0).toFixed(2)}</span>
                  </div>
                  <div className="income-item">
                    <span>Jewelry Amount (3%):</span>
                    <span>${(oscarIncome?.jewelryIncome || 0).toFixed(2)}</span>
                  </div>
                  <div className="income-item">
                    <span>After Care Income (3% of profit):</span>
                    <span>${(oscarIncome?.afterCareIncome || 0).toFixed(2)}</span>
                  </div>
                  <div className="income-item total">
                    <span>Total Oscar's Income:</span>
                    <span>${(oscarIncome?.totalIncome || 0).toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Vansun Income (for Manager/Supervisor) */}
        {canViewAllReports(currentUser?.role) && (
          <div className="detail-section">
            <h3>Vansun Income</h3>
            {(() => {
              const selectedReportWithJewelry = {
                ...selectedReport,
                jewelry: selectedReport.jewelry || [],
                adjustedServicePrice: selectedReport.adjustedServicePrice || selectedReport.servicePrice,
                adjustedJewelryPrice: selectedReport.adjustedJewelryPrice || selectedReport.jewelryPrice
              };
              const vansunIncome = calculateVansunIncome(selectedReportWithJewelry);
              return (
                <div className="vansun-income-breakdown">
                  {selectedReport.customPrice > 0 && (
                    <div className="income-item custom-note">
                      <span>Income based on Custom Price distribution</span>
                    </div>
                  )}
                  <div className="income-item">
                    <span>Service Income (50%):</span>
                    <span>${(vansunIncome?.serviceIncome || 0).toFixed(2)}</span>
                  </div>
                  <div className="income-item">
                    <span>Jewelry Income (After Reductions & Cuts):</span>
                    <span>${(vansunIncome?.jewelryIncome || 0).toFixed(2)}</span>
                  </div>
                  <div className="income-item">
                    <span>After Care Income (Full profit):</span>
                    <span>${(vansunIncome?.afterCareIncome || 0).toFixed(2)}</span>
                  </div>
                  {(vansunIncome?.tipIncome || 0) > 0 && (
                    <div className="income-item">
                      <span>Tips:</span>
                      <span>${(vansunIncome?.tipIncome || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="income-item total">
                    <span>Total Vansun Income:</span>
                    <span>${(vansunIncome?.totalIncome || 0).toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {selectedReport.notes && (
          <div className="detail-section">
            <h3>Notes</h3>
            <p className="notes">{selectedReport.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetails; 