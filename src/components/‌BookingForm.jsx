import React, { useEffect, useState } from 'react';

const BookingForm = ({ availability, onSubmit }) => {
  const [date, setDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [time, setTime] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!date) return;

    const selectedDay = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const filteredTimes = availability
      .filter((slot) => slot.date === selectedDay)
      .map((slot) => slot.start_time);

    setAvailableTimes(filteredTimes);
    setTime(''); // reset time when date changes
  }, [date, availability]);

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
        <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full border p-2 rounded">
          <option value="">Select time</option>
          {availableTimes.map((t, index) => (
            <option key={index} value={t}>{t}</option>
          ))}
        </select>
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
