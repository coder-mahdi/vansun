import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../layout/Layout";

const API_URL = "https://vansunstudio.com/cms/wp-json/wc-bookings/v1";
const CONSUMER_KEY = "ck_44d32257666864a9026ec404789951b93a88aeca";
const CONSUMER_SECRET = "cs_dc01b9d6f3523dc2313989f18178a9146c78afd6";

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
        const productRes = await fetch(`${API_URL}/products/${productId}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`);
        const productData = await productRes.json();
        
        if (productData) {
          setProduct(productData);
          
          // Fetch availability data
          const availabilityRes = await fetch(`${API_URL}/products/slots?product_id=${productId}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`);
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
      // Filter slots for the selected date
      const slotsForDate = availability.records.filter(slot => {
        const slotDate = new Date(slot.date).toISOString().split('T')[0];
        return slotDate === date && slot.available > 0;
      });

      // Format time slots
      const formattedSlots = slotsForDate.map(slot => ({
        time: new Date(slot.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        end_time: new Date(new Date(slot.date).getTime() + slot.duration * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      }));

      setAvailableTimeSlots(formattedSlots);
      
      // Reset time if it's not in the available slots
      if (time && !formattedSlots.some(slot => slot.time === time)) {
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
      // Convert date and time to ISO format
      const startDate = new Date(`${date}T${time}`);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour

      const res = await fetch(`${API_URL}/bookings?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product_id: parseInt(productId),
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          all_day: false,
          customer_id: 0,
          status: "unpaid",
          meta_data: [
            {
              key: "full_name",
              value: fullName
            },
            {
              key: "email",
              value: email
            },
            {
              key: "phone",
              value: phone
            }
          ]
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

  // Get unique available dates from records
  const availableDates = availability?.records
    ? [...new Set(availability.records
        .filter(slot => slot.available > 0)
        .map(slot => new Date(slot.date).toISOString().split('T')[0]))]
        .map(dateStr => ({
          date: dateStr,
          day: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' })
        }))
    : [];

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Book Your {product?.name}</h1>

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
