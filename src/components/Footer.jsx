import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch('https://vansunstudio.com/cms/wp-json/wp/v2/pages?slug=footer-data')
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0 && data[0].acf && data[0].acf.Footer) {
          const footer = data[0].acf.Footer;
      
          const headerLinks = footer.header_links && footer.header_links.length > 0
            ? Object.values(footer.header_links[0])
            : [];
      
          const socialMedia = footer.social_media && footer.social_media.length > 0
            ? footer.social_media[0]
            : {};
      
          setFooterData({
            ...footer,
            header_links: headerLinks,
            social_media: socialMedia
          });
        } else {
          setFooterData(null);
        }
        setLoading(false);
      })
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  if (loading) return <p>Loading footer...</p>;
  if (!footerData) return <p>No footer data found.</p>;

  return (
    <footer>
      <h1>{footerData.title}</h1>

      <div className="footer-content">
        <div className="left-side">
          <nav>
            <ul>
              {footerData.header_links.map((link, index) => (
                <li key={index}>
                  <a href={link.url} target={link.target || '_self'}>
                    {link.title}
                  </a>
                </li>
              ))}
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/terms-and-conditions">Terms & Conditions</Link></li>
            </ul>
          </nav>

          <div className="address">
            {footerData.address}
          </div>
        </div>

        <div className="social-media">
          <ul>
            {footerData.social_media.instagram && (
              <a href={footerData.social_media.instagram} target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            )}
            <a href="#" onClick={(e) => e.preventDefault()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
          </ul>
        </div>

        <div className="right-side">
          <div className="dropdown" ref={dropdownRef}>
            <div className="email-btn">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
              >
                Consent Forms
              </button>
            </div>
            {isDropdownOpen && (
              <ul className="dropdown-menu">
                <li><Link to="/consent-form/tattoo">Tattoo Consent Form</Link></li>
                <li><Link to="/consent-form/piercing">Piercing Consent Form</Link></li>
              </ul>
            )}
          </div>
          <div className="email-btn">
            <button onClick={() => window.location.href = `mailto:${footerData.email_button}`}>
              Send Email
            </button>
          </div>
        </div>
      </div>

      <div className="copyright">
        <p>&copy; 2025 Van Sun Studio. All rights reserved.</p>
      </div>
    </footer>
  )  
};

export default Footer;
