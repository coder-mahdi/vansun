import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../layout/Layout';

const SITE_URL = 'https://vansunstudio.com';

const TermsAndConditions = () => {
  const [content, setContent] = useState({
    privacyPolicy: {
      text: ''
    },
    conditions: {
      text: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('https://vansunstudio.com/cms/wp-json/wp/v2/pages?slug=tc');
        const data = await response.json();
        
        if (data.length > 0 && data[0].acf && data[0].acf['t&c_']) {
          const tcData = data[0].acf['t&c_'];
          
          setContent({
            privacyPolicy: {
              text: tcData['text-privacy-policy'] || ''
            },
            conditions: {
              text: tcData['text-conditions'] || ''
            }
          });
        } else {
          setError('Page not found');
        }
      } catch (err) {
        console.error('Error fetching Terms & Conditions:', err);
        setError('Error loading content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Helmet>
          <title>Terms &amp; Conditions | Vansun Studio</title>
          <link rel="canonical" href={`${SITE_URL}/terms-and-conditions`} />
        </Helmet>
        <div className="terms-and-conditions__container">
          <h1 className="terms-and-conditions__heading">Terms &amp; Conditions</h1>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Helmet>
          <title>Terms &amp; Conditions | Vansun Studio</title>
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href={`${SITE_URL}/terms-and-conditions`} />
        </Helmet>
        <div className="terms-and-conditions__container">
          <h1 className="terms-and-conditions__heading">Terms &amp; Conditions</h1>
          <p className="error">{error}</p>
        </div>
      </Layout>
    );
  }

  const pageTitle = 'Terms & Conditions | Vansun Studio';
  const description = 'Read Vansun Studio’s Terms & Conditions and Privacy Policy covering bookings, hygiene practices, cancellations, and client responsibilities.';
  const canonicalUrl = `${SITE_URL}/terms-and-conditions`;

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
      <div className="terms-and-conditions__container">
        <h1 className="terms-and-conditions__heading">Terms &amp; Conditions</h1>
        {/* Privacy Policy Section */}
        <section className="terms-and-conditions__section">
          <h2 className="terms-and-conditions__title">Privacy Policy</h2>
          <div className="terms-and-conditions__content">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: content.privacyPolicy.text
                  .split('\n')
                  .map((line, index) => {
                    // Check if line is a heading (starts with a word and ends with :)
                    if (/^[A-Za-z].*:$/.test(line)) {
                      return `<h3>${line}</h3>`;
                    }
                    // Check if line is a list item (starts with - or •)
                    if (/^[-•]/.test(line)) {
                      return `<li>${line.replace(/^[-•]\s*/, '')}</li>`;
                    }
                    // Regular paragraph
                    return line ? `<p>${line}</p>` : '<br>';
                  })
                  .join('')
              }} 
            />
          </div>
        </section>

        {/* Terms & Conditions Section */}
        <section className="terms-and-conditions__section">
          <h2 className="terms-and-conditions__title">Terms and Conditions</h2>
          <div className="terms-and-conditions__content">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: content.conditions.text
                  .split('\n')
                  .map((line, index) => {
                    // Check if line is a heading (starts with a word and ends with :)
                    if (/^[A-Za-z].*:$/.test(line)) {
                      return `<h3>${line}</h3>`;
                    }
                    // Check if line is a list item (starts with - or •)
                    if (/^[-•]/.test(line)) {
                      return `<li>${line.replace(/^[-•]\s*/, '')}</li>`;
                    }
                    // Regular paragraph
                    return line ? `<p>${line}</p>` : '<br>';
                  })
                  .join('')
              }} 
            />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default TermsAndConditions; 