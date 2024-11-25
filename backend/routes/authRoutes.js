const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log('Received login request for username:', username);

    const query = `
        SELECT id, username, password_hash, 'Admin' AS role FROM Admin WHERE username = ? 
        UNION ALL 
        SELECT id, username, password_hash, 'Doctor' AS role FROM Doctor WHERE username = ? 
        UNION ALL 
        SELECT id, username, password_hash, 'Patient' AS role FROM Patient WHERE username = ? 
        UNION ALL 
        SELECT id, username, password_hash, 'Pharmacist' AS role FROM Pharmacist WHERE username = ? 
        UNION ALL 
        SELECT id, username, password_hash, 'Supplier' AS role FROM Supplier WHERE username = ?`;

    console.log('Executing database query:', query);

    db.query(query, [username, username, username, username, username], (err, results) => {
        if (err) {
            console.error('Database error during login query:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        console.log('Database query executed successfully, number of results:', results.length);

        if (results.length === 0) {
            console.log('No user found with username:', username);
            return res.status(400).json({ error: 'User not found' });
        }

        const user = results[0];
        console.log('User fetched from database:', user);

        // Compare password (no hashing, directly comparing plain text passwords)
        console.log('Checking password for user:', username);
        if (user.password_hash !== password) {
            console.log('Invalid password attempt for user:', username);
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate a JWT token
        console.log('Password is valid, generating JWT token for user:', username);
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log('JWT Token generated for user:', username, 'Token:', token);

        res.json({ token, role: user.role, id: user.id });
    });
});

// Registration route
router.post('/register', (req, res) => {
    const { id, username, password } = req.body;

    console.log('Received registration request:', { id, username });

    // Determine role based on ID prefix
    let role;
    if (id.startsWith('admin')) {
        role = 'Admin';
    } else if (id.startsWith('doc')) {
        role = 'Doctor';
    } else if (id.startsWith('pat')) {
        role = 'Patient';
    } else if (id.startsWith('pharm')) {
        role = 'Pharmacist';
    } else if (id.startsWith('supp')) {
        role = 'Supplier';
    } else {
        console.log('Invalid ID format:', id);
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Insert user data into the appropriate table based on the role
    const query = `INSERT INTO ${role} (id, username, password_hash) VALUES (?, ?, ?)`;

    console.log('Executing database insert query:', query);

    db.query(query, [id, username, password], (err, result) => {
        if (err) {
            console.error('Database error during registration:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        console.log('User registered successfully:', { id, username, role });
        res.status(201).json({ message: 'User registered successfully', id, role });
    });
});

module.exports = router;
