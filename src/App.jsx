import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BookNow from './pages/BookNow';
import BookingPage from './pages/‌BookingPage';
import Gallery from './pages/Gallery';
import TermsAndConditions from './components/TermsAndConditions';
import ConsentForm from './components/ConsentForm';
import Blog from './pages/blog/Blog';
import BlogPost from './pages/blog/BlogPost';
import Login from './pages/staff/Login';
import Dashboard from './pages/staff/Dashboard';

import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import CreateUser from './pages/admin/CreateUser';
import './styles/main.scss';

function App() {
  return (
    <Router>
      <Routes>
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
        <Route path="/staff/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/users/create" element={
          <AdminProtectedRoute>
            <CreateUser />
          </AdminProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
