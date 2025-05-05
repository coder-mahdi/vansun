import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BookNow from './pages/BookNow';
import BookingPage from './pages/‌BookingPage';
import Gallery from './pages/Gallery';
import './styles/main.scss';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/BookNow" element={<BookNow />} />
        <Route path="/booking/:productId" element={<BookingPage />} />
        <Route path="/gallery/:id" element={<Gallery />} />
      </Routes>
    </Router>
  )
}

export default App
