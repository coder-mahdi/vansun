import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import SignatureCanvas from 'react-signature-canvas';
import Layout from '../layout/Layout';

const RECAPTCHA_SITE_KEY = "6Lez4zErAAAAAPakygMDjCAZ2yRZt-hVSKbGQNJ0";

const ConsentForm = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // Get form type from URL params
  console.log('Form Type:', type); // Add this line to debug
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdayDate, setBirthdayDate] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [signature, setSignature] = useState(null);
  const recaptchaRef = useRef();
  const signatureRef = useRef();

  useEffect(() => {
    // Fetch form content based on type
    console.log('Fetching data...');
    const acfField = type === 'piercing' ? 'piercing_consent_form' : 'tattoo_consent_form_';
    const pageSlug = type === 'piercing' ? 'consent-form' : 'tattoo-consent-form';
    console.log('Page Slug:', pageSlug);
    console.log('ACF Field to fetch:', acfField);
    
    fetch(`https://vansunstudio.com/cms/wp-json/wp/v2/pages?slug=${pageSlug}&_fields=id,slug,title,acf`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Raw API Response:', data);
        if (data.length > 0) {
          const pageData = data[0];
          console.log('Page found:', pageData);
          
          if (pageData.acf && typeof pageData.acf === 'object') {
            console.log('ACF Data:', pageData.acf);
            console.log('All available ACF fields:', Object.keys(pageData.acf));
            
            if (pageData.acf[acfField]) {
              console.log('Found consent form text:', pageData.acf[acfField]);
              setFormData(pageData.acf[acfField]);
            } else {
              console.log(`No ${acfField} data found in ACF`);
              console.log('Available ACF fields:', Object.keys(pageData.acf));
              setFormData(null);
            }
          } else {
            console.log('No ACF data found or invalid format');
            setFormData(null);
          }
        } else {
          console.log(`No page found with slug ${pageSlug}`);
          setFormData(null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError('Failed to load form data. Please try again later.');
        setLoading(false);
      });
  }, [type]);

  const handleRecaptchaChange = (token) => {
    console.log('reCAPTCHA token received:', token);
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !birthdayDate || !isChecked || !isTermsChecked || !recaptchaToken || !signature) return;

    try {
      const response = await fetch(`https://vansunstudio.com/cms/wp-json/vansun/v1/consent-form/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          birthday_date: birthdayDate,
          signature: signature,
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
      signatureRef.current?.clear();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form. Please try again.');
      recaptchaRef.current?.reset();
    }
  };

  const handleSignatureEnd = () => {
    if (signatureRef.current) {
      setSignature(signatureRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
    setSignature(null);
  };

  if (loading) return <Layout><div className="consent-form-container">Loading...</div></Layout>;
  if (!formData) return <Layout><div className="consent-form-container">No form data found.</div></Layout>;

  const formTitle = type === 'piercing' ? 'Piercing Consent Agreement' : 'Tattoo Consent Agreement';

  return (
    <Layout>
      <div className="consent-form-container">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="consent-form">
            <h2>{formTitle}</h2>
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

            <div className="form-group">
              <label htmlFor="birthday">Birthday:</label>
              <input
                type="date"
                id="birthday"
                value={birthdayDate}
                onChange={(e) => setBirthdayDate(e.target.value)}
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
                I agree to the <Link to="/terms-and-conditions">Terms & Conditions</Link> and <Link to="/privacy-policy">Privacy Policy</Link>
              </label>
            </div>

            <div className="signature-container">
              <label>Electronic Signature:</label>
              <div className="signature-pad">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: 'signature-canvas',
                    width: 500,
                    height: 200
                  }}
                  onEnd={handleSignatureEnd}
                />
                <button type="button" onClick={clearSignature} className="clear-signature">
                  Clear Signature
                </button>
              </div>
            </div>

            <div className="recaptcha-container">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
              />
            </div>

            <button 
              type="submit" 
              disabled={!name || !email || !phone || !birthdayDate || !isChecked || !isTermsChecked || !recaptchaToken || !signature}
            >
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
    </Layout>
  );
};

export default ConsentForm; 