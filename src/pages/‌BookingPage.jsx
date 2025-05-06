import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../layout/Layout";

const API_URL = "https://vansunstudio.com/cms/wp-json";
const WOO_API_URL = "https://vansunstudio.com/cms/wp-json/wc/v3";
// TODO: Replace these with your actual WooCommerce API keys
const CONSUMER_KEY = "ck_bdffc7c83f1a21a48c38db54b0d860d22a114021"; // Replace with your actual Consumer Key
const CONSUMER_SECRET = "cs_74e57602afa5b7ded03243824214072179910ce8"; // Replace with your actual Consumer Secret

const BookingPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [isBooked, setIsBooked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for form data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        console.log('=== FETCHING WOOCOMMERCE PRODUCT DATA ===');
        
        const productRes = await fetch(
          `${WOO_API_URL}/products/${productId}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`
        );
        
        if (!productRes.ok) {
          throw new Error(`Failed to fetch product: ${productRes.status}`);
        }
        
        const productData = await productRes.json();
        const metaData = productData.meta_data || [];
        
        // Get booking meta data
        const bookingMeta = {
          enabled: metaData.find(meta => meta.key === '_booking_enabled')?.value,
          duration: metaData.find(meta => meta.key === '_booking_duration')?.value || 1,
          durationUnit: metaData.find(meta => meta.key === '_booking_duration_unit')?.value || 'hour',
          startDate: metaData.find(meta => meta.key === '_booking_start_date')?.value,
          endDate: metaData.find(meta => meta.key === '_booking_end_date')?.value,
          workingHours: metaData.find(meta => meta.key === '_booking_working_hours')?.value
        };

        // Parse working hours from WooCommerce meta data
        const workingHours = bookingMeta.workingHours ? JSON.parse(bookingMeta.workingHours) : {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' }
        };

        // Generate dates for next 30 days
        const dates = [];
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 30);

        let currentDate = new Date(today);
        while (currentDate <= endDate) {
          dates.push(currentDate.toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Generate time slots for each date
        const availability = dates.map(date => {
          const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          const slots = [];
          
          const dayHours = workingHours[dayOfWeek];
          if (dayHours) {
            const [startHour, startMinute] = dayHours.start.split(':').map(Number);
            const [endHour, endMinute] = dayHours.end.split(':').map(Number);
            
            let currentTime = new Date();
            currentTime.setHours(startHour, startMinute, 0);
            
            const endTime = new Date();
            endTime.setHours(endHour, endMinute, 0);
            
            while (currentTime < endTime) {
              const slotStart = currentTime.toTimeString().slice(0, 5);
              currentTime.setHours(currentTime.getHours() + bookingMeta.duration); // Use duration from WooCommerce
              const slotEnd = currentTime.toTimeString().slice(0, 5);
              
              if (currentTime <= endTime) {
                slots.push({
                  time: slotStart,
                  end_time: slotEnd
                });
              }
            }
          }

          return {
            date,
            slots
          };
        });

        console.log('Generated Availability:', availability);
        setAvailability(availability);
        
        setProduct({
          id: productData.id,
          title: productData.name,
          price: productData.price,
          description: productData.description
        });
        
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError(`Error loading product data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  // Update available time slots when date changes
  useEffect(() => {
    if (availability && date) {
      const selectedDateData = availability.find(avail => avail.date === date);
      if (selectedDateData) {
        setAvailableTimeSlots(selectedDateData.slots || []);
      } else {
        setAvailableTimeSlots([]);
        setTime('');
      }
    }
  }, [date, availability]);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !phone || !date || !time) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      console.log('=== CREATING BOOKING ===');
      
      const bookingData = {
        title: `Booking for ${product?.title} - ${fullName}`,
        status: 'publish',
        type: 'wc_booking',
        acf: {
          full_name: fullName,
          phone: phone,
          date: date,
          time: time,
          product_id: parseInt(productId),
          email_address: email
        }
      };
      
      console.log('Sending booking data:', bookingData);

      const res = await fetch(`${API_URL}/wp/v2/wc_booking`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Basic ${btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`)}`
        },
        body: JSON.stringify(bookingData)
      });

      console.log('Booking Response Status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Booking Error Response:', errorText);
        throw new Error(`Booking failed: ${res.status} ${errorText}`);
      }

      const data = await res.json();
      console.log('Booking Response:', data);

      setIsBooked(true);
      alert('Your booking has been created successfully!');
    } catch (error) {
      console.error("Booking error:", error);
      alert(`Error creating booking: ${error.message}`);
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
        <h1 className="text-2xl font-bold mb-4">Book Your {product?.title}</h1>

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
                  {availability?.map((avail, index) => (
                    <option key={`${avail.date}-${index}`} value={avail.date}>
                      {new Date(avail.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
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
                  disabled={!date}
                >
                  <option value="">Select a time</option>
                  {availableTimeSlots.map((slot, index) => (
                    <option key={`${slot.time}-${index}`} value={slot.time}>
                      {slot.time} - {slot.end_time}
                    </option>
                  ))}
                </select>
              </div>
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
