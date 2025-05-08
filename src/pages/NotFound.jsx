import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';

const NotFound = () => {
  return (
    <Layout>
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