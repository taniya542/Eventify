import React from 'react';
import { useParams } from 'react-router-dom';

const BookingConfirmation = () => {
  const { bookingId } = useParams();

  return (
    <div className="booking-confirmation">
      <h2>Booking Confirmed!</h2>
      <p>Your booking ID: {bookingId}</p>
      {/* Additional confirmation details */}
    </div>
  );
};

export default BookingConfirmation;