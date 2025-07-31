import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';
import { getAllStaffUsers, canViewAllReports } from '../../utils/userManagement';
import { 
  calculateEmployeeIncome, 
  calculateOscarIncome, 
  calculateManagerIncome,
  calculateVansunIncome 
} from '../../utils/salesData';
import Layout from '../../layout/Layout';

const ViewReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [analysisType, setAnalysisType] = useState('weekly');
  const [currentUser] = useState(getCurrentUser());
  const [staffUsers, setStaffUsers] = useState([]);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('all');
  const [showOscarIncome, setShowOscarIncome] = useState(false);
  const [showVansunIncome, setShowVansunIncome] = useState(false);

  useEffect(() => {
    loadReports();
    loadStaffUsers();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, selectedStaffFilter]);

  const loadReports = () => {
    const storedReports = JSON.parse(localStorage.getItem('salesReports') || '[]');
    setReports(storedReports);
  };

  const loadStaffUsers = () => {
    const users = getAllStaffUsers();
    setStaffUsers(users);
  };

  const filterReports = () => {
    let filtered = reports;
    
    // Filter by staff member if not viewing all
    if (selectedStaffFilter !== 'all') {
      filtered = reports.filter(report => report.staffMember === selectedStaffFilter);
    }
    
    // If current user is Staff, only show their own reports
    if (currentUser?.role === 'Staff') {
      filtered = reports.filter(report => report.staffMember === currentUser.username);
    }
    
    setFilteredReports(filtered);
  };

  const calculateEmployeeIncome = (report) => {
    const serviceAmount = report.servicePrice || 0;
    const jewelryAmount = report.jewelryPrice || 0;
    const tip = report.tip || 0;
    
    // Service amount halved
    const serviceIncome = serviceAmount / 2;
    
    // 5% of jewelry amount
    const jewelryIncome = jewelryAmount * 0.05;
    
    // Tips (if any)
    const tipIncome = tip;
    
    // Total employee income
    const totalIncome = serviceIncome + jewelryIncome + tipIncome;
    
    return {
      serviceIncome,
      jewelryIncome,
      tipIncome,
      totalIncome
    };
  };

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

  const getAnalysisData = () => {
    const now = new Date();
    const currentWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let filteredData = filteredReports;
    
    if (analysisType === 'weekly') {
      filteredData = filteredReports.filter(report => new Date(report.date) >= currentWeek);
    } else if (analysisType === 'monthly') {
      filteredData = filteredReports.filter(report => new Date(report.date) >= currentMonth);
    }

    // For Staff users, only show their own sales data
    if (currentUser?.role === 'Staff') {
      filteredData = filteredData.filter(report => report.staffMember === currentUser.username);
    }

    // Group by service type
    const serviceAnalysis = {};
    const jewelryAnalysis = {};

    filteredData.forEach(report => {
      // Service analysis
      report.services.forEach(service => {
        if (service.name) {
          if (!serviceAnalysis[service.name]) {
            serviceAnalysis[service.name] = { quantity: 0, amount: 0 };
          }
          serviceAnalysis[service.name].quantity += service.quantity || 1;
          serviceAnalysis[service.name].amount += (service.quantity || 1) * (report.servicePrice / report.services.length);
        }
      });

      // Jewelry analysis
      report.jewelry.forEach(jewelry => {
        if (jewelry.name) {
          if (!jewelryAnalysis[jewelry.name]) {
            jewelryAnalysis[jewelry.name] = { quantity: 0, amount: 0 };
          }
          jewelryAnalysis[jewelry.name].quantity += jewelry.quantity || 1;
          jewelryAnalysis[jewelry.name].amount += (jewelry.quantity || 1) * (report.jewelryPrice / report.jewelry.length);
        }
      });
    });

    return { serviceAnalysis, jewelryAnalysis };
  };

  const { serviceAnalysis, jewelryAnalysis } = getAnalysisData();

  const totalServiceAmount = Object.values(serviceAnalysis).reduce((sum, item) => sum + item.amount, 0);
  const totalJewelryAmount = Object.values(jewelryAnalysis).reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate total incomes for analysis
  const totalStaffIncome = filteredReports.reduce((sum, report) => {
    const income = calculateEmployeeIncome(report);
    return sum + income.totalIncome;
  }, 0);
  
  const totalOscarIncome = filteredReports.reduce((sum, report) => {
    const income = calculateOscarIncome(report);
    return sum + income.totalIncome;
  }, 0);
  
  const totalVansunIncome = filteredReports.reduce((sum, report) => {
    const income = calculateVansunIncome(report);
    return sum + income.vansunIncome;
  }, 0);

  // For Staff users, only calculate their own income
  const currentUserIncome = currentUser?.role === 'Staff' ? 
    filteredReports
      .filter(report => report.staffMember === currentUser.username)
      .reduce((sum, report) => {
        const income = calculateEmployeeIncome(report);
        return sum + income.totalIncome;
      }, 0) : 0;

  return (
    <Layout>
      <div className="view-reports-container">
        <div className="reports-header">
          <div className="header-content">
            <h1>Sales Reports</h1>
            <p>View and analyze sales reports</p>
          </div>
          <Link to="/staff/dashboard" className="back-to-dashboard">
            ← Back to Staff Dashboard
          </Link>
        </div>

        <div className="reports-content">
          {/* Reports List */}
          <div className="reports-list">
            <h2>Recent Reports</h2>
            
            {/* Filters for Manager/Supervisor */}
            {canViewAllReports(currentUser?.role) && (
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
            )}
            
            <div className="reports-grid">
              {filteredReports.map((report) => {
                const employeeIncome = calculateEmployeeIncome(report);
                const oscarIncome = showOscarIncome ? calculateOscarIncome(report) : null;
                const vansunIncome = showVansunIncome ? calculateVansunIncome(report) : null;
                const managerIncome = currentUser?.role === 'Manager' ? calculateManagerIncome(report) : null;
                
                return (
                  <div 
                    key={report.id} 
                    className={`report-card ${selectedReport?.id === report.id ? 'selected' : ''}`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="report-header">
                      <h3>{report.customerName || 'Anonymous Customer'}</h3>
                      <span className="report-date">{formatDate(report.date)}</span>
                    </div>
                    
                    <div className="report-summary">
                      <div className="summary-item">
                        <span>Services:</span>
                        <span>${report.servicePrice?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="summary-item">
                        <span>Jewelry:</span>
                        <span>${report.jewelryPrice?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="summary-item">
                        <span>Total:</span>
                        <span>${report.afterTax?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="summary-item">
                        <span>Payment:</span>
                        <span>{report.paymentMethod || 'Cash'}</span>
                      </div>
                      {currentUser?.role === 'Staff' && (
                        <div className="summary-item employee-income">
                          <span>Employee Income:</span>
                          <span>${employeeIncome.totalIncome.toFixed(2)}</span>
                        </div>
                      )}
                      
                      {currentUser?.role === 'Manager' && managerIncome && (
                        <div className="summary-item manager-income">
                          <span>Manager Income:</span>
                          <span>${managerIncome.totalIncome.toFixed(2)}</span>
                        </div>
                      )}
                      
                      {oscarIncome && (
                        <div className="summary-item oscar-income">
                          <span>Oscar's Income:</span>
                          <span>${oscarIncome.totalIncome.toFixed(2)}</span>
                        </div>
                      )}
                      
                      {vansunIncome && (
                        <div className="summary-item vansun-income">
                          <span>Vansun Income:</span>
                          <span>${vansunIncome.vansunIncome.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Report Details */}
          {selectedReport && (
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
                        <span>{service.name}</span>
                        <span>Qty: {service.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Jewelry</h3>
                  <div className="jewelry-list">
                    {selectedReport.jewelry.map((jewelry, index) => (
                      <div key={index} className="jewelry-item">
                        <span>{jewelry.name}</span>
                        <span>Qty: {jewelry.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Pricing Breakdown</h3>
                  <div className="pricing-breakdown">
                    <div className="price-item">
                      <span>Service Amount:</span>
                      <span>${selectedReport.servicePrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="price-item">
                      <span>Jewelry Amount:</span>
                      <span>${selectedReport.jewelryPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    {selectedReport.customPrice > 0 && (
                      <div className="price-item">
                        <span>Custom Price:</span>
                        <span>${selectedReport.customPrice.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedReport.tip > 0 && (
                      <div className="price-item">
                        <span>Tip:</span>
                        <span>${selectedReport.tip.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="price-item">
                      <span>Before Tax:</span>
                      <span>${selectedReport.beforeTax?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="price-item total">
                      <span>After Tax (12%):</span>
                      <span>${selectedReport.afterTax?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>

                {currentUser?.role === 'Staff' && (
                  <div className="detail-section">
                    <h3>Employee Income</h3>
                    {(() => {
                      const employeeIncome = calculateEmployeeIncome(selectedReport);
                      return (
                        <div className="employee-income-breakdown">
                          <div className="income-item">
                            <span>Service Amount (50%):</span>
                            <span>${employeeIncome.serviceIncome.toFixed(2)}</span>
                          </div>
                          <div className="income-item">
                            <span>Jewelry Amount (5%):</span>
                            <span>${employeeIncome.jewelryIncome.toFixed(2)}</span>
                          </div>
                          {employeeIncome.tipIncome > 0 && (
                            <div className="income-item">
                              <span>Tips:</span>
                              <span>${employeeIncome.tipIncome.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="income-item total">
                            <span>Total Employee Income:</span>
                            <span>${employeeIncome.totalIncome.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {currentUser?.role === 'Manager' && (
                  <div className="detail-section">
                    <h3>Manager Income</h3>
                    {(() => {
                      const managerIncome = calculateManagerIncome(selectedReport);
                      return (
                        <div className="manager-income-breakdown">
                          <div className="income-item">
                            <span>Jewelry Cost (minus reductions):</span>
                            <span>${managerIncome.jewelryCost.toFixed(2)}</span>
                          </div>
                          {managerIncome.tip > 0 && (
                            <div className="income-item">
                              <span>Tips:</span>
                              <span>${managerIncome.tip.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="income-item total">
                            <span>Total Manager Income:</span>
                            <span>${managerIncome.totalIncome.toFixed(2)}</span>
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
                      const oscarIncome = calculateOscarIncome(selectedReport);
                      return (
                        <div className="oscar-income-breakdown">
                          <div className="income-item">
                            <span>Service Amount (50%):</span>
                            <span>${oscarIncome.serviceIncome.toFixed(2)}</span>
                          </div>
                          <div className="income-item">
                            <span>Jewelry Amount (5%):</span>
                            <span>${oscarIncome.jewelryIncome.toFixed(2)}</span>
                          </div>
                          {oscarIncome.tipIncome > 0 && (
                            <div className="income-item">
                              <span>Tips:</span>
                              <span>${oscarIncome.tipIncome.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="income-item total">
                            <span>Total Oscar's Income:</span>
                            <span>${oscarIncome.totalIncome.toFixed(2)}</span>
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
                      const vansunIncome = calculateVansunIncome(selectedReport);
                      return (
                        <div className="vansun-income-breakdown">
                          <div className="income-item">
                            <span>Total Jewelry Amount:</span>
                            <span>${vansunIncome.jewelryAmount.toFixed(2)}</span>
                          </div>
                          <div className="income-item">
                            <span>Staff + Oscar Cuts (10%):</span>
                            <span>${vansunIncome.totalCuts.toFixed(2)}</span>
                          </div>
                          <div className="income-item total">
                            <span>Vansun Income (90%):</span>
                            <span>${vansunIncome.vansunIncome.toFixed(2)}</span>
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
          )}

          {/* Analysis Section */}
          <div className="analysis-section">
            <h2>Sales Analysis</h2>
            <div className="analysis-controls">
              <select 
                value={analysisType} 
                onChange={(e) => setAnalysisType(e.target.value)}
                className="analysis-select"
              >
                <option value="weekly">Weekly Analysis</option>
                <option value="monthly">Monthly Analysis</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="analysis-grid">
              {/* Service Analysis */}
              <div className="analysis-card">
                <h3>Service Analysis</h3>
                <div className="analysis-table">
                  <div className="table-header">
                    <span>Service Type</span>
                    <span>Quantity</span>
                    <span>Amount</span>
                  </div>
                  {Object.entries(serviceAnalysis).map(([service, data]) => (
                    <div key={service} className="table-row">
                      <span>{service}</span>
                      <span>{data.quantity}</span>
                      <span>${data.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="table-footer">
                    <span>Total:</span>
                    <span></span>
                    <span>${totalServiceAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Jewelry Analysis */}
              <div className="analysis-card">
                <h3>Jewelry Analysis</h3>
                <div className="analysis-table">
                  <div className="table-header">
                    <span>Jewelry Type</span>
                    <span>Quantity</span>
                    <span>Amount</span>
                  </div>
                  {Object.entries(jewelryAnalysis).map(([jewelry, data]) => (
                    <div key={jewelry} className="table-row">
                      <span>{jewelry}</span>
                      <span>{data.quantity}</span>
                      <span>${data.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="table-footer">
                    <span>Total:</span>
                    <span></span>
                    <span>${totalJewelryAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Income Analysis */}
              <div className="analysis-card">
                <h3>Income Analysis</h3>
                <div className="analysis-table">
                  <div className="table-header">
                    <span>Income Type</span>
                    <span></span>
                    <span>Amount</span>
                  </div>
                  {currentUser?.role === 'Staff' ? (
                    <>
                      <div className="table-row">
                        <span>My Income</span>
                        <span></span>
                        <span>${currentUserIncome.toFixed(2)}</span>
                      </div>
                      <div className="table-footer">
                        <span>Total My Income:</span>
                        <span></span>
                        <span>${currentUserIncome.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="table-row">
                        <span>Staff Income</span>
                        <span></span>
                        <span>${totalStaffIncome.toFixed(2)}</span>
                      </div>
                      <div className="table-row">
                        <span>Oscar's Income</span>
                        <span></span>
                        <span>${totalOscarIncome.toFixed(2)}</span>
                      </div>
                      <div className="table-row">
                        <span>Vansun Income</span>
                        <span></span>
                        <span>${totalVansunIncome.toFixed(2)}</span>
                      </div>
                      <div className="table-footer">
                        <span>Total Income:</span>
                        <span></span>
                        <span>${(totalStaffIncome + totalOscarIncome + totalVansunIncome).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewReports; 