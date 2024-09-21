const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { initializeSocket, getSocket } = require('./socket'); // Import socket management
require('dotenv').config();
const userRoutes = require('./routes/UserRoute');
const taskRoutes = require('./routes/TaskRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server); // Initialize the Socket.IO instance
const io = getSocket(); // Get the initialized Socket.IO instance

const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// MongoDB connection
mongoose.connect(process.env.DB_PATH, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

// Session management
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Change to true if using HTTPS
}));

// API routes
app.use('/api/v1/', userRoutes);
app.use('/api/v1/', taskRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('User connected: ', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id);
    });
});

// Invalid URL handling
app.use((req, res) => {
    res.status(404).json({ message: 'Invalid URL' });
});

// Error handler middleware
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong' });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = { io };
