// src/components/BookingForm.jsx
import React, { useState } from 'react';

const BookingForm = ({ onSubmit }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!date || !time || !fullName || !email || !phone) {
      alert('Please fill in all fields.');
      return;
    }

    const bookingData = {
      date,
      time,
      fullName,
      email,
      phone,
    };

    onSubmit(bookingData);
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form space-y-4 max-w-md mx-auto mt-6">
      <div>
        <label>Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border p-2 rounded" />
      </div>

      <div>
        <label>Time:</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full border p-2 rounded" />
      </div>

      <div>
        <label>Full Name:</label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border p-2 rounded" />
      </div>

      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded" />
      </div>

      <div>
        <label>Phone:</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border p-2 rounded" />
      </div>

      <button type="submit" className="bg-black text-white px-4 py-2 rounded">Book Appointment</button>
    </form>
  );
};

export default BookingForm;
