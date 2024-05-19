const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Open a connection to the SQLite database
const db = new sqlite3.Database('users.db');

// Route to serve the administrator interface
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'admin.html'));
});

// Route to handle user registration
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    // Insert user into the database with status 'Pending'
    db.run('INSERT INTO users (username, email, password, status) VALUES (?, ?, ?, ?)', [username, email, password, 'Pending'], (err) => {
        if (err) {
            res.status(500).json({ error: 'Failed to register user' });
        } else {
            res.status(200).json({ message: 'Registration request submitted. Please wait for approval.' });
        }
    });
});

// Route to handle registration approval
app.post('/approve-registration', (req, res) => {
    const { email } = req.body;
    // Update user status to 'Approved' in the database
    db.run('UPDATE users SET status = "Approved" WHERE email = ?', [email], (err) => {
        if (err) {
            res.status(500).json({ error: 'Failed to approve registration' });
        } else {
            res.status(200).json({ message: 'Registration approved successfully' });
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
