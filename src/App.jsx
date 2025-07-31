import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Main Pages
import Home from './pages/Home';
import BookNow from './pages/BookNow';
import BookingPage from './pages/‌BookingPage';
import Gallery from './pages/Gallery';

// Components
import TermsAndConditions from './components/TermsAndConditions';
import ConsentForm from './components/ConsentForm';

// Blog Pages
import Blog from './pages/blog/Blog';
import BlogPost from './pages/blog/BlogPost';

// Staff Pages
import Login from './pages/staff/Login';
import Dashboard from './pages/staff/Dashboard';
import SalesReport from './pages/staff/SalesReport';
import ViewReports from './pages/staff/ViewReports';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import CreateUser from './pages/admin/CreateUser';
import ManageUsers from './pages/admin/ManageUsers';

// Route Protection Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Styles
import './styles/main.scss';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/booknow" element={<BookNow />} />
        <Route path="/booking/:productId" element={<BookingPage />} />
        <Route path="/gallery/:id" element={<Gallery />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/consent-form/:type" element={<ConsentForm />} />
        
        {/* Blog Routes */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:category" element={<Blog />} />
        <Route path="/blog/post/:slug" element={<BlogPost />} />
        
        {/* Staff Routes */}
        <Route path="/staff/login" element={<Login />} />
        <Route path="/staff/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/staff/sales-report" element={<ProtectedRoute><SalesReport /></ProtectedRoute>} />
        <Route path="/staff/view-reports" element={<ProtectedRoute><ViewReports /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/users/create" element={<AdminProtectedRoute><CreateUser /></AdminProtectedRoute>} />
        <Route path="/admin/users/manage" element={<AdminProtectedRoute><ManageUsers /></AdminProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
