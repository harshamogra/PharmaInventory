const express = require('express');
const db = require('../db');
const router = express.Router();

// Middleware to verify doctor role and ensure the logged-in doctor can create prescriptions
const verifyDoctor = (req, res, next) => {
    console.log('Verifying doctor role...');
    console.log('User role:', req.user?.role);
    console.log('Logged-in doctor ID:', req.user?.id);

    if (req.user && req.user.role === 'Doctor') {
        console.log('Doctor role verified');
        const doctorIdFromRequest = (req.params.doctorId || req.body.doctor_id || '').trim().toLowerCase();
        console.log(doctorIdFromRequest)
        const loggedInDoctorId = (req.user.id || '').trim().toLowerCase();

        console.log('Doctor ID from request:', doctorIdFromRequest);
        console.log('Logged-in doctor ID (normalized):', loggedInDoctorId);

        if (doctorIdFromRequest && doctorIdFromRequest === loggedInDoctorId) {
            console.log('Logged-in doctor matches the doctor ID in the request');
            next();
        } else {
            console.log('Unauthorized: Logged-in doctor cannot create prescriptions for another doctor\'s patients');
            res.status(403).json({ error: 'Unauthorized: You can only create prescriptions for your own patients' });
        }
    } else {
        console.log('Unauthorized: Only doctors can access this resource');
        res.status(403).json({ error: 'Unauthorized: Only doctors can access this resource' });
    }
};


// Get all prescriptions for a specific doctor
router.get('/prescriptions/:doctorId', verifyDoctor, (req, res) => {
    const { doctorId } = req.params;
    console.log(`Fetching prescriptions for doctor ID: ${doctorId}`);

    db.query(
        'SELECT * FROM Prescriptions WHERE doctor_id = ?',
        [doctorId],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'An error occurred while fetching prescriptions' });
            }
            console.log(`Found ${results.length} prescriptions for doctor ID: ${doctorId}`);
            if (results.length === 0) {
                console.log('No prescriptions found for this doctor');
                return res.status(404).json({ message: 'No prescriptions found for this doctor' });
            }
            res.json(results);
        }
    );
});

// Add a new prescription
router.post('/prescriptions', verifyDoctor, (req, res) => {
    const { patient_id, doctor_id, prescription_date, medications, instructions } = req.body;

    console.log('Received data for new prescription:', req.body);

    // Validate input data
    if (!patient_id || !doctor_id || !prescription_date || !medications || !instructions) {
        console.log('Validation failed: Missing required fields');
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Ensure the doctor_id in the request matches the logged-in doctor's ID
    if (doctor_id !== req.user.id) {
        console.log('Error: Mismatch between logged-in doctor ID and provided doctor ID');
        return res.status(403).json({ error: 'You can only create prescriptions for yourself' });
    }

    console.log('Inserting new prescription into the database');
    db.query(
        'INSERT INTO Prescriptions (patient_id, doctor_id, prescription_date, medications, instructions) VALUES (?, ?, ?, ?, ?)',
        [patient_id, doctor_id, prescription_date, medications, instructions],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'An error occurred while adding the prescription' });
            }
            console.log(`Prescription created successfully with ID: ${results.insertId}`);
            res.status(201).json({ 
                message: 'Prescription created successfully',
                prescription_id: results.insertId
            });
        }
    );
});

module.exports = router;
