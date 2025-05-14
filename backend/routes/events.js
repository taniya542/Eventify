const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, '../../backend/data/events.json');

// Helper function to read events
const readEvents = () => {
  try {
    if (!fs.existsSync(eventsPath)) {
      fs.writeFileSync(eventsPath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(eventsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading events:', error);
    return [];
  }
};

// Add this to your events router
router.get('/:id', (req, res) => {
  try {
    const events = readEvents();
    const event = events.find(e => e.id === parseInt(req.params.id));
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});
// Helper function to write events
const writeEvents = (events) => {
  try {
    fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing events:', error);
    return false;
  }
};

// Add new event
router.post('/', (req, res) => {
  try {
    const events = readEvents();
    const newEvent = req.body;
    
    // Generate a numeric ID based on the last event's ID
    const lastId = events.reduce((max, event) => Math.max(max, event.id), 0);
    newEvent.id = lastId + 1;
    
    // Set default values
    newEvent.status = newEvent.status || "upcoming";
    newEvent.isFeatured = newEvent.isFeatured || false;
    newEvent.registrationForm = newEvent.registrationForm || "";
    newEvent.price = newEvent.price || "Free";
    
    // Ensure tags is an array
    if (typeof newEvent.tags === 'string') {
      newEvent.tags = newEvent.tags.split(',').map(tag => tag.trim());
    }
    
    events.push(newEvent);
    
    if (!writeEvents(events)) {
      throw new Error('Failed to write to events file');
    }
    
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ 
      error: 'Failed to add event',
      details: error.message
    });
  }
});

// Get all events
router.get('/', (req, res) => {
  try {
    const events = readEvents();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router;