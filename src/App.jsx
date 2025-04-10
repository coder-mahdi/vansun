import React from 'react';
import { BrowserRouter as Router, Route, Routes  } from 'react-router-dom';
import Home from './pages/Home';
import BookNow from './pages/BookNow';

function App() {

  return (

    <Router basename="/">

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/BookNow" element={<BookNow />} />
    
      </Routes>

    </Router>
 
  )
}

export default App
