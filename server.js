require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Serve static files from 'public' directory
app.use(express.static('public'));

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5500",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "https://pragati-backend-production.up.railway.app", // Railway production URL
  // Add your production frontend URL here when deploying
  // Example: "https://your-app.vercel.app"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// --- API ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/worker', require('./routes/worker'));
app.use('/api/contractor', require('./routes/contractor'));

// --- REAL-TIME SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('broadcastJob', (jobDetails) => {
    socket.broadcast.emit('newJobNotification', jobDetails);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// --- START SERVER ---
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Using Supabase PostgreSQL database');
});