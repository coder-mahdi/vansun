import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../layout/Layout";

const API_URL = "http://localhost:8888/vansun/wp-json";

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
        // Fetch product details
        const productRes = await fetch(`${API_URL}/wc-bookings-direct/v1/products`);
        const productData = await productRes.json();
        
        // Find the specific product
        const currentProduct = productData.products.find(p => p.id === parseInt(productId));
        if (currentProduct) {
          setProduct(currentProduct);
          
          // Fetch availability data
          const availabilityRes = await fetch(`${API_URL}/wc-bookings/v1/products/${productId}/availability`);
          const availabilityData = await availabilityRes.json();
          setAvailability(availabilityData);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError("Error loading product data");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  // Update available time slots when date changes
  useEffect(() => {
    if (availability && date) {
      const selectedDateData = availability.available_dates.find(d => d.date === date);
      if (selectedDateData) {
        setAvailableTimeSlots(selectedDateData.slots);
        // Reset time if it's not in the available slots
        if (time && !selectedDateData.slots.some(slot => slot.time === time)) {
          setTime('');
        }
      } else {
        setAvailableTimeSlots([]);
        setTime('');
      }
    }
  }, [date, availability]);

  const handleBooking = async (e) => {
    e.preventDefault();

    // Make sure all required fields are filled
    if (!fullName || !email || !phone || !date || !time) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/custom-booking-endpoint/v1/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          date,
          time,
          product_id: productId
        })
      });

      const data = await res.json();

      if (res.ok) {
        setIsBooked(true);
      } else {
        alert(data.message || "Something went wrong while booking.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Error creating booking. Please try again.");
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
                  {availability?.available_dates.map((dateObj) => (
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
                      {slot.time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
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
