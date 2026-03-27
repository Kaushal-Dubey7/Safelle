require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join_admin', () => {
    socket.join('admin');
    console.log(`Socket ${socket.id} joined admin room`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible to controllers via app
app.set('io', io);

// Connect to DB and start server
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`SAFELLE server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
