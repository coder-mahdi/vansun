import React, { useEffect, useState } from 'react';
import Layout from '../layout/Layout';

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
          // Split the content into privacy policy and terms & conditions
          const contentParts = tcData.split('\r\n\r\nTerms and Conditions');
          
          // Format the text by replacing multiple newlines with single newline
          const formatText = (text) => {
            return text
              .replace(/^Vansun studio's Privacy Policy\r\n/, '') // Remove the title
              .replace(/\r\n\r\n/g, '\n') // Replace double newlines with single
              .replace(/\n{3,}/g, '\n\n') // Replace 3 or more newlines with double
              .trim();
          };
          
          setContent({
            privacyPolicy: {
              text: formatText(contentParts[0])
            },
            conditions: {
              text: formatText(contentParts[1] || '')
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

  if (loading) return (
    <Layout>
      <div className="terms-and-conditions__container">
        <p>Loading...</p>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="terms-and-conditions__container">
        <p className="error">{error}</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="terms-and-conditions__container">
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