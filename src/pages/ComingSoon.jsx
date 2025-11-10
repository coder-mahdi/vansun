import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../layout/Layout';

const SITE_URL = 'https://vansunstudio.com';

const ComingSoon = () => {
  const pageTitle = 'Coming Soon | Vansun Studio';
  const description = 'Stay tuned for the next Vansun Studio experience. Follow us on social media for updates about new piercing and tattoo services.';
  const canonicalUrl = `${SITE_URL}/coming-soon`;

  return (
    <Layout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      <div className="coming-soon-container">
        <div className="coming-soon-content">
          <h1>Coming Soon</h1>
          <p>We're working on something amazing!</p>
          <div className="social-links">
            <a href="https://www.instagram.com/vansunstudio" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="https://www.facebook.com/vansunstudio" target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ComingSoon; 