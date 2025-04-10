import React, { useEffect, useState } from 'react';

const Header = () => {
  const [headerData, setHeaderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState(null); // state برای ذخیره URL لوگو

  // تابع برای دریافت URL تصویر لوگو از API رسانه
  const fetchLogo = async (logoId) => {
    try {
      const response = await fetch(`http://localhost:8888/vansun/wp-json/wp/v2/media/${logoId}`);
      const mediaData = await response.json(); // اینو فراموش نکن!
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
          setHeaderData(data[0].acf); // 👈 گرفتن داده‌های ACF
          if (data[0].acf.logo) {
            fetchLogo(data[0].acf.logo).then((logoUrl) => {
              setLogoUrl(logoUrl); // ذخیره URL لوگو در state
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
          src={logoUrl} // استفاده از URL لوگو که از API گرفته‌ایم
          alt="Logo"
          style={{ height: '50px' }}
        />
      )}
      <nav>
        {headerData.navigate && (
          <a
            href={headerData.navigate.url}
            target={headerData.navigate.target || '_self'}
            className="text-blue-600 hover:underline ml-4"
          >
            {headerData.navigate.title}
          </a>
        )}
      </nav>
    </header>
  );
};

export default Header;
