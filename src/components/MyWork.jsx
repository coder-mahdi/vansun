import React, { useEffect, useState } from 'react';
import { fetchPageBySlug } from '../utils/api';
import { Link } from 'react-router-dom';

const API_BASE = 'https://vansunstudio.com/cms/wp-json/wp/v2';

const MyWork = () => {
  const [myWorkData, setMyWorkData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMyWorkData = async () => {
      const page = await fetchPageBySlug('mywork-data');
      console.log('MyWork Data:', page.acf.mywork);
      if (page && page.acf && page.acf.mywork) {
        const myworkItems = await Promise.all(
          page.acf.mywork.map(async (item) => {
            console.log('Single Item:', item);
            const imageUrl = await fetchImageUrl(item['mywork-image']);
            return {
              ...item,
              imageUrl,
              gallery: item.gallery || [],
            };
          })
        );
        setMyWorkData(myworkItems);
      }
      setLoading(false);
    };
    getMyWorkData();
  }, []);


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

  if (loading) return <p>Loading my work...</p>;
  if (!myWorkData.length) return <p>No work data found.</p>;


  return (
    <section id="my-work" className="my-work">
      <h2 className='mywork-title'>My Work</h2>
      <div className="my-work-items-container">
        {myWorkData.map((item, index) => (
          <div key={index} className="my-work-item">
            <h3>{item.title}</h3>
            {item.imageUrl && (
              <img src={item.imageUrl} alt={`Work ${index + 1}`} className="my-work-image" />
            )}
            <p>{item.description}</p>
            <div className="button-group">
              <Link to="/booknow" className="btn-book">Book Now</Link>
              <Link to={`/gallery/${index}`} className="btn-gallery">Gallery</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MyWork;
