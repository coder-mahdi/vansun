import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchPageBySlug } from '../utils/api';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';

const API_BASE = 'https://vansunstudio.com/cms/wp-json/wp/v2';
const WC_API_URL = 'https://vansunstudio.com/cms/wp-json/wc/v3';
const CONSUMER_KEY = "ck_44d32257666864a9026ec404789951b93a88aeca";
const CONSUMER_SECRET = "cs_dc01b9d6f3523dc2313989f18178a9146c78afd6";
const SITE_URL = 'https://vansunstudio.com';

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
          acfData.map(async (acfItem) => {
            const imageUrl = await fetchImageUrl(acfItem['book-now-image']);

            return {
              title: acfItem.title,
              price: acfItem.price,
              imageUrl: imageUrl,
              productId: acfItem.woocommerce_product_id,
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

  const serviceSchema = useMemo(() => {
    if (bookNowData.length === 0) {
      return null;
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'OfferCatalog',
      name: 'Vansun Studio Services',
      itemListElement: bookNowData.map((item, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: item.title,
          description: `${item.title} service at Vansun Studio.`,
          provider: {
            '@type': 'TattooParlor',
            name: 'Vansun Studio',
            url: SITE_URL
          }
        },
        position: index + 1,
        price: item.price ? item.price.replace(/[^0-9.]/g, '') : undefined,
        priceCurrency: item.price?.includes('$') ? 'CAD' : undefined,
        url: `${SITE_URL}/booking/${item.productId}`
      }))
    };
  }, [bookNowData]);

  if (loading) {
    return null;
  }
  if (bookNowData.length === 0) {
    return (
      <Layout>
        <section className="book-now">
          <p>No book now data found.</p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Book Piercing or Tattoo | Vansun Studio Services</title>
        <meta
          name="description"
          content="Browse Vansun Studio services and book your next piercing or tattoo appointment in Vancouver. View pricing, availability, and service details."
        />
        <link rel="canonical" href={`${SITE_URL}/booknow`} />
        <meta property="og:title" content="Book Piercing or Tattoo | Vansun Studio Services" />
        <meta property="og:description" content="Browse Vansun Studio services and book your next piercing or tattoo appointment in Vancouver." />
        <meta property="og:url" content={`${SITE_URL}/booknow`} />
        <meta name="twitter:title" content="Book Piercing or Tattoo | Vansun Studio Services" />
        <meta name="twitter:description" content="Browse Vansun Studio services and book your next piercing or tattoo appointment in Vancouver." />
        {serviceSchema && (
          <script type="application/ld+json">
            {JSON.stringify(serviceSchema)}
          </script>
        )}
      </Helmet>
      <section className="book-now">
        <h1>Services</h1>

        <div className="booknow-items-container">
          {bookNowData.map((item, index) => (
            <div key={index} className="book-now-item">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={`${item.title} service preview`}
                  className="book-now-image"
                  loading="lazy"
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
