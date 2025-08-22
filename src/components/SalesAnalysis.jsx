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
    
    // Helper function to get date in Vancouver timezone
    const getVancouverDate = (dateString) => {
      const date = new Date(dateString);
      return new Date(date.toLocaleString("en-US", { timeZone: "America/Vancouver" }));
    };
    
    // Helper function to compare dates by date only (ignoring time)
    const isSameDate = (date1, date2) => {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      return d1.getFullYear() === d2.getFullYear() && 
             d1.getMonth() === d2.getMonth() && 
             d1.getDate() === d2.getDate();
    };
    
    // Helper function to format date as YYYY-MM-DD for comparison
    const formatDateAsString = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    if (analysisType === 'daily') {
      // Filter by specific date
      if (selectedDate) {
        console.log('Daily analysis - Selected date:', selectedDate);
        console.log('Total reports to filter:', filteredReports.length);
        
        filteredData = filteredReports.filter(report => {
          // For reports stored with toLocaleString, we need to parse them differently
          let reportDateStr;
          
          if (typeof report.date === 'string') {
            // If date is stored as locale string (e.g., "8/19/2024, 3:30:00 PM")
            if (report.date.includes(',')) {
              // Parse locale string format
              const [datePart] = report.date.split(',');
              const dateObj = new Date(datePart);
              reportDateStr = formatDateAsString(dateObj);
            } else {
              // Parse ISO string or other format
              const dateObj = new Date(report.date);
              reportDateStr = formatDateAsString(dateObj);
            }
          } else {
            // If date is already a Date object
            reportDateStr = formatDateAsString(report.date);
          }
          
          const isMatch = reportDateStr === selectedDate;
          
          console.log('=== Date Comparison Debug ===');
          console.log('Original report date:', report.date);
          console.log('Report date type:', typeof report.date);
          console.log('Formatted report date:', reportDateStr);
          console.log('Selected date:', selectedDate);
          console.log('Is match:', isMatch);
          console.log('============================');
          
          return isMatch;
        });
        
        console.log('Filtered reports count:', filteredData.length);
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
      if (dateRange && dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        
        filteredData = filteredReports.filter(report => {
          const reportDate = new Date(report.date);
          return reportDate >= startDate && reportDate <= endDate;
        });
      } else if (selectedDate) {
        // For monthly analysis, selectedDate is in format "YYYY-MM-01"
        // Create selectedDateObj in local timezone to avoid timezone issues
        const [year, month] = selectedDate.split('-');
        const selectedDateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
        
        console.log('=== MONTHLY ANALYSIS DEBUG ===');
        console.log('Selected Date:', selectedDate);
        console.log('Selected Date Object (Local):', selectedDateObj);
        console.log('Selected Date Month:', selectedDateObj.getMonth());
        console.log('Total reports to filter:', filteredReports.length);
        
        filteredData = filteredReports.filter(report => {
          let reportDate;
          
          // Handle different date formats
          if (typeof report.date === 'string') {
            if (report.date.includes(',')) {
              // Parse locale string format
              const [datePart] = report.date.split(',');
              reportDate = new Date(datePart);
            } else {
              // Parse ISO string or other format
              reportDate = new Date(report.date);
            }
          } else {
            reportDate = new Date(report.date);
          }
          
          // Simple comparison: check if year and month match
          const reportYear = reportDate.getFullYear();
          const reportMonth = reportDate.getMonth();
          const selectedYear = selectedDateObj.getFullYear();
          const selectedMonth = selectedDateObj.getMonth();
          
          const isInMonth = reportYear === selectedYear && reportMonth === selectedMonth;
          console.log('Report:', report.date, '-> Parsed Date:', reportDate, '-> Year:', reportYear, 'Month:', reportMonth, 'Selected Year:', selectedYear, 'Selected Month:', selectedMonth, 'Match:', isInMonth);
          
          return isInMonth;
        });
        
        console.log('Filtered reports count:', filteredData.length);
        console.log('=== END MONTHLY DEBUG ===');
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
  
  // Get the filtered data for income calculations
  const getFilteredDataForIncome = () => {
    let filteredData = filteredReports;
    
    // Helper function to format date as YYYY-MM-DD for comparison
    const formatDateAsString = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    if (analysisType === 'daily') {
      if (selectedDate) {
        filteredData = filteredReports.filter(report => {
          let reportDateStr;
          
          if (typeof report.date === 'string') {
            if (report.date.includes(',')) {
              const [datePart] = report.date.split(',');
              const dateObj = new Date(datePart);
              reportDateStr = formatDateAsString(dateObj);
            } else {
              const dateObj = new Date(report.date);
              reportDateStr = formatDateAsString(dateObj);
            }
          } else {
            reportDateStr = formatDateAsString(report.date);
          }
          
          return reportDateStr === selectedDate;
        });
      }
    } else if (analysisType === 'weekly') {
      if (dateRange && dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        
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
      }
    } else if (analysisType === 'monthly') {
      if (dateRange && dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        
        filteredData = filteredReports.filter(report => {
          const reportDate = new Date(report.date);
          return reportDate >= startDate && reportDate <= endDate;
        });
      } else if (selectedDate) {
        // For monthly analysis, selectedDate is in format "YYYY-MM-01"
        // Create selectedDateObj in local timezone to avoid timezone issues
        const [year, month] = selectedDate.split('-');
        const selectedDateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
        
        filteredData = filteredReports.filter(report => {
          let reportDate;
          
          // Handle different date formats
          if (typeof report.date === 'string') {
            if (report.date.includes(',')) {
              // Parse locale string format
              const [datePart] = report.date.split(',');
              reportDate = new Date(datePart);
            } else {
              // Parse ISO string or other format
              reportDate = new Date(report.date);
            }
          } else {
            reportDate = new Date(report.date);
          }
          
          // Simple comparison: check if year and month match
          const reportYear = reportDate.getFullYear();
          const reportMonth = reportDate.getMonth();
          const selectedYear = selectedDateObj.getFullYear();
          const selectedMonth = selectedDateObj.getMonth();
          
          return reportYear === selectedYear && reportMonth === selectedMonth;
        });
      }
    }

    // For Staff users, only show their own sales data
    if (currentUser?.role === 'Staff') {
      filteredData = filteredData.filter(report => report.staffMember === currentUser.username);
    }
    
    return filteredData;
  };
  
  const filteredDataForIncome = getFilteredDataForIncome();
  
  // Calculate total incomes for analysis using filtered data
  const totalStaffIncome = filteredDataForIncome.reduce((sum, report) => {
    // Check if the staff member is a manager
    const isManager = report.staffRole === 'Manager';
    const income = calculateEmployeeIncome(report, isManager ? 'manager' : 'staff');
    return sum + (income?.totalIncome || 0);
  }, 0);
  
  const totalOscarIncome = filteredDataForIncome.reduce((sum, report) => {
    const income = calculateOscarIncome(report);
    return sum + (income?.totalIncome || 0);
  }, 0);
  
  // Calculate Vansun income differently based on staff roles
  const totalVansunIncome = filteredDataForIncome.reduce((sum, report) => {
    const isManager = report.staffRole === 'Manager';
    
    if (isManager) {
      // If staff is manager, Vansun income is the same as manager income
      const income = calculateEmployeeIncome(report, 'manager');
      return sum + (income?.totalIncome || 0);
    } else {
      // If staff is not manager, calculate Vansun income normally
      const income = calculateVansunIncome(report);
      return sum + (income?.totalIncome || 0);
    }
  }, 0);

  // For Staff users, only calculate their own income
  const currentUserIncome = currentUser?.role === 'Staff' ? 
    filteredDataForIncome
      .filter(report => report.staffMember === currentUser.username)
      .reduce((sum, report) => {
        const isManager = report.staffRole === 'Manager';
        const income = calculateEmployeeIncome(report, isManager ? 'manager' : 'staff');
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
              {/* Daily Analysis - Only single date */}
              {analysisType === 'daily' && (
                <div className="single-date-control">
                  <label>Select Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setDateRange({ start: '', end: '' }); // Reset date range
                    }}
                    className="date-picker"
                  />
                </div>
              )}
              
              {/* Weekly Analysis - Only date range with 7-day limit */}
              {analysisType === 'weekly' && (
                <div className="date-range-control">
                  <label>Select Week (7 days):</label>
                  <div className="date-range-inputs">
                    <input
                      type="date"
                      value={dateRange?.start || ''}
                      onChange={(e) => {
                        const startDate = e.target.value;
                        if (startDate) {
                          // Calculate end date (7 days later)
                          const endDate = new Date(startDate);
                          endDate.setDate(endDate.getDate() + 6);
                          const endDateStr = endDate.toISOString().split('T')[0];
                          setDateRange({ start: startDate, end: endDateStr });
                        } else {
                          setDateRange({ start: '', end: '' });
                        }
                        setSelectedDate(''); // Reset single date
                      }}
                      className="date-picker"
                      placeholder="Start Date"
                    />
                    <span className="date-range-separator">to</span>
                    <input
                      type="date"
                      value={dateRange?.end || ''}
                      disabled
                      className="date-picker disabled"
                      placeholder="End Date (Auto-calculated)"
                    />
                  </div>
                </div>
              )}
              
              {/* Monthly Analysis - Only month selection */}
              {analysisType === 'monthly' && (
                <div className="month-control">
                  <label>Select Month:</label>
                  <input
                    type="month"
                    value={selectedDate ? selectedDate.substring(0, 7) : ''}
                    onChange={(e) => {
                      const monthValue = e.target.value;
                      console.log('Month input changed:', monthValue);
                      console.log('Current selectedDate before change:', selectedDate);
                      if (monthValue) {
                        // Set to first day of selected month
                        const selectedMonthDate = monthValue + '-01';
                        console.log('Setting selectedDate to:', selectedMonthDate);
                        setSelectedDate(selectedMonthDate);
                      } else {
                        setSelectedDate('');
                      }
                      setDateRange({ start: '', end: '' }); // Reset date range
                    }}
                    className="date-picker"
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        {(selectedDate || (dateRange?.start && dateRange?.end)) && (
          <div className="selected-date-info">
            <span>
              {analysisType === 'daily' && selectedDate && (() => {
                console.log('Displaying date:', selectedDate);
                return `Showing reports for ${selectedDate}`;
              })()}
              {analysisType === 'weekly' && selectedDate && `Showing reports for week of ${selectedDate}`}
              {analysisType === 'monthly' && selectedDate && (() => {
                // Create date in local timezone to avoid timezone issues
                const [year, month] = selectedDate.split('-');
                const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
                return `Showing reports for ${dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`;
              })()}
              {(analysisType === 'weekly' || analysisType === 'monthly') && dateRange?.start && dateRange?.end && 
                `Showing reports from ${dateRange.start} to ${dateRange.end}`
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
                {/* Check if there are any manager reports */}
                {(() => {
                  const hasManagerReports = filteredDataForIncome.some(report => report.staffRole === 'Manager');
                  const hasStaffReports = filteredDataForIncome.some(report => report.staffRole !== 'Manager');
                  
                  return (
                    <>
                      {/* Show Staff Income only if there are non-manager staff reports */}
                      {hasStaffReports && (
                        <div className="table-row">
                          <span>Staff Income</span>
                          <span></span>
                          <span>${(filteredDataForIncome
                            .filter(report => report.staffRole !== 'Manager')
                            .reduce((sum, report) => {
                              const income = calculateEmployeeIncome(report, 'staff');
                              return sum + (income?.totalIncome || 0);
                            }, 0) || 0).toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="table-row">
                        <span>Oscar's Income</span>
                        <span></span>
                        <span>${(totalOscarIncome || 0).toFixed(2)}</span>
                      </div>
                      
                      {/* Show Vansun Income - this includes manager income */}
                      <div className="table-row">
                        <span>Vansun Income</span>
                        <span></span>
                        <span>${(totalVansunIncome || 0).toFixed(2)}</span>
                      </div>
                      
                      <div className="table-footer">
                        <span>Total Income:</span>
                        <span></span>
                        <span>${((hasStaffReports ? filteredDataForIncome
                          .filter(report => report.staffRole !== 'Manager')
                          .reduce((sum, report) => {
                            const income = calculateEmployeeIncome(report, 'staff');
                            return sum + (income?.totalIncome || 0);
                          }, 0) : 0) + (totalOscarIncome || 0) + (totalVansunIncome || 0)).toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalysis; 