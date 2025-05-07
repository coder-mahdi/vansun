import React, { useEffect, useState } from 'react';
import { fetchPageBySlug } from '../utils/api';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';

const API_BASE = 'https://vansunstudio.com/cms/wp-json/wp/v2';
const WC_API_URL = 'https://vansunstudio.com/cms/wp-json/wc/v3';
const CONSUMER_KEY = "ck_44d32257666864a9026ec404789951b93a88aeca";
const CONSUMER_SECRET = "cs_dc01b9d6f3523dc2313989f18178a9146c78afd6";

const BookNow = () => {
  const [bookNowData, setBookNowData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getBookNowData = async () => {
      try {
        // Fetch products from WooCommerce
        const productsRes = await fetch(`${WC_API_URL}/products?type=booking&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`);
        const products = await productsRes.json();

        // Get the page data for additional info
        const page = await fetchPageBySlug('booknow-data');
        const acfData = page?.acf?.['book-now'] || [];

        // Combine WooCommerce products with ACF data
        const data = await Promise.all(
          products.map(async (product) => {
            // Find matching ACF data by title
            const acfItem = acfData.find(item => item.title === product.name);
            const imageUrl = acfItem ? await fetchImageUrl(acfItem['book-now-image']) : null;

            return {
              title: product.name,
              price: product.price_html || 'Contact for price',
              imageUrl: imageUrl,
              productId: product.id,
            };
          })
        );

        setBookNowData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
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
