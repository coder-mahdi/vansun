import React from 'react';
import { BrowserRouter as Router, Route, Routes  } from 'react-router-dom';
import Home from './pages/Home';
import BookNow from './pages/BookNow';
import BookingPage from './pages/‌BookingPage';
import BookingsList from './pages/BookingsList';

function App() {

  return (

    <Router basename="/">

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/BookNow" element={<BookNow />} />
        <Route path="/booking/:productId" element={<BookingPage />} />
        <Route path="/bookings" element={<BookingsList />} />
    
      </Routes>

    </Router>
 
  )
}

export default App
