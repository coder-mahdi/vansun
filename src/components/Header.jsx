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

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      // When on other pages, navigate to home with state to scroll to section
      navigate('/', { 
        state: { scrollTo: sectionId }
      });
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        // Force scroll to section with offset
        window.scrollTo({
          top: section.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    }
    setIsMenuOpen(false);
  };

  // Handle scroll after navigation
  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname === '/' && location.state?.scrollTo) {
        const section = document.getElementById(location.state.scrollTo);
        if (section) {
          // Add a small delay to ensure the page is fully loaded
          setTimeout(() => {
            window.scrollTo({
              top: section.offsetTop - 100,
              behavior: 'smooth'
            });
            // Remove the scrollTo state after scrolling
            window.history.replaceState({}, document.title);
          }, 100);
        }
      }
    };

    // Try to scroll immediately
    handleScroll();

    // Also try after a short delay
    const timeoutId = setTimeout(handleScroll, 500);

    // And also try when the window loads
    window.addEventListener('load', handleScroll);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('load', handleScroll);
    };
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
              <Link to="/booknow" className="btn-book">Book Now</Link>
            </div>
            <a onClick={() => scrollToSection('about')}>About</a>
            <a onClick={() => scrollToSection('my-work')}>Services</a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 