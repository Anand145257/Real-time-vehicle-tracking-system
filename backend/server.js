/**
 * server.js
 * Entrypoint for Backend API and WebSocket
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

const SimulationEngine = require('./services/SimulationService');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// CORS enforcement
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Monitoring Endpoint
app.get('/api/status', (req, res) => {
    res.json({ status: 'Backend Production Server Active', uptime: process.uptime() });
});

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Simple hardcoded credentials
    if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign({ id: 1, username }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, user: { username } });
    }
    
    return res.status(401).json({ message: 'Invalid credentials' });
});

// Simulation instances tracker
const activeSimulations = new Map();

// Socket Middleware for Auth
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: Token missing'));
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error: Invalid token'));
        socket.user = decoded;
        next();
    });
});

// Socket Connections
io.on('connection', (socket) => {
    logger.info(`Client connected [ID: ${socket.id}, User: ${socket.user.username}]`);
    
    socket.on('startTracking', () => {
        logger.info(`User initiated Tracking [ID: ${socket.id}]`);
        
        // Clean up any existing simulation for this socket
        if (activeSimulations.has(socket.id)) {
            activeSimulations.get(socket.id).stopLoop();
        }
        
        // Instantiate localized simulation engine targeting strictly this socket
        const engine = new SimulationEngine(socket);
        activeSimulations.set(socket.id, engine);
        
        engine.init().then(() => {
            // Provide exact initial state explicitly after calculating route
            socket.emit('routeUpdate', { route: engine.getCurrentRoute() });
            socket.emit('vehicleUpdate', engine.getInitialPayload());
        }).catch(err => {
            logger.error("Simulation core crashed on init", { error: err.message });
        });
    });

    socket.on('disconnect', () => {
        logger.info(`Client disconnected [ID: ${socket.id}]`);
        if (activeSimulations.has(socket.id)) {
            activeSimulations.get(socket.id).stopLoop();
            activeSimulations.delete(socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;

// Hardened server block
server.listen(PORT, () => {
    logger.info(`Master Server listening securely on port ${PORT} 🚦`);
});

// Catch unhandled errors to avoid crashing production server
process.on('uncaughtException', (err) => {
    logger.error("Uncaught Exception", { message: err.message, stack: err.stack });
});
process.on('unhandledRejection', (reason, promise) => {
    logger.error("Unhandled Rejection", { reason });
});
