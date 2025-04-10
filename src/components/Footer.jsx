import React, { useEffect, useState } from 'react';

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8888/vansun/wp-json/wp/v2/pages?slug=footer-data')
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setFooterData(data[0].acf.Footer); 
        } else {
          setFooterData(null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching footer data:', error);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <p>Loading footer...</p>;
  if (!footerData) return <p>No footer data found.</p>;

  return (
    <footer>
      <h2>{footerData.title}</h2>
      <nav>
        <ul>
          {footerData.navigate && footerData.navigate.map((link, index) => (
            <li key={index}>
              <a href={link.url} target={link.target || '_self'}>
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="social-media">
        {footerData.social_media && (
          <ul>
            <li>
              <a href={footerData.social_media.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            </li>
            <li>
              <a href={footerData.social_media.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
            </li>
          </ul>
        )}
      </div>
      <div className="email-btn">
        <button onClick={() => window.location.href = 'mailto:example@email.com'}>Send Email</button>
      </div>
    </footer>
  );
};

export default Footer;
