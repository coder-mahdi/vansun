import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll when location state changes
  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 100,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  }, [location]);

  const handleNavigation = (section) => {
    if (location.pathname !== '/') {
      navigate('/', { 
        state: { scrollTo: section }
      });
    } else {
      const element = document.getElementById(section);
      if (element) {
        window.scrollTo({
          top: element.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <Link to="/">
            <img src="/logo/logo.png" alt="Vansun Logo" />
          </Link>
        </div>

        {/* Hamburger Menu */}
        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation */}
        <nav className={isMenuOpen ? 'active' : ''}>
          <div className="nav-links">
            <div className="book-now-link">  
              <Link to="/booknow">Book Now</Link>
            </div>
            <a onClick={() => handleNavigation('about')}>About</a>
            <a onClick={() => handleNavigation('my-work')}>Services</a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
