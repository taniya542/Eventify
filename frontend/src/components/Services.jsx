import React, { useState, useEffect } from "react";
import "./Services.css";
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const [showEvents, setShowEvents] = useState(true);
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedTags, setSelectedTags] = useState([]);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    audience: "",
    organizer: "",
    status: "upcoming",
    tags: [],
    imageUrl: "",
    isFeatured: false,
    seats: "",
    price: "",
    registrationForm: true
  });

  const navigate = useNavigate();

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  const allTags = Array.from(
    new Set(events.flatMap(event => event.tags || []))
  ).sort();

  const handleToggle = () => {
    setShowEvents((prev) => !prev);
  };

  const toggleEventExpand = (eventId) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const filteredEvents = events.filter((event) => {
    // Status filter
    if (activeFilter !== "all" && event.status !== activeFilter) return false;

    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!(
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      )) {
        return false;
      }
    }

    // Date range filter
    if (dateFilter.startDate || dateFilter.endDate) {
      const eventDate = new Date(event.date);
      const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
      const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

      if (startDate && eventDate < startDate) return false;
      if (endDate && eventDate > endDate) return false;
    }

    // Tag filter
    if (selectedTags.length > 0) {
      if (!event.tags || !event.tags.some(tag => selectedTags.includes(tag))) {
        return false;
      }
    }

    return true;
  });

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddEventClick = () => {
    setShowAddEventForm(true);
  };

  const handleFormClose = () => {
    setShowAddEventForm(false);
    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      audience: "",
      organizer: "",
      status: "upcoming",
      tags: [],
      imageUrl: "",
      isFeatured: false,
      seats: "",
      price: "",
      registrationForm: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setNewEvent(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ['title', 'description', 'date', 'time', 'location', 'audience', 'organizer'];
    const missingFields = requiredFields.filter(field => !newEvent[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEvent,
          tags: typeof newEvent.tags === 'string' ?
            newEvent.tags.split(',').map(tag => tag.trim()) :
            newEvent.tags
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add event');
      }

      const createdEvent = await response.json();
      setEvents(prev => [...prev, createdEvent]);

      handleFormClose();
      alert('Event added successfully!');

    } catch (error) {
      console.error('Error submitting event:', error);
      alert(`Failed to add event: ${error.message}`);
    }
  };

  const handleBookNow = () => {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLSeUeSZ5hv9XY3E_PdAKbGN_hrzNOvsST_wTukZhD2iV9sBjZw/viewform?usp=sharing", "_blank");
  };

  return (
    <div className="college-events" id="events">
      <div className="events-header">
        <h2 className="section-title">Campus Events</h2>
        <p className="section-subtitle">
          Discover academic, cultural, and social events happening on campus
        </p>

        <div className="controls">
          <div className="search-add-container">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="add-event-btn" onClick={handleAddEventClick}>
              <i className="fas fa-plus-circle"></i> Add Your Event
            </button>
          </div>


          <div className="filter-row">
  {/* Date Range Filter */}
  <div className="date-filter">
    <div className="date-input-group">
      <label>From:</label>
      <input
        type="date"
        value={dateFilter.startDate}
        onChange={(e) => setDateFilter(prev => ({
          ...prev,
          startDate: e.target.value
        }))}
      />
    </div>
    <div className="date-input-group">
      <label>To:</label>
      <input
        type="date"
        value={dateFilter.endDate}
        onChange={(e) => setDateFilter(prev => ({
          ...prev,
          endDate: e.target.value
        }))}
      />
    </div>
    {(dateFilter.startDate || dateFilter.endDate) && (
      <button 
        className="clear-date-filter"
        onClick={() => setDateFilter({ startDate: '', endDate: '' })}
      >
        Clear Dates
      </button>
    )}
  </div>

  {/* Tag Filter */}
  <div className="tag-filter">
    <div className="tag-filter-label">Filter by Tags:</div>
    <div className="tag-buttons">
      {allTags.map(tag => (
        <button
          key={tag}
          className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
          onClick={() => handleTagToggle(tag)}
        >
          {tag}
        </button>
      ))}
      {selectedTags.length > 0 && (
        <button 
          className="clear-tags-btn"
          onClick={() => setSelectedTags([])}
        >
          Clear Tags
        </button>
      )}
    </div>
  </div>
</div>

          <div className="controls-row">
            <button
              className={`toggle-btn ${showEvents ? 'active' : ''}`}
              onClick={handleToggle}
            >
              {showEvents ? (
                <>
                  <i className="fas fa-eye-slash"></i> Hide Events
                </>
              ) : (
                <>
                  <i className="fas fa-eye"></i> Show Events
                </>
              )}
            </button>

            <div className="filter-buttons">
              <button
                className={`filter-btn ${activeFilter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveFilter('upcoming')}
              >
                <i className="fas fa-calendar-alt"></i> Upcoming
              </button>
              <button
                className={`filter-btn ${activeFilter === 'past' ? 'active' : ''}`}
                onClick={() => setActiveFilter('past')}
              >
                <i className="fas fa-history"></i> Past Events
              </button>
              <button
                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                <i className="fas fa-list"></i> All Events
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEvents && (
        <div className="events-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div className={`event-card ${event.status}`} key={event.id}>
                <div className="event-badge">
                  {event.status === 'upcoming' ? (
                    <span className="upcoming-badge">Upcoming</span>
                  ) : (
                    <span className="past-badge">Completed</span>
                  )}
                  {event.isFeatured && <span className="featured-badge">Featured</span>}
                </div>

                <div className="event-image-container">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="event-image"
                    loading="lazy"
                  />
                </div>

                <div className="event-content">
                  <div className="event-date-time">
                    <span><i className="far fa-calendar"></i> {event.date}</span>
                    <span><i className="far fa-clock"></i> {event.time}</span>
                  </div>

                  <h3 className="event-title">{event.title}</h3>

                  <div className="event-tags">
                    {event.tags.map(tag => (
                      <span key={tag} className="event-tag">{tag}</span>
                    ))}
                  </div>

                  <div className="event-footer">
                    <div className="event-actions">
                      {event.status === 'upcoming' ? (
                        <button
                          className="book-now-btn"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          Read More
                        </button>
                      ) : (
                        <button className="view-photos-btn" disabled>
                          <i className="fas fa-images"></i> View Gallery
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events-message">
              <i className="far fa-calendar-times fa-3x"></i>
              <p>No {activeFilter} events found{searchTerm ? ' matching your search' : ''}.</p>
              {searchTerm && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Event Popup Form */}
      {showAddEventForm && (
        <div className="modal-overlay">
          <div className="add-event-modal">
            <div className="modal-header">
              <h3>Add New Event</h3>
              <button className="close-btn" onClick={handleFormClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-group">
                <label>Event Title*</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description*</label>
                <textarea
                  name="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date*</label>
                  <input
                    type="date"
                    name="date"
                    value={newEvent.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Time*</label>
                  <input
                    type="time"
                    name="time"
                    value={newEvent.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location*</label>
                  <input
                    type="text"
                    name="location"
                    value={newEvent.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Target Audience*</label>
                  <input
                    type="text"
                    name="audience"
                    value={newEvent.audience}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Organizer Name/Department*</label>
                <input
                  type="text"
                  name="organizer"
                  value={newEvent.organizer}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={newEvent.tags.join(', ')}
                  onChange={handleTagsChange}
                  placeholder="e.g., workshop, seminar, cultural"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={newEvent.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-group">
                  <label>Available Seats (optional)</label>
                  <input
                    type="number"
                    name="seats"
                    value={newEvent.seats}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (if any)</label>
                  <input
                    type="text"
                    name="price"
                    value={newEvent.price}
                    onChange={handleInputChange}
                    placeholder="Free or $10.00"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={newEvent.isFeatured}
                      onChange={(e) => setNewEvent(prev => ({
                        ...prev,
                        isFeatured: e.target.checked
                      }))}
                    />
                    Featured Event
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleFormClose}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Submit Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;