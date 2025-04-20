import React, { useState, useEffect } from 'react';
import { fetchPageBySlug } from '../utils/api'; 

const Hero = () => {
  const [heroData, setHeroData] = useState(null);
  const [heroImage, setHeroImage] = useState(null);

  useEffect(() => {
    const fetchHeroData = async () => {
      const pageData = await fetchPageBySlug('hero-data'); 
      if (pageData && pageData.acf && pageData.acf.hero) {
        setHeroData(pageData.acf.hero); 
        const heroImageId = pageData.acf.hero['hero-image'][0]; 
        if (heroImageId) {
          const imageData = await fetch(`http://localhost:8888/vansun/wp-json/wp/v2/media/${heroImageId}`);
          const image = await imageData.json();
          setHeroImage(image);
        }
      }
    };

    fetchHeroData();
  }, []);

  if (!heroData || !heroImage) {
    return <div>Loading...</div>;
  }

  const { title, subtitle } = heroData; 

  return (
    <section className="hero">
      <div className="hero-content">
        {heroImage && heroImage.source_url && (
          <img src={heroImage.source_url} alt={heroImage.alt_text} />
        )}
          <h1>{title}</h1>
        <h2>{subtitle}</h2>
      </div>
    </section>
  );
};

export default Hero;
