// api.js
const db = require('./db'); // Import the database connection

// Auth Functions
const authApi = {
    login: (username, password) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
            db.query(query, [username, password], (err, results) => {
                if (err) return reject(err);
                if (results.length > 0) {
                    resolve(results[0]); // User found
                } else {
                    resolve(null); // User not found
                }
            });
        });
    },
};

// Admin Functions
const adminApi = {
    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users';
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },
};

// Doctor Functions
const doctorApi = {
    getPrescriptions: (doctorId) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM prescriptions WHERE doctor_id = ?';
            db.query(query, [doctorId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },
};

// Patient Functions
const patientApi = {
    getPatientInfo: (patientId) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM patients WHERE id = ?';
            db.query(query, [patientId], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]); // Return single patient info
            });
        });
    },
};

// Pharmacist Functions
const pharmacistApi = {
    getInventory: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM inventory';
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },
};

// Supplier Functions
const supplierApi = {
    getSuppliers: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM suppliers';
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },
};

module.exports = {
    authApi,
    adminApi,
    doctorApi,
    patientApi,
    pharmacistApi,
    supplierApi,
};
