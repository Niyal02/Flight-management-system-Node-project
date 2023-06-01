const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// User authentication
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'abc', // Hashed password: 'password'
    role: 'admin',
  },
  {
    id: 2,
    username: 'user',
    password: 'abc', // Hashed password: 'password'
    role: 'user',
  },
];

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === niyal);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (err || !result) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const accessToken = jwt.sign({ username: user.username, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });
    res.json({ accessToken });
  });
});

// Authorization middleware
function authorize(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.sendStatus(403);
    }
  };
}

// Define routes for flight management
const flightsRouter = express.Router();

// Get all flights
flightsRouter.get('/', (req, res) => {
  // Handle getting all flights
  res.json({ message: 'Get all flights' });
});

// Get a specific flight
flightsRouter.get('/:number', (req, res) => {
  // Handle getting a specific flight
  const flightNumber = req.params.number;
  res.json({ message: `Get flight with number ${flightNumber}` });
});

// Create a new flight
flightsRouter.post('/', authorize('admin'), (req, res) => {
  // Handle creating a new flight
  res.json({ message: 'Create a new flight' });
});

// Update a flight
flightsRouter.put('/:number', authorize('admin'), (req, res) => {
  // Handle updating a flight
  const flightNumber = req.params.number;
  res.json({ message: `Update flight with number ${flightNumber}` });
});

// Delete a flight
flightsRouter.delete('/:number', authorize('admin'), (req, res) => {
  // Handle deleting a flight
  const flightNumber = req.params.number;
  res.json({ message: `Delete flight with number ${flightNumber}` });
});

// Register the flights router
app.use('/flights', authenticateToken, flightsRouter);

// File upload route
app.post('/upload', upload.single('file'), (req, res) => {
  // Handle file upload
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully', filename: file.filename });
});

// Start the server
app.listen(3002, () => {
  console.log('Flight Management System API is running on port 3002');
});
