import React, { useState, useEffect } from 'react';
import { fetchPageBySlug } from '../utils/api';


const Hero = () => {
  const [heroData, setHeroData] = useState(null);
  const [heroImages, setHeroImages] = useState([]);

  useEffect(() => {
    const fetchHeroData = async () => {
      const pageData = await fetchPageBySlug('hero-data');
      if (pageData && pageData.acf && pageData.acf.hero) {
        setHeroData(pageData.acf.hero);
        const imageIds = pageData.acf.hero['hero-image'];
        if (imageIds && imageIds.length > 0) {
          const imagePromises = imageIds.map(async (imageId) => {
            const imageData = await fetch(`http://localhost:8888/vansun/wp-json/wp/v2/media/${imageId}`);
            return imageData.json();
          });
          const images = await Promise.all(imagePromises);
          setHeroImages(images);
        }
      }
    };

    fetchHeroData();
  }, []);

  if (!heroData || heroImages.length === 0) {
    return <div>Loading...</div>;
  }

  const { title, subtitle } = heroData;

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="slider-container">
          <div className="slider-track">
            {[...heroImages, ...heroImages].map((image, index) => (
              <div key={index} className="slider-item">
                <img src={image.source_url} alt={image.alt_text} />
              </div>
            ))}
          </div>
        </div>
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
      </div>
    </section>
  );
};

export default Hero;
