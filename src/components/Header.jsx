import React, { useEffect, useState } from 'react';

const Header = () => {
  const [headerData, setHeaderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8888/vansun/wp-json/wp/v2/pages?slug=header-data')
      .then((res) => res.json())
      .then((data) => {
        setHeaderData(data.acf); 
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
    <header>
      <img
        src={headerData.logo?.url}
        alt={headerData.logo?.alt || 'Logo'}
        style={{ width: '150px' }}
      />
      <h1>{headerData.header_title}</h1>
      <p>{headerData.header_subtitle}</p>
    </header>
  );
};

export default Header;
