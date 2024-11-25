const express = require('express');
const db = require('../db');
const router = express.Router();

// Middleware to verify patient
const verifyPatient = (req, res, next) => {
  if (req.user.role === 'Patient') next();
  else res.status(403).json({ error: 'Unauthorized' });
};

// Get prescriptions for a patient
router.get('/prescription/:patientId', verifyPatient, (req, res) => {
  console.log('Endpoint hit for patient ID:', req.params.patientId);
  const { patientId } = req.params;

  // Query to fetch prescriptions
  db.query(
    'SELECT doctor_id, medications, instructions, prescription_date FROM Prescriptions WHERE patient_id = ?',
    [patientId],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        console.log('No prescriptions found for patient ID:', patientId);
        return res.status(404).json({ message: 'No prescriptions found for this patient.' });
      }

      console.log("Prescriptions found:", results);
      res.json(results);
    }
  );
});


module.exports = router;
