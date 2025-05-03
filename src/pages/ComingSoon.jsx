import React from 'react';
import Layout from '../layout/Layout';

const ComingSoon = () => {
  return (
    <Layout>
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