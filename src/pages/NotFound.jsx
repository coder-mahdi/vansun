import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';

const SITE_URL = 'https://vansunstudio.com';

const NotFound = () => {
  return (
    <Layout>
      <Helmet>
        <title>404 Not Found | Vansun Studio</title>
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`${SITE_URL}/404`} />
      </Helmet>
      <div className="not-found-container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <Link to="/" className="home-button">Back to Home</Link>
      </div>
    </Layout>
  );
};

export default NotFound; 