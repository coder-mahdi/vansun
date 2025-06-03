import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import { fetchPageBySlug } from "../utils/api";
import ReCAPTCHA from "react-google-recaptcha";
import FAQ from "../components/FAQ";
import '../styles/pages/_bookingpage.scss';

const API_URL = "https://vansunstudio.com/cms/wp-json/vansunstudio/v1";
const RECAPTCHA_SITE_KEY = "6Lez4zErAAAAAPakygMDjCAZ2yRZt-hVSKbGQNJ0";

// Helper function to generate time slots
const generateTimeSlots = (from, to) => {
  const slots = [];
  const startTime = new Date(`2000-01-01T${from}`);
  const endTime = new Date(`2000-01-01T${to}`);
  
  let currentTime = new Date(startTime);
  
  while (currentTime < endTime) {
    const slotStart = currentTime.toTimeString().slice(0, 5);
    currentTime.setMinutes(currentTime.getMinutes() + 30);
    const slotEnd = currentTime.toTimeString().slice(0, 5);
    
    slots.push({
      time: slotStart,
      end_time: slotEnd
    });
  }
  
  return slots;
};

const BookingPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  console.log('Current productId from URL:', productId);

  const [product, setProduct] = useState(null);
  const [productTitle, setProductTitle] = useState('');
  const [availability, setAvailability] = useState(null);
  const [isBooked, setIsBooked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);

  // State for form data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [design, setDesign] = useState(null);
  const [explanation, setExplanation] = useState('');
  const recaptchaRef = useRef();
  const fileInputRef = useRef();

  // Check if this is a tattoo booking
  const isTattooBooking = productTitle?.toLowerCase().includes('tattoo');

  // Handle design image upload
  const handleDesignUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDesign(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove design image
  const removeDesign = () => {
    setDesign(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper function to get current Vancouver time
  const getVancouverTime = () => {
    return new Date().toLocaleString("en-US", {
      timeZone: "America/Vancouver"
    });
  };

  // Helper function to format date to YYYY-MM-DD in Vancouver timezone
  const formatVancouverDate = (date) => {
    return date.toLocaleDateString("en-US", {
      timeZone: "America/Vancouver",
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-');
  };

  // Helper function to check if a time slot is in the future
  const isTimeSlotInFuture = (timeStr) => {
    if (!date) return true;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(hours, minutes, 0, 0);
    
    // Convert slot time to Vancouver timezone
    const vancouverSlotTime = new Date(slotTime.toLocaleString("en-US", {
      timeZone: "America/Vancouver"
    }));
    
    // Get current Vancouver time
    const vancouverNow = new Date(getVancouverTime());
    
    return vancouverSlotTime > vancouverNow;
  };

  // Fetch available dates
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        // Get current Vancouver time
        const vancouverNow = new Date(getVancouverTime());
        const today = new Date(vancouverNow);
        today.setHours(0, 0, 0, 0); // Set to start of day
        
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);

        const dates = [];
        const currentDate = new Date(today);

        while (currentDate <= nextMonth) {
          const dateStr = formatVancouverDate(currentDate);
          dates.push({
            date: dateStr,
            day: currentDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              timeZone: "America/Vancouver"
            })
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        setAvailableDates(dates);
      } catch (err) {
        console.error("Error fetching available dates:", err);
        setError("Error loading available dates");
      }
    };

    fetchAvailableDates();
  }, []);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) {
        console.error('No productId provided');
        setError("No product ID provided");
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching product data for ID:', productId);
        
        const url = `${API_URL}/booking/product?product_id=${productId}`;
        console.log('Request URL:', url);
        
        const productRes = await fetch(url);
        console.log('Product Response Status:', productRes.status);
        
        if (!productRes.ok) {
          throw new Error(`HTTP error! status: ${productRes.status}`);
        }
        
        const productData = await productRes.json();
        console.log('Product Data:', productData);
        
        if (productData) {
          setProduct(productData);
          
          // Set time slots based on product availability rules
          if (productData.availability_rules && productData.availability_rules.length > 0) {
            // Get the first available time rule
            const timeRule = productData.availability_rules.find(rule => 
              rule.type === 'time' || rule.type === 'time:7'
            );
            
            if (timeRule && timeRule.bookable === 'yes') {
              const slots = generateTimeSlots(timeRule.from, timeRule.to);
              setAvailableTimeSlots(slots);
            } else {
              setAvailableTimeSlots([]);
            }
          } else {
            setAvailableTimeSlots([]);
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError(`Error loading product data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  useEffect(() => {
    const fetchProductTitle = async () => {
      try {
        console.log('Fetching product title for ID:', productId);
        const page = await fetchPageBySlug('booknow-data');
        console.log('Booknow data page:', page);
        const acfData = page?.acf?.['book-now'] || [];
        console.log('ACF data:', acfData);
        const productAcfData = acfData.find(item => item.woocommerce_product_id === parseInt(productId));
        console.log('Found product data:', productAcfData);
        if (productAcfData) {
          setProductTitle(productAcfData.title);
        }
      } catch (err) {
        console.error("Error fetching product title:", err);
      }
    };

    fetchProductTitle();
  }, [productId]);

  // Fetch availability when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (date) {
        try {
          console.log('Fetching availability for date:', date);
          const url = `${API_URL}/booking/availability?product_id=${productId}&date=${date}`;
          console.log('Request URL:', url);
          
          const availabilityRes = await fetch(url);
          console.log('Availability Response Status:', availabilityRes.status);
          
          if (!availabilityRes.ok) {
            throw new Error(`HTTP error! status: ${availabilityRes.status}`);
          }
          
          const availabilityData = await availabilityRes.json();
          console.log('Raw Availability Data:', availabilityData);
          setAvailability(availabilityData);
          
          // Update time slots based on date-specific availability
          if (availabilityData.availability_rules) {
            const dateSpecificSlots = availabilityData.availability_rules
              .filter(rule => rule.type === 'time:range')
              .map(rule => ({
                time: rule.from,
                end_time: rule.to
              }));
            
            if (dateSpecificSlots.length > 0) {
              // Filter out past time slots
              const filteredSlots = dateSpecificSlots.filter(slot => isTimeSlotInFuture(slot.time));
              setAvailableTimeSlots(filteredSlots);
            }
          }
        } catch (err) {
          console.error("Error fetching availability:", err);
          setError(`Error loading availability data: ${err.message}`);
        }
      }
    };

    if (date && productId) {
      fetchAvailability();
    }
  }, [date, productId]);

  const handleRecaptchaChange = (token) => {
    console.log('reCAPTCHA token received:', token);
    setRecaptchaToken(token);
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !phone || !date || !time) {
      alert("Please fill in all fields.");
      return;
    }

    if (!termsAccepted) {
      alert("Please accept the Terms & Conditions and Privacy Policy to proceed with booking.");
      return;
    }

    if (!recaptchaToken) {
      alert("Please complete the reCAPTCHA verification.");
      return;
    }

    try {
      const bookingData = {
        full_name: fullName,
        email: email,
        phone: phone,
        product_id: parseInt(productId),
        booking_date: date,
        booking_time: time,
        recaptcha_token: recaptchaToken,
        terms_accepted: termsAccepted
      };

      // Add design and explanation only if they exist
      if (design) {
        bookingData.design = design;
      }
      if (explanation) {
        bookingData.explanation = explanation;
      }

      console.log('Sending booking request with data:', bookingData);

      const res = await fetch(`${API_URL}/booking/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
      });

      console.log('Booking Response Status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Booking Error Response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Booking Success Response:', data);

      if (res.ok) {
        setIsBooked(true);
        recaptchaRef.current?.reset();
      } else {
        alert(data.message || "Something went wrong while booking.");
        recaptchaRef.current?.reset();
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(`Error creating booking: ${error.message}`);
      recaptchaRef.current?.reset();
    }
  };

  // Determine FAQ type based on product title
  const getFaqType = () => {
    console.log('Product Title:', productTitle);
    if (!productTitle) return null;
    
    const title = productTitle.toLowerCase();
    if (title.includes('tattoo')) {
      return 'tattoo';
    } else if (title.includes('piercing')) {
      return 'piercing';
    }
    return null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="booking-container">
        {!isBooked && (
          <h1 className="text-2xl font-bold mb-4">Book Your {productTitle || 'Appointment'}</h1>
        )}

        {isBooked ? (
          <div className="booking-page__success-message">
            <p>
              Your appointment was successfully booked!<br /><br />
              If you need to cancel your appointment, please notify us via email at least 5 hours before your scheduled time.
            </p>
            <div className="success-buttons">
              <a href="mailto:info@vansunstudio.com" className="email-btn">
                Send Email
              </a>
              <button onClick={() => navigate('/')} className="home-btn">
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="booking-form">
            {/* Personal Info Row */}
            <div className="personal-info-row">
              <div>
                <label>Full Name:</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Enter your full name" 
                  required
                />
              </div>

              <div>
                <label>Email:</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter your email" 
                  required
                />
              </div>

              <div>
                <label>Phone:</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Enter your phone number" 
                  required
                />
              </div>
            </div>

            {/* Date and Time Row */}
            <div className="date-time-row">
              <div>
                <label>Date:</label>
                <select 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required
                >
                  <option value="">Select a date</option>
                  {availableDates.map((dateObj) => (
                    <option key={dateObj.date} value={dateObj.date}>
                      {dateObj.date} ({dateObj.day})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Time:</label>
                <select 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  required
                  disabled={!date || availableTimeSlots.length === 0}
                >
                  <option value="">Select a time</option>
                  {availableTimeSlots.map((slot) => (
                    <option key={slot.time} value={slot.time}>
                      {slot.time} - {slot.end_time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Design and Explanation Fields - Only for Tattoo Bookings */}
            {isTattooBooking && (
              <div className="design-explanation-row">
                <div className="design-upload">
                  <label>Design (Optional):</label>
                  <div className="design-upload-container">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleDesignUpload}
                      accept="image/*"
                      className="design-file-input"
                    />
                    {design && (
                      <div className="design-preview">
                        <img src={design} alt="Design preview" />
                        <button
                          type="button"
                          onClick={removeDesign}
                          className="remove-design-btn"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="explanation-field">
                  <label>Additional Explanation (Optional):</label>
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Add any additional details about your tattoo design..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            <div className="recaptcha-terms-row">
              <div className="recaptcha-container">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptchaChange}
                />
              </div>

              <div className="terms-checkbox">
                <label className="terms-checkbox-label">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                  />
                  <span>
                    I have read and agree to the{' '}
                    <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/terms-and-conditions#privacy-policy" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button Row */}
            <div className="submit-row">
              <button type="submit">Book Appointment</button>
            </div>
          </form>
        )}

        {/* Add FAQ section after the form */}
        {getFaqType() && (
          <div className="booking-faq">
            <FAQ type={getFaqType()} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookingPage;
