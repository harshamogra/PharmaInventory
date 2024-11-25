const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db'); // Ensure your database connection is set up correctly
const jwt = require('jsonwebtoken'); // Import JWT

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const pharmacistRoutes = require('./routes/pharmacistRoutes');
const supplierRoutes = require('./routes/supplierRoutes');

// Middleware for JWT verification
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(403); // Forbidden

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/doctor', authenticateToken, doctorRoutes);
app.use('/api/patient', authenticateToken, patientRoutes);
app.use('/api/pharmacist', authenticateToken, pharmacistRoutes);
app.use('/api/supplier', authenticateToken, supplierRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
