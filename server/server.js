const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const handleSocketConnection = require('./socket/socketHandler');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Dynamic CORS configuration ignoring trailing slashes & handling Vercel/Netlify origins
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow server-to-server or non-browser requests

    const cleanOrigin = origin.replace(/\/+$/, '');
    const envClient = (process.env.CLIENT_URL || '*').replace(/\/+$/, '');

    if (
      envClient === '*' ||
      cleanOrigin === envClient ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.endsWith('.netlify.app') ||
      cleanOrigin.includes('localhost')
    ) {
      return callback(null, true);
    }

    return callback(null, true); // Fallback permission for deployments
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS to Express
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Socket.IO setup with matching CORS
const io = new Server(server, {
  cors: corsOptions
});

// Attach Socket logic
handleSocketConnection(io);

const PORT = process.env.PORT || 5000;

// API Routes (Primary and fallback aliases)
const authRoutes = require('./routes/authRoutes');
const partyRoutes = require('./routes/partyRoutes');

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/parties', partyRoutes);
app.use('/parties', partyRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Watch Party API & Socket Server is active and connected',
    timestamp: new Date().toISOString()
  });
});

// Global 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

server.listen(PORT, () => {
  console.log(`Server & Socket.IO running on port ${PORT}`);
});
