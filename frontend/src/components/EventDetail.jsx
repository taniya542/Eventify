import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EventDetail.css';
import jsPDF from 'jspdf';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    seats: 1,
  });
  const [ticketData, setTicketData] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/events/${id}`);
        if (!response.ok) throw new Error('Event not found');
        const data = await response.json();
        
        // Initialize availableSeats if it doesn't exist
        if (data.availableSeats === undefined) {
          data.availableSeats = data.seats;
        }
        
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate seats
    if (formData.seats > event.availableSeats) {
      alert(`Only ${event.availableSeats} seats available!`);
      return;
    }

    try {
      // In a real app, you would send this to your backend
      // For now, we'll just update the local state
      const updatedEvent = {
        ...event,
        availableSeats: event.availableSeats - formData.seats
      };

      // Generate ticket data
      const ticket = {
        ...formData,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventLocation: event.location,
        ticketId: `TICKET-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        bookingDate: new Date().toLocaleDateString(),
      };

      // Update state
      setEvent(updatedEvent);
      setTicketData(ticket);
      setShowModal(false);

      // In a real app, you would also:
      // 1. Save the registration to your database
      // 2. Maybe send a confirmation email
      // 3. Update the available seats in persistent storage

    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Generate ticket data
//     const ticket = {
//       ...formData,
//       eventTitle: event.title,
//       eventDate: event.date,
//       eventTime: event.time,
//       eventLocation: event.location,
//       ticketId: `TICKET-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
//       bookingDate: new Date().toLocaleDateString(),
//     };
//     setTicketData(ticket);
//     // Here you would typically send the data to your backend
//     // For now, we'll just show the ticket
//     setShowModal(false);
//   };

  const generateTicketPDF = () => {
    const doc = new jsPDF();
    
    // Ticket styling
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Event title
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('EVENTIFY TICKET', 105, 20, null, null, 'center');
    
    // Ticket ID
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Ticket ID: ${ticketData.ticketId}`, 105, 30, null, null, 'center');
    
    // Divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 40, 190, 40);
    
    // Event details
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(ticketData.eventTitle, 20, 50);
    
    doc.setFontSize(12);
    doc.text(`Date: ${ticketData.eventDate}`, 20, 60);
    doc.text(`Time: ${ticketData.eventTime}`, 20, 70);
    doc.text(`Location: ${ticketData.eventLocation}`, 20, 80);
    
    // Attendee details
    doc.text(`Attendee: ${ticketData.name}`, 20, 95);
    doc.text(`Email: ${ticketData.email}`, 20, 105);
    doc.text(`Phone: ${ticketData.phone}`, 20, 115);
    doc.text(`Seats: ${ticketData.seats}`, 20, 125);
    
    // Booking date
    doc.text(`Booked on: ${ticketData.bookingDate}`, 20, 140);
    
    // QR code placeholder (you can implement actual QR code generation)
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('QR Code Placeholder', 140, 160);
    doc.rect(140, 100, 50, 50);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for using Eventify!', 105, 280, null, null, 'center');
    doc.text('Present this ticket at the event entrance.', 105, 285, null, null, 'center');
    
    doc.save(`Eventify-Ticket-${ticketData.ticketId}.pdf`);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!event) return <div className="error">Event not found</div>;

return (
<div className="event-detail-container">
      {/* Registration Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <h2>Register for {event.title}</h2>
            <p className="seats-available">
              Seats available: {event.availableSeats} of {event.seats}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Number of Seats (Max: {event.availableSeats})</label>
                <input
                  type="number"
                  name="seats"
                  min="1"
                  max={event.availableSeats}
                  value={formData.seats}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="submit-button"
                disabled={event.availableSeats <= 0}
              >
                {event.availableSeats <= 0 ? 'Sold Out' : 'Confirm Registration'}
              </button>
            </form>
          </div>
        </div>
      )}



      {/* Ticket Display Modal */}
      {ticketData && (
        <div className="modal-overlay">
          <div className="ticket-content">
            <button className="close-modal" onClick={() => setTicketData(null)}>
              &times;
            </button>
            <h2>Your Ticket for {ticketData.eventTitle}</h2>
            
            <div className="ticket-preview">
              <div className="ticket-header">
                <h3>EVENTIFY TICKET</h3>
                <p>Ticket ID: {ticketData.ticketId}</p>
              </div>
              
              <div className="ticket-details">
                <div className="event-info">
                  <h4>{ticketData.eventTitle}</h4>
                  <p>Date: {ticketData.eventDate}</p>
                  <p>Time: {ticketData.eventTime}</p>
                  <p>Location: {ticketData.eventLocation}</p>
                </div>
                
                <div className="attendee-info">
                  <h4>Attendee Information</h4>
                  <p>Name: {ticketData.name}</p>
                  <p>Email: {ticketData.email}</p>
                  <p>Phone: {ticketData.phone}</p>
                  <p>Seats: {ticketData.seats}</p>
                </div>
                
                <div className="qr-code-placeholder">
                  {/* In a real app, you would generate an actual QR code here */}
                  <div className="qr-code-box">QR Code</div>
                  <p>Scan at entrance</p>
                </div>
              </div>
              
              <div className="ticket-footer">
                <p>Booked on: {ticketData.bookingDate}</p>
                <p>Please present this ticket at the event entrance</p>
              </div>
            </div>
            
            <button onClick={generateTicketPDF} className="download-button">
              Download Ticket (PDF)
            </button>
            <button 
              onClick={() => setTicketData(null)} 
              className="close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back to Events
      </button>
      
      <div className="event-header">
        <h1>{event.title}</h1>
        <div className="event-meta">
          <span><i className="far fa-calendar"></i> {event.date}</span>
          <span><i className="far fa-clock"></i> {event.time}</span>
          <span><i className="fas fa-map-marker-alt"></i> {event.location}</span>
        </div>
      </div>

      <div className="event-image-container">
        <img src={event.imageUrl} alt={event.title} />
      </div>

      <div className="event-content">
        <div className="event-description">
          <h2>About This Event</h2>
          <p>{event.description}</p>
        </div>

        <div className="event-details">
          <div className="detail-section">
            <h3>Organizer</h3>
            <p>{event.organizer}</p>
          </div>

          <div className="detail-section">
            <h3>Audience</h3>
            <p>{event.audience}</p>
          </div>

          <div className="detail-section">
            <h3>Price</h3>
            <p>{event.price}</p>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="register-button"
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;