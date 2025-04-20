import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  // Function to scroll to a section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="logo">
        <Link to="/">
          <img src="/path-to-your-logo.png" alt="Logo" />
        </Link>
      </div>

      {/* Navigation */}
      <nav>
        {/* About Link */}
        <a href="#about" onClick={(e) => {
          e.preventDefault();
          scrollToSection('about');
        }}>
          About
        </a>

        {/* Services Link */}
        <a href="#my-work" onClick={(e) => {
          e.preventDefault();
          scrollToSection('my-work');
        }}>
          Services
        </a>

        {/* Book Now Link */}
        <Link to="/booknow">
          Book Now
        </Link>
      </nav>
    </header>
  );
};

export default Header;
