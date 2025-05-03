import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPageBySlug, API_BASE } from '../utils/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logo, setLogo] = useState(null);

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

  useEffect(() => {
    const fetchNavigationData = async () => {
      try {
        const pageData = await fetchPageBySlug('header-data');
        console.log('Header Data:', pageData);
        console.log('ACF Data:', pageData?.acf);
        console.log('Navigate Data:', pageData?.acf?.navigate);
        console.log('Logo ID:', pageData?.acf?.navigate?.logo);
        
        if (pageData && pageData.acf && pageData.acf.navigate && pageData.acf.navigate.logo) {
          const logoId = pageData.acf.navigate.logo;
          const logoData = await fetch(`${API_BASE}/wp/v2/media?include=${logoId}`);
          const logoJson = await logoData.json();
          console.log('Logo Response:', logoJson);
          if (logoJson && logoJson.length > 0) {
            setLogo(logoJson[0].source_url);
          }
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };

    fetchNavigationData();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <Link to="/">
            {logo ? (
              <img src={logo} alt="Vansun Logo" />
            ) : (
              <div>Loading...</div>
            )}
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
            <a onClick={() => scrollToSection('about')}>About</a>
            <a onClick={() => scrollToSection('my-work')}>Services</a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
