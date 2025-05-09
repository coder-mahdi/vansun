import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Layout from "../layout/Layout";
import { fetchPageBySlug } from "../utils/api";
import ReCAPTCHA from "react-google-recaptcha";

const API_URL = "https://vansunstudio.com/cms/wp-json/vansunstudio/v1";
const RECAPTCHA_SITE_KEY = "6Lez4zErAAAAAPakygMDjCAZ2yRZt-hVSKbGQNJ0";

const BookingPage = () => {
  const { productId } = useParams();
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
  const recaptchaRef = useRef();

  // Fetch available dates
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);

        const dates = [];
        for (let d = new Date(today); d <= nextMonth; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().split('T')[0]);
        }

        setAvailableDates(dates.map(dateStr => ({
          date: dateStr,
          day: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' })
        })));
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
        
        // Fetch product details and availability rules
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
          
          // Set default time slots based on product availability rules
          if (productData.availability_rules) {
            const timeSlots = productData.availability_rules
              .filter(rule => rule.type === 'time:range')
              .map(rule => ({
                time: rule.from,
                end_time: rule.to
              }));
            
            if (timeSlots.length > 0) {
              setAvailableTimeSlots(timeSlots);
            } else {
              // Default time slots if no specific rules are defined
              setAvailableTimeSlots([
                { time: '09:00', end_time: '10:00' },
                { time: '10:00', end_time: '11:00' },
                { time: '11:00', end_time: '12:00' },
                { time: '12:00', end_time: '13:00' },
                { time: '13:00', end_time: '14:00' },
                { time: '14:00', end_time: '15:00' },
                { time: '15:00', end_time: '16:00' },
                { time: '16:00', end_time: '17:00' }
              ]);
            }
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
        const page = await fetchPageBySlug('booknow-data');
        const acfData = page?.acf?.['book-now'] || [];
        const productAcfData = acfData.find(item => item.woocommerce_product_id === parseInt(productId));
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
              setAvailableTimeSlots(dateSpecificSlots);
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
        terms_accepted: true
      };

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
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Book Your {productTitle || 'Appointment'}</h1>

        {isBooked ? (
          <p className="text-green-600 font-medium">Your appointment was successfully booked!</p>
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

            <div className="recaptcha-container my-4">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
              />
            </div>

            {/* Submit Button Row */}
            <div className="submit-row">
              <button type="submit">Book Appointment</button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default BookingPage;
