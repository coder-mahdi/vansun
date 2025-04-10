import React, { useEffect, useState } from 'react';

const Header = () => {
  const [headerData, setHeaderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState(null); 

  const fetchLogo = async (logoId) => {
    try {
      const response = await fetch(`http://localhost:8888/vansun/wp-json/wp/v2/media/${logoId}`);
      const mediaData = await response.json(); 
      return mediaData.source_url;
    } catch (error) {
      console.error('Error fetching logo image:', error);
      return null;
    }
  };
  
  useEffect(() => {
    fetch('http://localhost:8888/vansun/wp-json/wp/v2/pages?slug=header-data')
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setHeaderData(data[0].acf); 
          if (data[0].acf.navigate.logo) {
            fetchLogo(data[0].acf.navigate.logo).then((logoUrl) => {
              setLogoUrl(logoUrl); 
            });
          }
        } else {
          setHeaderData(null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching header data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading header...</p>;
  if (!headerData) return <p>No header data found.</p>;

  return (
    <header className="flex items-center justify-between p-4 shadow-md">
      {logoUrl && (
        <img
          src={logoUrl} 
          alt="Logo"
          style={{ height: '50px' }}
        />
      )}
      <nav>
        {/* نمایش لینک‌های سرویس, بوک, ابوت */}
        {headerData.navigate.service_ && (
          <a
            href={headerData.navigate.service_.url}
            target={headerData.navigate.service_.target || '_self'}
            className="text-blue-600 hover:underline ml-4"
          >
            {headerData.navigate.service_.title}
          </a>
        )}
        {headerData.navigate.about_ && (
          <a
            href={headerData.navigate.about_.url}
            target={headerData.navigate.about_.target || '_self'}
            className="text-blue-600 hover:underline ml-4"
          >
            {headerData.navigate.about_.title}
          </a>
        )}
        {headerData.navigate.book && (
          <a
            href={headerData.navigate.book}
            className="text-blue-600 hover:underline ml-4"
          >
            Book
          </a>
        )}
      </nav>
    </header>
  );
};

export default Header;
