import React, { useState } from 'react';
import { fetchPageBySlug } from '../utils/api';

const FAQ = ({ type }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  React.useEffect(() => {
    const loadFaqs = async () => {
      try {
        setLoading(true);
        console.log('Loading FAQs for type:', type);
        const page = await fetchPageBySlug(`faq-${type.toLowerCase()}`);
        console.log('Fetched FAQ page:', page);
        if (page && page.acf && page.acf.faq_) {
          console.log('Setting FAQs:', page.acf.faq_);
          setFaqs(page.acf.faq_);
        } else {
          console.log('No FAQ data found in page:', page);
        }
      } catch (err) {
        console.error('Error loading FAQs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFaqs();
  }, [type]);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return <div className="faq-loading">Loading FAQs...</div>;
  }

  if (error) {
    return <div className="faq-error">Error loading FAQs: {error}</div>;
  }

  if (!faqs.length) {
    return null;
  }

  return (
    <div className="faq-container">
      <h3>Frequently Asked Questions</h3>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item ${openIndex === index ? 'open' : ''}`}
          >
            <button 
              className="faq-question"
              onClick={() => toggleAccordion(index)}
            >
              {faq.question}
              <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
            </button>
            <div className="faq-answer">
              <div className="faq-answer-content">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ; 