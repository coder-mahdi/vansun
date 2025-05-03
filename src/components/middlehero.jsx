import React, { useEffect, useState } from 'react';
import { fetchPageBySlug } from '../utils/api';

const API_BASE = 'http://vansunstudio.com/cms/wp-json/wp/v2';

const MiddleHero = () => {
  const [middleHeroData, setMiddleHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMiddleHeroData = async () => {
      try {
        console.log('Fetching page with slug: middle-hero');
        const page = await fetchPageBySlug('middle-hero');
        console.log('Page data received:', page);
        
        // Check if page exists
        if (!page) {
          console.error('Page with slug middle-hero not found');
          setLoading(false);
          return;
        }
        
        // Log the complete page data to see its structure
        console.log('Complete page data:', JSON.stringify(page, null, 2));
        
        // Check if middle_hero field exists
        if (page.acf && page.acf.middle_hero) {
          console.log('ACF middle_hero field found:', page.acf.middle_hero);
          const imageId = page.acf.middle_hero;
          
          if (imageId) {
            console.log('Image ID:', imageId);
            
            // Fetch the image URL from the media API
            try {
              const response = await fetch(`${API_BASE}/media/${imageId}`);
              const imageData = await response.json();
              console.log('Image data:', imageData);
              
              if (imageData && imageData.source_url) {
                console.log('Image URL:', imageData.source_url);
                setMiddleHeroData({
                  imageId,
                  imageUrl: imageData.source_url
                });
              } else {
                console.error('Image URL not found in response');
              }
            } catch (error) {
              console.error('Error fetching image data:', error);
            }
          } else {
            console.error('Image ID is null or undefined');
          }
        } else {
          console.error('ACF middle_hero field not found in page data');
          // Log all available ACF fields
          if (page.acf) {
            console.log('Available ACF fields:', Object.keys(page.acf));
          }
        }
      } catch (error) {
        console.error('Error fetching middle hero data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getMiddleHeroData();
  }, []);

  if (loading) return <div className="middle-hero-loading">Loading...</div>;
  if (!middleHeroData || !middleHeroData.imageUrl) {
    console.log('No image data available to display');
    return null;
  }

  console.log('Rendering image with URL:', middleHeroData.imageUrl);
  return (
    <div className="middle-hero-container">

    <div className="middle-hero">
      
        <img 
          src={middleHeroData.imageUrl} 
          alt="Middle Hero" 
          className="middle-hero-image"
          />

    </div>
          </div>
  );
};

export default MiddleHero;
