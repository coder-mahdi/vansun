import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';
import { canViewAllReports } from '../../utils/userManagement';
import { getAllStaffUsers, getSalesReports, getSalesReportsByStaff } from '../../utils/wordpressApi';
import Layout from '../../layout/Layout';
import ReportCard from '../../components/ReportCard';
import ReportDetails from '../../components/ReportDetails';
import SalesAnalysis from '../../components/SalesAnalysis';
import ReportFilters from '../../components/ReportFilters';

const SITE_URL = 'https://vansunstudio.com';

const ViewReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [analysisType, setAnalysisType] = useState('weekly');
  const [selectedDate, setSelectedDate] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
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

  const loadReports = async () => {
    try {
      let reportsData;
      
      // Load from WordPress API
      if (currentUser?.role === 'Staff') {
        // Load only current staff's reports
        reportsData = await getSalesReportsByStaff(currentUser.id);
      } else {
        // Load all reports for managers
        reportsData = await getSalesReports();
      }
      
      // If API fails or returns no data, try localStorage as fallback
      if (!reportsData || reportsData.length === 0) {
        console.log('API returned no data, trying localStorage fallback...');
        const localStorageReports = JSON.parse(localStorage.getItem('salesReports') || '[]');
        if (localStorageReports.length > 0) {
          console.log('Found reports in localStorage:', localStorageReports.length);
          reportsData = localStorageReports;
        }
      }
      
      // Calculate afterCarePrice for each report and ensure afterCare is always an array
      if (reportsData) {
        reportsData = reportsData.map(report => {
          let afterCareArr = [];
          if (Array.isArray(report.afterCare)) {
            afterCareArr = report.afterCare;
          } else if (typeof report.afterCare === 'string') {
            try {
              afterCareArr = JSON.parse(report.afterCare);
            } catch {
              afterCareArr = [];
            }
          } else {
            afterCareArr = [];
          }

          let afterCarePrice = 0;
          if (afterCareArr.length > 0) {
            afterCareArr.forEach(afterCare => {
              const quantity = parseInt(afterCare.quantity) || 0;
              if (quantity > 0) {
                afterCarePrice += 15 * quantity; // $15 per item
              }
            });
          }

          // Calculate adjusted amounts for custom price reports
          const servicePrice = parseFloat(report.servicePrice) || 0;
          const jewelryPrice = parseFloat(report.jewelryPrice) || 0;
          const customPrice = parseFloat(report.customPrice) || 0;
          
          let adjustedServicePrice = servicePrice;
          let adjustedJewelryPrice = jewelryPrice;
          let adjustedAfterCarePrice = afterCarePrice;
          
          if (customPrice > 0) {
            const originalTotal = servicePrice + jewelryPrice + afterCarePrice;
            
            if (originalTotal > 0) {
              // Calculate proportional distribution based on original prices
              const serviceRatio = servicePrice / originalTotal;
              const jewelryRatio = jewelryPrice / originalTotal;
              const afterCareRatio = afterCarePrice / originalTotal;
              
              adjustedServicePrice = customPrice * serviceRatio;
              adjustedJewelryPrice = customPrice * jewelryRatio;
              adjustedAfterCarePrice = customPrice * afterCareRatio;
            }
            
            console.log('Custom Price Report:', {
              servicePrice,
              jewelryPrice,
              afterCarePrice,
              customPrice,
              adjustedServicePrice,
              adjustedJewelryPrice,
              adjustedAfterCarePrice
            });
          }
          
          return { 
            ...report, 
            afterCare: afterCareArr, 
            afterCarePrice,
            adjustedServicePrice,
            adjustedJewelryPrice,
            adjustedAfterCarePrice
          };
        });
      }
      
      setReports(reportsData || []);
    } catch (error) {
      console.error('Failed to load reports from API:', error);
      
      // Try localStorage as fallback
      try {
        console.log('Trying localStorage fallback...');
        const localStorageReports = JSON.parse(localStorage.getItem('salesReports') || '[]');
        if (localStorageReports.length > 0) {
          console.log('Found reports in localStorage:', localStorageReports.length);
          setReports(localStorageReports);
        } else {
          setReports([]);
        }
      } catch (localStorageError) {
        console.error('Failed to load from localStorage:', localStorageError);
        setReports([]);
      }
    }
  };

  const loadStaffUsers = async () => {
    try {
      const users = await getAllStaffUsers();
      setStaffUsers(users);
    } catch (error) {
      console.error('Failed to load staff users:', error);
      setStaffUsers([]);
    }
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


  return (
    <Layout>
      <Helmet>
        <title>View Sales Reports | Vansun Studio Staff</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${SITE_URL}/staff/view-reports`} />
      </Helmet>
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
            <ReportFilters
              currentUser={currentUser}
              staffUsers={staffUsers}
              selectedStaffFilter={selectedStaffFilter}
              setSelectedStaffFilter={setSelectedStaffFilter}
              showOscarIncome={showOscarIncome}
              setShowOscarIncome={setShowOscarIncome}
              showVansunIncome={showVansunIncome}
              setShowVansunIncome={setShowVansunIncome}
            />
            
            <div className="reports-grid">
              {filteredReports.length === 0 ? (
                <div className="no-reports">
                  <p>No reports found.</p>
                  <p>Try creating a new sales report first.</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    isSelected={selectedReport?.id === report.id}
                    onSelect={setSelectedReport}
                    currentUser={currentUser}
                    showOscarIncome={showOscarIncome}
                    showVansunIncome={showVansunIncome}
                  />
                ))
              )}
            </div>
          </div>

          {/* Report Details */}
          <ReportDetails 
            selectedReport={selectedReport} 
            currentUser={currentUser} 
          />

          {/* Analysis Section */}
          <SalesAnalysis
            filteredReports={filteredReports}
            analysisType={analysisType}
            setAnalysisType={setAnalysisType}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dateRange={dateRange}
            setDateRange={setDateRange}
            currentUser={currentUser}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ViewReports; 