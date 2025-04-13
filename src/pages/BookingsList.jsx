import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";

const API_URL = "http://localhost:8888/vansun/wp-json";

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/custom-booking-endpoint/v1/bookings`);
        const data = await response.json();
        
        if (data.success) {
          setBookings(data.bookings);
        } else {
          setError("Failed to load bookings");
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Error loading bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

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
        <h1 className="text-2xl font-bold mb-6">Bookings List</h1>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 border-b text-left">Name</th>
                <th className="px-6 py-3 border-b text-left">Email</th>
                <th className="px-6 py-3 border-b text-left">Phone</th>
                <th className="px-6 py-3 border-b text-left">Product</th>
                <th className="px-6 py-3 border-b text-left">Date</th>
                <th className="px-6 py-3 border-b text-left">Time</th>
                <th className="px-6 py-3 border-b text-left">Status</th>
                <th className="px-6 py-3 border-b text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b">{booking.customer_name}</td>
                  <td className="px-6 py-4 border-b">{booking.customer_email}</td>
                  <td className="px-6 py-4 border-b">{booking.customer_phone}</td>
                  <td className="px-6 py-4 border-b">{booking.product_name}</td>
                  <td className="px-6 py-4 border-b">{booking.start_date.split(' ')[0]}</td>
                  <td className="px-6 py-4 border-b">{booking.start_date.split(' ')[1]}</td>
                  <td className="px-6 py-4 border-b">
                    <span className={`px-2 py-1 rounded text-xs ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      booking.status === 'pending-confirmation' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b">{new Date(booking.date_created).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {bookings.length === 0 && (
          <p className="text-center mt-4 text-gray-500">No bookings found</p>
        )}
      </div>
    </Layout>
  );
};

export default BookingsList; 