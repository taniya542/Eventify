
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const eventsRouter = require('./routes/events');

const app = express();
const PORT = 5000;
const eventsPath = path.join(__dirname, '../data/events.json');
// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
//Routes
app.use('/api/events', eventsRouter);



const USER_DATA_PATH = path.join(__dirname, './data/users.json');


// Initialize users file if it doesn't exist
if (!fs.existsSync(USER_DATA_PATH)) {
    fs.writeFileSync(USER_DATA_PATH, JSON.stringify([]));
}

// Helper functions for user data
function readUsers() {
    const data = fs.readFileSync(USER_DATA_PATH, 'utf8');
    return JSON.parse(data);
}

function writeUsers(users) {
    fs.writeFileSync(USER_DATA_PATH, JSON.stringify(users, null, 2));
}

// API Routes
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    const users = readUsers();
    
    if (users.some(user => user.email === email)) {
        return res.status(400).json({ error: 'Email already registered' });
    }
    
    // In production, you should hash the password!
    const newUser = { username, email, password };
    users.push(newUser);
    writeUsers(users);
    
    res.json({ success: true });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = readUsers();
    
    const user = users.find(user => user.email === email && user.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ success: true, username: user.username });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


