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
  // Timezone-safe date helpers
  const toYMDInVancouver = (dateLike) => {
    if (!dateLike) return '';

    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Vancouver',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const dateObj = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (Number.isNaN(dateObj.getTime())) {
      return '';
    }

    const parts = formatter.formatToParts(dateObj);
    const getPart = (type) => parts.find((part) => part.type === type)?.value ?? '';

    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');

    if (!year || !month || !day) {
      return '';
    }

    return `${year}-${month}-${day}`;
  };

  // Never use new Date(isoDate) directly for YYYY-MM-DD inputs
  const fromYMDLocal = (ymd) => {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d); // local time
  };

  // Parse report date (both ISO and locale-string with comma)
  const normalizeReportYMD = (report) => {
    let raw = report.date;
    if (typeof raw === 'string' && raw.includes(',')) {
      // "8/19/2024, 3:30:00 PM" -> only date part
      raw = raw.split(',')[0];
    }
    return toYMDInVancouver(raw);
  };

  // Build 7-day array from a YMD (without 24h to avoid DST)
  const buildWeekYMDs = (startYMD) => {
    const start = fromYMDLocal(startYMD);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      days.push(toYMDInVancouver(d));
    }
    return days;
  };

  // Range comparison based on YMD string (safe and consistent)
  const inYmdRange = (ymd, startYMD, endYMD) => {
    return ymd >= startYMD && ymd <= endYMD;
  };

  const getAnalysisData = () => {
    let filteredData = filteredReports;
    
    if (analysisType === 'daily') {
      // Filter by specific date
      if (selectedDate) {
        filteredData = filteredReports.filter(report => 
          normalizeReportYMD(report) === selectedDate
        );
      }
      // If no date selected, show all data (for daily analysis)
    } else if (analysisType === 'weekly') {
      // Filter by specific week or date range
      if (dateRange && dateRange.start && dateRange.end) {
        const startYMD = dateRange.start;      // "YYYY-MM-DD"
        const endYMD = dateRange.end;          // "YYYY-MM-DD"
        filteredData = filteredReports.filter(report => {
          const ymd = normalizeReportYMD(report);
          return inYmdRange(ymd, startYMD, endYMD);
        });
      } else if (selectedDate) {
        // For weekly analysis, get reports for exactly 7 days starting from selected date
        const week = buildWeekYMDs(selectedDate); // 7 Vancouver dates
        filteredData = filteredReports.filter(report => 
          week.includes(normalizeReportYMD(report))
        );
      }
      // If no date selected, show all data (for weekly analysis)
    } else if (analysisType === 'monthly') {
      if (dateRange && dateRange.start && dateRange.end) {
        const startYMD = dateRange.start;
        const endYMD = dateRange.end;
        filteredData = filteredReports.filter(report => {
          const ymd = normalizeReportYMD(report);
          return inYmdRange(ymd, startYMD, endYMD);
        });
      } else if (selectedDate) {
        // For monthly analysis, selectedDate is in format "YYYY-MM-01"
        const [sy, sm] = selectedDate.split('-').map(Number); // selectedDate: "YYYY-MM-01"
        filteredData = filteredReports.filter(report => {
          const [ry, rm] = normalizeReportYMD(report).split('-').map(Number);
          return ry === sy && rm === sm;
        });
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
      const svcCount = report.services.length || 0;
      report.services.forEach(service => {
        if (service.name) {
          if (!serviceAnalysis[service.name]) {
            serviceAnalysis[service.name] = { quantity: 0, amount: 0 };
          }
          const qty = service.quantity || 1;
          serviceAnalysis[service.name].quantity += qty;
          if (svcCount > 0) {
            serviceAnalysis[service.name].amount += qty * (report.servicePrice / svcCount);
          }
        }
      });

      // Jewelry analysis
      const jewCount = report.jewelry.length || 0;
      report.jewelry.forEach(jewelry => {
        if (jewelry.name) {
          if (!jewelryAnalysis[jewelry.name]) {
            jewelryAnalysis[jewelry.name] = { quantity: 0, amount: 0 };
          }
          const qty = jewelry.quantity || 1;
          jewelryAnalysis[jewelry.name].quantity += qty;
          if (jewCount > 0) {
            jewelryAnalysis[jewelry.name].amount += qty * (report.jewelryPrice / jewCount);
          }
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
    
    if (analysisType === 'daily') {
      if (selectedDate) {
        filteredData = filteredReports.filter(report => 
          normalizeReportYMD(report) === selectedDate
        );
      }
    } else if (analysisType === 'weekly') {
      if (dateRange && dateRange.start && dateRange.end) {
        const startYMD = dateRange.start;      // "YYYY-MM-DD"
        const endYMD = dateRange.end;          // "YYYY-MM-DD"
        filteredData = filteredReports.filter(report => {
          const ymd = normalizeReportYMD(report);
          return inYmdRange(ymd, startYMD, endYMD);
        });
      } else if (selectedDate) {
        // For weekly analysis, get reports for exactly 7 days starting from selected date
        const week = buildWeekYMDs(selectedDate); // 7 Vancouver dates
        filteredData = filteredReports.filter(report => 
          week.includes(normalizeReportYMD(report))
        );
      }
      // If no date selected, show all data (for weekly analysis)
    } else if (analysisType === 'monthly') {
      if (dateRange && dateRange.start && dateRange.end) {
        const startYMD = dateRange.start;
        const endYMD = dateRange.end;
        filteredData = filteredReports.filter(report => {
          const ymd = normalizeReportYMD(report);
          return inYmdRange(ymd, startYMD, endYMD);
        });
      } else if (selectedDate) {
        // For monthly analysis, selectedDate is in format "YYYY-MM-01"
        const [sy, sm] = selectedDate.split('-').map(Number); // selectedDate: "YYYY-MM-01"
        filteredData = filteredReports.filter(report => {
          const [ry, rm] = normalizeReportYMD(report).split('-').map(Number);
          return ry === sy && rm === sm;
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
                        const startDate = e.target.value; // "YYYY-MM-DD"
                        if (startDate) {
                          const endLocal = fromYMDLocal(startDate);
                          endLocal.setDate(endLocal.getDate() + 6);
                          const endDateStr = toYMDInVancouver(endLocal); // 🔒 without UTC
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
                        
                        // Debug: Check what month this represents
                        const [year, month] = selectedMonthDate.split('-');
                        const debugDate = new Date(parseInt(year), parseInt(month) - 1, 1);
                        console.log('Debug - Year:', year, 'Month:', month, 'Month Name:', debugDate.toLocaleString('en-US', { month: 'long' }));
                        
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
              {analysisType === 'weekly' && selectedDate && (() => {
                const startYMD = selectedDate; // "YYYY-MM-DD"
                const endLocal = fromYMDLocal(startYMD);
                endLocal.setDate(endLocal.getDate() + 6);
                const endYMD = toYMDInVancouver(endLocal);
                return `Showing reports for 7 days: ${startYMD} to ${endYMD}`;
              })()}
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
            {Object.entries(serviceAnalysis)
              .filter(([service]) => service !== 'No Service')
              .map(([service, data]) => (
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
            {Object.entries(jewelryAnalysis)
              .filter(([jewelry]) => jewelry !== 'No Jewelry')
              .map(([jewelry, data]) => (
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