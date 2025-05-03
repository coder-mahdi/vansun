import React, { useEffect, useState } from 'react';
import { fetchPageBySlug } from '../utils/api';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';

const API_BASE = 'http://vansunstudio.com/cms/wp-json/wp/v2';

const BookNow = () => {
  const [bookNowData, setBookNowData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getBookNowData = async () => {
      const page = await fetchPageBySlug('booknow-data');
      if (page && page.acf && page.acf['book-now']) {
        const data = await Promise.all(
          page.acf['book-now'].map(async (item) => {
            const imageUrl = await fetchImageUrl(item['book-now-image']);
            const productId = item['booking-link']; 
            return {
              title: item.title,
              price: item.price,
              imageUrl: imageUrl,
              productId: productId,
            };
          })
        );
        setBookNowData(data);
      }
      setLoading(false);
    };
    getBookNowData();
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

  if (loading) return <p>Loading book now...</p>;
  if (bookNowData.length === 0) return <p>No book now data found.</p>;

  return (
    <Layout>
      <section className="book-now">
        <h1>Services</h1>

        <div className="booknow-items-container">

        {bookNowData.map((item, index) => (
          <div key={index} className="book-now-item">
            {item.imageUrl && (
              <img
              src={item.imageUrl}
              alt={`Book now ${index + 1}`}
              className="book-now-image"
              />
            )}
            <h2>{item.title}</h2>
            <p>{item.price}</p>
            <Link
              to={`/booking/${item.productId}`}
              className="book-now-button"
              >
              Book Now
            </Link>
          </div>
        ))}
        </div>
      </section>
    </Layout>
  );
};

export default BookNow;
