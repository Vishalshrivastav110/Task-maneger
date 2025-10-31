const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io configuration
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-task', (taskId) => {
    socket.join(taskId);
    console.log(`User ${socket.id} joined task room: ${taskId}`);
  });
  
  socket.on('leave-task', (taskId) => {
    socket.leave(taskId);
    console.log(`User ${socket.id} left task room: ${taskId}`);
  });
  
  socket.on('task-updated', (data) => {
    socket.to(data.taskId).emit('task-changed', data);
    console.log(`Task ${data.taskId} updated by ${socket.id}`);
  });
  
  socket.on('task-created', (data) => {
    socket.broadcast.emit('new-task', data);
    console.log(`New task created by ${socket.id}`);
  });
  
  socket.on('task-deleted', (data) => {
    socket.to(data.taskId).emit('task-removed', data);
    console.log(`Task ${data.taskId} deleted by ${socket.id}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server running on port ${PORT}`);
});