import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ComingSoon from './pages/ComingSoon';
import Home from './pages/Home';
import BookNow from './pages/BookNow';
import BookingPage from './pages/‌BookingPage';
import Gallery from './pages/Gallery';
import './styles/main.scss';

function App() {

  return (

    <Router basename="/">

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/" element={<ComingSoon />} />
        <Route path="/BookNow" element={<BookNow />} />
        <Route path="/booking/:productId" element={<BookingPage />} />
        <Route path="/gallery/:id" element={<Gallery />} />
      </Routes>

    </Router>
 
  )
}

export default App
