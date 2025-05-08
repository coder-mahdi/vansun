import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.header')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSectionClick = (sectionId) => {
    // Store the section ID in sessionStorage
    sessionStorage.setItem('scrollToSection', sectionId);
    
    // Navigate to home page
    navigate('/');
    setIsMenuOpen(false);
  };

  // Handle scrolling after navigation
  useEffect(() => {
    if (location.pathname === '/') {
      const sectionId = sessionStorage.getItem('scrollToSection');
      if (sectionId) {
        // Clear the stored section ID
        sessionStorage.removeItem('scrollToSection');
        
        // Wait for the page to be fully loaded
        const checkForElement = setInterval(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            clearInterval(checkForElement);
          }
        }, 100);

        // Clear interval after 5 seconds to prevent infinite checking
        setTimeout(() => clearInterval(checkForElement), 5000);
      }
    }
  }, [location]);

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
            <a onClick={() => handleSectionClick('about')}>About</a>
            <a onClick={() => handleSectionClick('my-work')}>Services</a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
