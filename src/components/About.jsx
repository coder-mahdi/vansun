import React, { useEffect, useState } from 'react';
import { fetchPageBySlug } from '../utils/api';

const API_BASE = 'http://localhost:8888/vansun/wp-json/wp/v2';

const About = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAboutData = async () => {
      const page = await fetchPageBySlug('about-data');
      if (page && page.acf && page.acf.about) {
        // بارگذاری تصویر از ID
        const aboutImageUrl = await fetchImageUrl(page.acf.about['about-image']);
        setAboutData({
          title: page.acf.about.title,
          description: page.acf.about.description,
          imageUrl: aboutImageUrl,
        });
      }
      setLoading(false);
    };
    getAboutData();
  }, []);

  // بارگذاری تصویر با استفاده از شناسه
  const fetchImageUrl = async (imageId) => {
    try {
      const res = await fetch(`${API_BASE}/media/${imageId}`);
      const imageData = await res.json();
      return imageData.source_url;
    } catch (error) {
      console.error(`Error fetching image with ID ${imageId}:`, error);
      return null;
    }
  };

  if (loading) return <p>Loading about...</p>;
  if (!aboutData) return <p>No about data found.</p>;

  return (
    <section className="about">
        <h2>About</h2>

      {aboutData.imageUrl && (
        <img
          src={aboutData.imageUrl}
          alt="About Us"
          className="about-image"
        />
      )}
      <div className="about-text">
        <h3>{aboutData.title}</h3>
        <p>{aboutData.description}</p>
      </div>
    </section>
  );
};

export default About;
