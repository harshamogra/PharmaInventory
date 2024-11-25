const express = require('express');
const db = require('../db');
const router = express.Router();



// Route to fetch inventory
// Route to fetch inventory based on pharmacistId
router.get('/inventory', (req, res) => {
    const { pharmacistId } = req.query;  // Get pharmacistId from the request body

    console.log('Fetching inventory for pharmacistId:', pharmacistId);

    // Modify query if pharmacistId is related to inventory, else you can ignore it if unnecessary
    db.query('SELECT drug_name, quantity FROM Inventory WHERE pharmacist_id = ?', [pharmacistId], (err, results) => {
        if (err) {
            console.error('Error fetching inventory:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log('Inventory fetched successfully:', results);
        res.json(results);
    });
});

// Route to fetch orders based on pharmacistId
router.get('/orders', (req, res) => {
    const { pharmacistId } = req.query;  // Get pharmacistId from the request body

    console.log('Fetching orders for pharmacistId:', pharmacistId);

    // Fetch orders specific to the pharmacistId
    db.query('SELECT * FROM orders WHERE pharmacist_id = ?', [pharmacistId], (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log('Orders fetched successfully:', results);
        res.json(results);
    });
});

// Route to fulfill a prescription
router.post('/prescriptions/fulfill', (req, res) => {
    const { pharmacistId, prescriptionId, fulfillmentDate, priceInput } = req.body;
    console.log(`Fulfilling prescription: ${prescriptionId} by pharmacist: ${pharmacistId} ${priceInput} `);

    db.query('SELECT * FROM prescriptions WHERE prescription_id = ?', [prescriptionId], (err, results) => {
        if (err) {
            console.error('Error fetching prescription:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            console.error('Prescription not found:', prescriptionId);
            return res.status(404).json({ error: 'Prescription not found' });
        }

        const prescription = results[0];
        const medications = prescription.medications.split(',');
        console.log(`Medications to fulfill: ${medications}`);

        // Fetch the inventory for the specific pharmacist
        db.query('SELECT * FROM Inventory WHERE pharmacist_id = ?', [pharmacistId], (err, inventory) => {
            if (err) {
                console.error('Error fetching inventory:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            const inventoryMap = new Map();
            inventory.forEach((drug) => {
                console.log(`Adding drug to inventory map: ${drug.drug_name}`);
                inventoryMap.set(drug.drug_name.trim().toLowerCase(), drug);  // Normalize drug name
            });

            // Check each medication
            for (const medication of medications) {
                const medicationTrimmed = medication.trim().toLowerCase(); // Normalize medication name
                console.log(`Checking inventory for medication: ${medicationTrimmed}`);

                const inventoryItem = inventoryMap.get(medicationTrimmed);

                if (!inventoryItem) {
                    console.error(`Drug ${medicationTrimmed} not found in inventory`);
                    return res.status(404).json({ error: `Drug ${medicationTrimmed} not found in inventory` });
                }

                const quantityToReduce = 1;
                if (inventoryItem.quantity < quantityToReduce) {
                    console.error(`Not enough stock for ${medicationTrimmed}`);
                    return res.status(400).json({ error: `Not enough stock for ${medicationTrimmed}` });
                }

                // Update the inventory based on pharmacist_id and drug_name
                db.query(
                    'UPDATE Inventory SET quantity = quantity - ? WHERE pharmacist_id = ? AND drug_name = ?',
                    [quantityToReduce, pharmacistId, medicationTrimmed],
                    (err) => {
                        if (err) {
                            console.error(`Failed to update inventory for ${medicationTrimmed}:`, err);
                            return res.status(500).json({ error: `Failed to update inventory for ${medicationTrimmed}` });
                        }
                        console.log(`Inventory updated for ${medicationTrimmed}`);
                    }
                );
            }

            // Record the prescription fulfillment
            db.query(
                'INSERT INTO prescription_fulfillments (prescription_id, pharmacist_id, fulfill_date, price) VALUES (?, ?, ?, ?)',
                [prescriptionId, pharmacistId, fulfillmentDate, priceInput],
                (err) => {
                    if (err) {
                        console.error('Error recording prescription fulfillment:', err);
                        return res.status(500).json({ error: 'Database error while recording fulfillment' });
                    }
                    console.log('Prescription fulfilled successfully');
                    res.json({ message: 'Prescription fulfilled successfully' });
                }
            );
        });
    });
});

// Route to place a drug order
router.post('/orders', (req, res) => {
    const { drugName, orderedQuantity, supplierId, pharmacistId } = req.body;  // Get pharmacistId from the body
    const orderDate = new Date();

    console.log(`Placing order for drug: ${drugName}, quantity: ${orderedQuantity}, pharmacistId: ${pharmacistId}`);

    // Call the check_positive_quantity function to verify if the ordered quantity is valid
    const query = 'SELECT check_positive_quantity(?) AS is_valid_quantity';
    
    db.query(query, [orderedQuantity], (err, results) => {
        if (err) {
            console.error('Error checking quantity:', err);
            return res.status(500).json({ error: 'Database error while checking quantity' });
        }

        const isValidQuantity = results[0].is_valid_quantity;

        if (isValidQuantity) {
            // Proceed with placing the order
            db.query(
                'INSERT INTO orders (supplier_id, drug_name, ordered_quantity, order_date, status, pharmacist_id) VALUES (?, ?, ?, ?, ?, ?)',
                [supplierId, drugName, orderedQuantity, orderDate, 'Pending', pharmacistId],
                (err) => {
                    if (err) {
                        console.error('Error placing order:', err);
                        return res.status(500).json({ error: 'Database error while placing order' });
                    }
                    console.log('Order placed successfully for drug:', drugName);
                    res.json({ message: 'Order placed successfully' });
                }
            );
        } else {
            console.log('Ordered quantity cannot be negative');
            res.status(400).json({ error: 'Ordered quantity cannot be negative' });
        }
    });
});

router.post('/changesupplier', (req, res) => {
    const { pharmacistId, newSupplierId } = req.body;

    // Validate the input
    if (!pharmacistId || !newSupplierId) {
        return res.status(400).json({ message: 'Pharmacist ID and New Supplier ID are required.' });
    }

    if (!newSupplierId.startsWith('supp')) {
        return res.status(400).json({ message: 'Supplier ID must start with "supp".' });
    }

    // Insert the supplier change request into the database
    const query = `
      INSERT INTO changesupplier (pharmacist_id, new_supplier_id, request_date)
      VALUES (?, ?, NOW());
    `;
    const values = [pharmacistId, newSupplierId];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error processing supplier change request:', err);
            return res.status(500).json({ message: 'Internal server error. Please try again later.' });
        }

        // Send a success response
        res.status(201).json({
            message: 'Supplier change request submitted successfully.',
            changeRequestId: results.insertId, // Use insertId for MySQL
        });
    });
});

router.get('/prescriptions/:prescription_id', (req, res) => {
    const { prescription_id } = req.params;
  
    // Validate if prescription_id is provided
    if (!prescription_id) {
      return res.status(400).json({ error: 'Prescription ID is required.' });
    }
  
    // SQL query to fetch specific fields from the prescription
    const query = `
      SELECT doctor_id, prescription_date, medications, instructions
      FROM prescriptions
      WHERE prescription_id = ?
    `;
  
    db.query(query, [prescription_id], (err, results) => {
      if (err) {
        console.error('Error fetching prescription:', err);
        return res.status(500).json({ error: 'Failed to fetch prescription.' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'Prescription not found.' });
      }
  
      // Return the fetched details
      res.status(200).json(results[0]);
    });
  });
  //nested query
  router.get('/check', (req, res) => {
    const { pharmacistId } = req.query;  // Get pharmacistId from the request query
    console.log(pharmacistId);
    console.log('Fetching inventory for pharmacistId:', pharmacistId);

    // Modify the query to include a nested query that checks for drugs with quantity less than 10
    const query = `
        SELECT drug_name, quantity 
        FROM Inventory 
        WHERE pharmacist_id = ? 
        AND drug_name IN (
            SELECT drug_name 
            FROM Inventory 
            WHERE quantity < 10
        )
    `;

    db.query(query, [pharmacistId], (err, results) => {
        if (err) {
            console.error('Error fetching inventory:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log('Inventory fetched successfully:', results);
        res.json(results);
    });
});
  
module.exports = router;
