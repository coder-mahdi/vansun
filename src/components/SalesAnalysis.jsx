import React from 'react';
import { 
  calculateEmployeeIncome, 
  calculateOscarIncome, 
  calculateVansunIncome 
} from '../utils/salesData';

const SalesAnalysis = ({ 
  filteredReports, 
  analysisType, 
  setAnalysisType, 
  currentUser,
  selectedDate,
  setSelectedDate,
  dateRange,
  setDateRange
}) => {
  const getAnalysisData = () => {
    let filteredData = filteredReports;
    
    if (analysisType === 'daily') {
      // Filter by specific date
      if (selectedDate) {
        const selectedDateObj = new Date(selectedDate);
        const startOfDay = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate());
        const endOfDay = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate() + 1);
        
        filteredData = filteredReports.filter(report => {
          const reportDate = new Date(report.date);
          return reportDate >= startOfDay && reportDate < endOfDay;
        });
      }
    } else if (analysisType === 'weekly') {
      // Filter by specific week or date range
      if (dateRange && dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        
        filteredData = filteredReports.filter(report => {
          const reportDate = new Date(report.date);
          return reportDate >= startDate && reportDate <= endDate;
        });
      } else if (selectedDate) {
        const selectedDateObj = new Date(selectedDate);
        const startOfWeek = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate() - selectedDateObj.getDay());
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        filteredData = filteredReports.filter(report => {
          const reportDate = new Date(report.date);
          return reportDate >= startOfWeek && reportDate < endOfWeek;
        });
      } else {
        // Default to current week
        const now = new Date();
        const currentWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        filteredData = filteredReports.filter(report => new Date(report.date) >= currentWeek);
      }
    } else if (analysisType === 'monthly') {
      // Filter by specific month or date range
      if (dateRange && dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        
        filteredData = filteredReports.filter(report => {
          const reportDate = new Date(report.date);
          return reportDate >= startDate && reportDate <= endDate;
        });
      } else if (selectedDate) {
        const selectedDateObj = new Date(selectedDate);
        const startOfMonth = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1);
        const endOfMonth = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth() + 1, 1);
        
        filteredData = filteredReports.filter(report => {
          const reportDate = new Date(report.date);
          return reportDate >= startOfMonth && reportDate < endOfMonth;
        });
      } else {
        // Default to current month
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredData = filteredReports.filter(report => new Date(report.date) >= currentMonth);
      }
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

  const totalServiceAmount = Object.values(serviceAnalysis).reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalJewelryAmount = Object.values(jewelryAnalysis).reduce((sum, item) => sum + (item.amount || 0), 0);
  
  // Calculate total incomes for analysis
  const totalStaffIncome = filteredReports.reduce((sum, report) => {
    const income = calculateEmployeeIncome(report, 'staff');
    return sum + (income?.totalIncome || 0);
  }, 0);
  
  const totalOscarIncome = filteredReports.reduce((sum, report) => {
    const income = calculateOscarIncome(report);
    return sum + (income?.totalIncome || 0);
  }, 0);
  
  const totalVansunIncome = filteredReports.reduce((sum, report) => {
    const income = calculateVansunIncome(report);
    return sum + (income?.totalIncome || 0);
  }, 0);

  // For Staff users, only calculate their own income
  const currentUserIncome = currentUser?.role === 'Staff' ? 
    filteredReports
      .filter(report => report.staffMember === currentUser.username)
      .reduce((sum, report) => {
        const income = calculateEmployeeIncome(report, 'staff');
        return sum + (income?.totalIncome || 0);
      }, 0) : 0;

  return (
    <div className="analysis-section">
      <h2>Sales Analysis</h2>
      <div className="analysis-controls">
        <div className="analysis-control-group">
          <select 
            value={analysisType} 
            onChange={(e) => {
              setAnalysisType(e.target.value);
              setSelectedDate(''); // Reset date when changing analysis type
              setDateRange({ start: '', end: '' }); // Reset date range
            }}
            className="analysis-select"
          >
            <option value="daily">Daily Analysis</option>
            <option value="weekly">Weekly Analysis</option>
            <option value="monthly">Monthly Analysis</option>
            <option value="all">All Time</option>
          </select>
          
          {analysisType !== 'all' && (
            <div className="date-controls">
              <div className="single-date-control">
                <label>Single Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setDateRange({ start: '', end: '' }); // Reset date range when using single date
                  }}
                  className="date-picker"
                />
              </div>
              
              {(analysisType === 'weekly' || analysisType === 'monthly') && (
                <div className="date-range-control">
                  <label>Date Range:</label>
                  <div className="date-range-inputs">
                    <input
                      type="date"
                      value={dateRange?.start || ''}
                      onChange={(e) => {
                        setDateRange(prev => ({ ...prev, start: e.target.value }));
                        setSelectedDate(''); // Reset single date when using date range
                      }}
                      className="date-picker"
                      placeholder="Start Date"
                    />
                    <span className="date-range-separator">to</span>
                    <input
                      type="date"
                      value={dateRange?.end || ''}
                      onChange={(e) => {
                        setDateRange(prev => ({ ...prev, end: e.target.value }));
                        setSelectedDate(''); // Reset single date when using date range
                      }}
                      className="date-picker"
                      placeholder="End Date"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {(selectedDate || (dateRange?.start && dateRange?.end)) && (
          <div className="selected-date-info">
            <span>
              {analysisType === 'daily' && selectedDate && `Showing reports for ${new Date(selectedDate).toLocaleDateString()}`}
              {analysisType === 'weekly' && selectedDate && `Showing reports for week of ${new Date(selectedDate).toLocaleDateString()}`}
              {analysisType === 'monthly' && selectedDate && `Showing reports for ${new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`}
              {(analysisType === 'weekly' || analysisType === 'monthly') && dateRange?.start && dateRange?.end && 
                `Showing reports from ${new Date(dateRange.start).toLocaleDateString()} to ${new Date(dateRange.end).toLocaleDateString()}`
              }
            </span>
          </div>
        )}
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
                <span>${(data.amount || 0).toFixed(2)}</span>
              </div>
            ))}
            <div className="table-footer">
              <span>Total:</span>
              <span></span>
              <span>${(totalServiceAmount || 0).toFixed(2)}</span>
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
                <span>${(data.amount || 0).toFixed(2)}</span>
              </div>
            ))}
            <div className="table-footer">
              <span>Total:</span>
              <span></span>
              <span>${(totalJewelryAmount || 0).toFixed(2)}</span>
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
                  <span>${(currentUserIncome || 0).toFixed(2)}</span>
                </div>
                <div className="table-footer">
                  <span>Total My Income:</span>
                  <span></span>
                  <span>${(currentUserIncome || 0).toFixed(2)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="table-row">
                  <span>Staff Income</span>
                  <span></span>
                  <span>${(totalStaffIncome || 0).toFixed(2)}</span>
                </div>
                <div className="table-row">
                  <span>Oscar's Income</span>
                  <span></span>
                  <span>${(totalOscarIncome || 0).toFixed(2)}</span>
                </div>
                <div className="table-row">
                  <span>Vansun Income</span>
                  <span></span>
                  <span>${(totalVansunIncome || 0).toFixed(2)}</span>
                </div>
                <div className="table-footer">
                  <span>Total Income:</span>
                  <span></span>
                  <span>${((totalStaffIncome || 0) + (totalOscarIncome || 0) + (totalVansunIncome || 0)).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalysis; 