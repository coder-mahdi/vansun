import React, { useEffect, useState } from 'react';

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8888/vansun/wp-json/wp/v2/pages?slug=footer-data')
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0 && data[0].acf && data[0].acf.Footer) {
          const footer = data[0].acf.Footer;
      
          // تبدیل header_links به آرایه فلت شده
          const headerLinks = footer.header_links && footer.header_links.length > 0
            ? Object.values(footer.header_links[0])
            : [];
      
          // social_media هم یک آرایه شامل یک آبجکت هست
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

  if (loading) return <p>Loading footer...</p>;
  if (!footerData) return <p>No footer data found.</p>;

  return (
    <footer>
    <h2>{footerData.title}</h2>
  
    <nav>
      <ul>
        {footerData.header_links.map((link, index) => (
          <li key={index}>
            <a href={link.url} target={link.target || '_self'}>
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  
    <div className="social-media">
      <ul>
        {footerData.social_media.instagram && (
          <li>
            <a href={footerData.social_media.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          </li>
        )}
        {footerData.social_media.facebook && (
          <li>
            <a href={footerData.social_media.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
          </li>
        )}
      </ul>
    </div>
  
    <div className="email-btn">
      <button onClick={() => window.location.href = `mailto:${footerData.email_button}`}>
        Send Email
      </button>
    </div>
  </footer>
  )  
};

export default Footer;
