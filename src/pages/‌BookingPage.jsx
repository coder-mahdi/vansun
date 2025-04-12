// src/pages/BookingPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../layout/Layout";
import BookingForm from "../components/‌BookingForm";

const API_URL = "http://localhost:8888/vansun/wp-json";

const BookingPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/wc/v3/products/${productId}?consumer_key=ck_xxx&consumer_secret=cs_xxx`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };

    const fetchAvailability = async () => {
      try {
        const res = await fetch(`${API_URL}/acf/v3/product/${productId}`);
        const data = await res.json();
        setAvailability(data.acf.availability || []);
      } catch (err) {
        console.error("Error fetching availability:", err);
      }
    };

    fetchProduct();
    fetchAvailability();
  }, [productId]);

  const isAvailable = (date, time) => {
    const selectedDay = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    console.log("Checking availability for:");
    console.log("Date:", date);
    console.log("Day of week:", selectedDay);
    console.log("Time:", time);
    console.log("Availability slots:", availability);
  

    return availability.some((slot) => {
      return (
        slot.date === selectedDay &&
        time >= slot.start_time &&
        time < slot.end_time
      );
    });
  };

  const handleBooking = async (bookingData) => {
    const { date, time, fullName, email, phone } = bookingData;

    if (!isAvailable(date, time)) {
      alert("Selected date and time are not available.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/custom-booking-endpoint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          date,
          time,
          fullName,
          email,
          phone,
        }),
      });

      if (res.ok) {
        setIsBooked(true);
      } else {
        alert("Something went wrong while booking.");
      }
    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  if (!product) return <p>Loading product...</p>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
        <img src={product.images?.[0]?.src} alt={product.name} className="w-full max-w-sm mb-4" />
        <div dangerouslySetInnerHTML={{ __html: product.description }} className="mb-6" />

        {isBooked ? (
          <p className="text-green-600 font-medium">Your appointment was successfully booked!</p>
        ) : (
          <BookingForm availability={availability} onSubmit={handleBooking} />
        )}
      </div>
    </Layout>
  );
};

export default BookingPage;
