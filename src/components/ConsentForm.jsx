import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import './ConsentForm.scss';

const RECAPTCHA_SITE_KEY = "6Lez4zErAAAAAPakygMDjCAZ2yRZt-hVSKbGQNJ0";

const ConsentForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef();

  useEffect(() => {
    // Fetch form content
    console.log('Fetching data...');
    fetch('https://vansunstudio.com/cms/wp-json/wp/v2/pages?slug=consent-form&_fields=acf')
      .then((res) => res.json())
      .then((data) => {
        console.log('Raw API Response:', data);
        if (data.length > 0) {
          console.log('Page found:', data[0]);
          console.log('ACF Data:', data[0].acf);
          if (data[0].acf && data[0].acf['consent_form']) {
            console.log('Consent form text:', data[0].acf['consent_form']);
            setFormData(data[0].acf['consent_form']);
          } else {
            console.log('No consent form data found in ACF');
            console.log('Available ACF fields:', Object.keys(data[0].acf));
          }
        } else {
          console.log('No page found with slug consent-form');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  const handleRecaptchaChange = (token) => {
    console.log('reCAPTCHA token received:', token);
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !isChecked || !isTermsChecked || !recaptchaToken) return;

    try {
      const response = await fetch('https://vansunstudio.com/cms/wp-json/vansun/v1/consent-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          consent_date: new Date().toISOString(),
          is_checked: isChecked,
          is_terms_checked: isTermsChecked,
          recaptcha_token: recaptchaToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit form');
      }

      setIsSubmitted(true);
      setError(null);
      recaptchaRef.current?.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form. Please try again.');
      recaptchaRef.current?.reset();
    }
  };

  if (loading) return <div className="consent-form-container">Loading...</div>;
  if (!formData) return <div className="consent-form-container">No form data found.</div>;

  return (
    <div className="consent-form-container">
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="consent-form">
          <h2>Piercing Consent Agreement</h2>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">Full Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number:</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="consent-text">
            {formData.split('\n').map((paragraph, index) => (
              <p key={index} className="consent-paragraph">{paragraph}</p>
            ))}
          </div>

          <div className="checkbox-container">
            <input
              type="checkbox"
              id="consent-checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              required
            />
            <label htmlFor="consent-checkbox">
              I hereby declare that I have read, understood, and agree to all the terms and conditions stated above
            </label>
          </div>

          <div className="checkbox-container">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={isTermsChecked}
              onChange={(e) => setIsTermsChecked(e.target.checked)}
              required
            />
            <label htmlFor="terms-checkbox">
              I agree to the Terms & Conditions and Privacy Policy
            </label>
          </div>

          <div className="recaptcha-container">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
            />
          </div>

          <button type="submit" disabled={!name || !email || !phone || !isChecked || !isTermsChecked || !recaptchaToken}>
            Submit
          </button>
        </form>
      ) : (
        <div className="success-message">
          <h3>Consent form submitted successfully!</h3>
          <p>Thank you {name} for submitting your consent form.</p>
          <a href="/" className="home-button" onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}>
            Back to Home
          </a>
        </div>
      )}
    </div>
  );
};

export default ConsentForm; 