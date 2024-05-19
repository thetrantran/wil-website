const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'frontend')));


// Temporary storage for registered users (replace this with a database in production)
let registeredUsers = [];

// Dummy campaign data (replace with database)
let campaigns = [];



const adminUser = { username: 'admin@gmail.com', password: 'admin@123' }; // username and password can be change for admin
// Serve the login page as the landing page
const isAdminAuthenticated = (req, res, next) => {
    if (req.session.admin) {
        // Admin is authenticated, proceed to the next middleware/route handler
        next();
    } else {
        // Admin is not authenticated, redirect to the login page
        res.redirect('/login.html');
    }
};
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'frontend', 'login.html'));
});
// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        // User is authenticated, proceed to the next middleware/route handler
        next();
    } else {
        // User is not authenticated, redirect to the login page
        res.redirect('/login.html');
    }
};

// Route to serve the create campaign page (accessible only to authenticated users)
app.get('/create_campaign.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'frontend', 'create_campaign.html'));
});

// Route to handle campaign creation (accessible only to authenticated users)
app.post('/campaigns', isAuthenticated, (req, res) => {
    const { type, title, description } = req.body;
    if (type && title && description) {
        const campaign = { id: campaigns.length + 1, type, title, description, approved: false };
        campaigns.push(campaign);
        res.status(201).json({ message: 'Campaign created successfully' });
    } else {
        res.status(400).json({ error: 'Type, title, and description are required' });
    }
});

// Route to get all campaigns
app.get('/campaigns', (req, res) => {
    res.json({ campaigns });
});



// Routes for login, registration, and logout 
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    // Check if the user is admin
    if (email === adminUser.username && password === adminUser.password) {
        // Set admin session
        req.session.admin = true;
        res.redirect('/admin.html'); // Redirect to admin page after login
    } else {
        // Check if the email and password match a registered user
        const user = registeredUsers.find(u => u.email === email && u.password === password);
        if (user) {
            // Set user session
            req.session.user = user;
            res.redirect('/index.html'); // Redirect to index page after user login
        } else {
            res.status(401).send('Invalid credentials pleage login with valid email and password'); // Send error if login fails
        }
    }

});
app.get('/admin.html', (req, res) => {
    if (req.session.admin) {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'admin.html'));
    } else {
        res.redirect('/login.html');
    }
});
// Route to get all campaigns (accessible to authenticated users)
app.get('/admin/campaigns', isAdminAuthenticated, (req, res) => {
    try {
        console.log('Fetching campaigns...');
        res.json({ campaigns });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Route to approve a campaign (accessible only to admin)
// Route to approve a campaign (accessible only to admin)
app.post('/admin/approve_campaign', isAdminAuthenticated, (req, res) => {
    const { campaignId } = req.body;
    const parsedCampaignId = parseInt(campaignId);
    if (!Number.isNaN(parsedCampaignId)) {
        const campaign = campaigns.find(c => c.id === parsedCampaignId);
        if (campaign) {
            campaign.approved = true;
            res.status(200).json({ message: 'Campaign approved successfully' });
        } else {
            res.status(404).json({ error: 'Campaign not found' });
        }
    } else {
        res.status(400).json({ error: 'Invalid campaign ID' });
    }
});

// Route to delete a campaign (accessible only to admin)
app.post('/admin/delete_campaign', isAdminAuthenticated, (req, res) => {
    const { campaignId } = req.body;
    const parsedCampaignId = parseInt(campaignId);
    if (!Number.isNaN(parsedCampaignId)) {
        const campaignIndex = campaigns.findIndex(c => c.id === parsedCampaignId);
        if (campaignIndex !== -1) {
            campaigns.splice(campaignIndex, 1);
            res.status(200).json({ message: 'Campaign deleted successfully' });
        } else {
            res.status(404).json({ error: 'Campaign not found' });
        }
    } else {
        res.status(400).json({ error: 'Invalid campaign ID' });
    }
});



app.post('/register', (req, res) => {
    
    const { username, email, password } = req.body;
    // Check if email already exists
    if (registeredUsers.find(user => user.email === email)) {
        res.status(400).send('Email already registered');
    } else {
        // Store user data temporarily (replace with proper database storage)
        registeredUsers.push({ username, email, password });
       
      
       // Redirect to login page (server-side redirection)
       res.redirect('/login.html');
        
    }
    // Implement registration logic
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login.html'); // Redirect to login page
    });
    // Implement logout logic
});


// Serve static files
app.use(express.static('frontend'));
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
