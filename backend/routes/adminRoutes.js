const express = require("express");
const router = express.Router();
const db = require("../db");

// Route to get all doctors
router.get("/doctors", (req, res) => {
  db.query("SELECT id, username, specialty FROM doctor", (error, doctors) => {
    if (error) {
      return res.status(500).json({ error: "Failed to retrieve doctors" });
    }
    res.json(doctors);
  });
});

// Route to get all pharmacists
router.get("/pharmacists", (req, res) => {
  db.query("SELECT id, username, pharmacy_location FROM pharmacist", (error, pharmacists) => {
    if (error) {
      return res.status(500).json({ error: "Failed to retrieve pharmacists" });
    }
    res.json(pharmacists);
  });
});

// Route to get all patients
router.get("/patients", (req, res) => {
  db.query("SELECT id, username, date_of_birth, contact_info FROM patient", (error, patients) => {
    if (error) {
      return res.status(500).json({ error: "Failed to retrieve patients" });
    }
    res.json(patients);
  });
});

// Route to get all suppliers
router.get("/suppliers", (req, res) => {
  db.query("SELECT id, name, contact_info, address, username FROM supplier", (error, suppliers) => {
    if (error) {
      return res.status(500).json({ error: "Failed to retrieve suppliers" });
    }
    res.json(suppliers);
  });
});

// Route to edit a doctor (only allows changes to info except id, username, and password)
router.put("/doctors/:id", (req, res) => {
  const { id } = req.params;
  const { username, specialty } = req.body;

  console.log(`Received request to update doctor with id: ${id}`);  // Log the ID of the doctor being updated
  console.log(`Username received: ${username}`);  // Log the received username
  console.log(`Specialty received: ${specialty}`);  // Log the received specialty

  // Check if either username or specialty is provided
  if (!username || !specialty) {
    console.log("Username or specialty is missing.");  // Log if any required field is missing
    return res.status(400).json({ error: "Username and specialty are required" });
  }

  // Execute the update query
  db.query(
    "UPDATE doctor SET username = ?, specialty = ? WHERE id = ?", 
    [username, specialty, id], 
    (error) => {
      if (error) {
        console.error("Error updating doctor:", error);  // Log if an error occurs during the query
        return res.status(500).json({ error: "Failed to update doctor" });
      }

      console.log(`Doctor with id: ${id} updated successfully.`);  // Log a successful update
      res.json({ message: "Doctor updated successfully" });
    }
  );
});


// Route to edit a pharmacist (only allows changes to info except id, username, and password)
router.put("/pharmacists/:id", (req, res) => {
  const { id } = req.params;
  const { username, pharmacy_location } = req.body;

  console.log(`Received request to update pharmacist with id: ${id}`);  // Log the ID of the pharmacist being updated
  console.log(`Username received: ${username}`);  // Log the received username
  console.log(`Pharmacy location received: ${pharmacy_location}`);  // Log the received pharmacy location

  // Check if either username or pharmacy location is provided
  if (!username || !pharmacy_location) {
    console.log("Username or pharmacy location is missing.");  // Log if any required field is missing
    return res.status(400).json({ error: "Username and pharmacy location are required" });
  }

  // Execute the update query
  db.query(
    "UPDATE pharmacist SET username = ?, pharmacy_location = ? WHERE id = ?", 
    [username, pharmacy_location, id], 
    (error) => {
      if (error) {
        console.error("Error updating pharmacist:", error);  // Log if an error occurs during the query
        return res.status(500).json({ error: "Failed to update pharmacist" });
      }

      console.log(`Pharmacist with id: ${id} updated successfully.`);  // Log a successful update
      res.json({ message: "Pharmacist updated successfully" });
    }
  );
});



// Route to edit a patient (only allows changes to info except id, username, and password)
router.put("/patients/:id", (req, res) => {
  const { id } = req.params;
  const { username, contact_info, date_of_birth } = req.body;

  console.log(`Received request to update patient with id: ${id}`);  // Log the ID of the patient being updated
  console.log(`Username received: ${username}`);  // Log the received username
  console.log(`Contact info received: ${contact_info}`);  // Log the received contact info
  console.log(`Date of birth received: ${date_of_birth}`);  // Log the received date of birth

  // Check if all required fields are provided
  if (!username || !contact_info || !date_of_birth) {
    console.log("Username, contact info, or date of birth is missing.");  // Log if any required field is missing
    return res.status(400).json({ error: "Username, contact info, and date of birth are required" });
  }

  // Execute the update query
  db.query(
    "UPDATE patient SET username = ?, contact_info = ?, date_of_birth = ? WHERE id = ?", 
    [username, contact_info, date_of_birth, id], 
    (error) => {
      if (error) {
        console.error("Error updating patient:", error);  // Log if an error occurs during the query
        return res.status(500).json({ error: "Failed to update patient" });
      }

      console.log(`Patient with id: ${id} updated successfully.`);  // Log a successful update
      res.json({ message: "Patient updated successfully" });
    }
  );
});

// Route to edit a supplier (only allows changes to info except id, username, and password)
router.put("/suppliers/:id", (req, res) => {
  const { id } = req.params;
  const { username, contact_info, address } = req.body;

  console.log(`Received request to update supplier with id: ${id}`);  // Log the ID of the supplier being updated
  console.log(`Username received: ${username}`);  // Log the received username  // Log the received name
  console.log(`Contact info received: ${contact_info}`);  // Log the received contact info
  console.log(`Address received: ${address}`);  // Log the received address

  // Check if all required fields are provided
  if (!username || !contact_info || !address) {
    console.log("Username, contact info, or address is missing.");  // Log if any required field is missing
    return res.status(400).json({ error: "Username, name, contact info, and address are required" });
  }

  // Execute the update query
  db.query(
    "UPDATE supplier SET username = ?, contact_info = ?, address = ? WHERE id = ?", 
    [username, contact_info, address, id], 
    (error) => {
      if (error) {
        console.error("Error updating supplier:", error);  // Log if an error occurs during the query
        return res.status(500).json({ error: "Failed to update supplier" });
      }

      console.log(`Supplier with id: ${id} updated successfully.`);  // Log a successful update
      res.json({ message: "Supplier updated successfully" });
    }
  );
});

// Route to delete a doctor
router.delete("/doctors/:id", (req, res) => {
  const { id } = req.params;

  console.log(`Received request to delete doctor with id: ${id}`);

  // Start a transaction to ensure that both doctor and associated prescriptions are deleted
  db.beginTransaction((error) => {
    if (error) {
      console.error("Error starting transaction:", error);
      return res.status(500).json({ error: "Failed to start transaction" });
    }

    // First, delete from the prescriptions table where doctor_id matches
    db.query("DELETE FROM prescriptions WHERE doctor_id = ?", [id], (error) => {
      if (error) {
        console.error(`Error deleting prescriptions for doctor id: ${id}`, error);
        return db.rollback(() => {
          res.status(500).json({ error: "Failed to delete prescriptions" });
        });
      }

      // Then, delete the doctor
      db.query("DELETE FROM doctor WHERE id = ?", [id], (error) => {
        if (error) {
          console.error(`Error deleting doctor with id: ${id}`, error);
          return db.rollback(() => {
            res.status(500).json({ error: "Failed to delete doctor" });
          });
        }

        // If both queries succeed, commit the transaction
        db.commit((error) => {
          if (error) {
            console.error("Error committing transaction:", error);
            return db.rollback(() => {
              res.status(500).json({ error: "Failed to commit transaction" });
            });
          }

          // Log success
          console.log(`Doctor with id: ${id} and their prescriptions deleted successfully`);
          res.json({ message: "Doctor and associated prescriptions deleted successfully" });
        });
      });
    });
  });
});

// Route to delete a pharmacist
router.delete("/pharmacists/:id", (req, res) => {
  const { id } = req.params;
  console.log(`Received request to delete pharmacist with id: ${id}`);

  // Start a transaction to ensure proper deletion across tables
  db.beginTransaction((error) => {
    if (error) {
      console.error("Error starting transaction:", error);
      return res.status(500).json({ error: "Failed to start transaction" });
    }

    // Step 1: Delete the rows in the inventory table associated with the pharmacist
    db.query("DELETE FROM inventory WHERE pharmacist_id = ?", [id], (error) => {
      if (error) {
        console.error(`Error deleting inventory for pharmacist id: ${id}`, error);
        return db.rollback(() => {
          res.status(500).json({ error: "Failed to delete inventory" });
        });
      }

      // Step 2: Delete the rows in the orders table where status is "Pending"
      db.query("DELETE FROM orders WHERE pharmacist_id = ? AND status = 'Pending'", [id], (error) => {
        if (error) {
          console.error(`Error deleting pending orders for pharmacist id: ${id}`, error);
          return db.rollback(() => {
            res.status(500).json({ error: "Failed to delete pending orders" });
          });
        }

        // Step 3: Delete the pharmacist record
        db.query("DELETE FROM pharmacist WHERE id = ?", [id], (error) => {
          if (error) {
            console.error(`Error deleting pharmacist with id: ${id}`, error);
            return db.rollback(() => {
              res.status(500).json({ error: "Failed to delete pharmacist" });
            });
          }

          // Commit the transaction after successful deletion
          db.commit((error) => {
            if (error) {
              console.error("Error committing transaction:", error);
              return db.rollback(() => {
                res.status(500).json({ error: "Failed to commit transaction" });
              });
            }

            console.log(`Pharmacist with id: ${id} and associated inventory and pending orders deleted successfully`);
            res.json({ message: "Pharmacist and associated inventory and pending orders deleted successfully" });
          });
        });
      });
    });
  });
});



// Route to delete a patient
router.delete("/patients/:id", (req, res) => {
  const { id } = req.params;
  console.log(`Received request to delete patient with id: ${id}`);

  // Start a transaction to ensure both patient and associated prescriptions are deleted
  db.beginTransaction((error) => {
    if (error) {
      console.error("Error starting transaction:", error);
      return res.status(500).json({ error: "Failed to start transaction" });
    }

    // First, delete all prescriptions associated with this patient
    db.query("DELETE FROM prescriptions WHERE patient_id = ?", [id], (error) => {
      if (error) {
        console.error(`Error deleting prescriptions for patient id: ${id}`, error);
        return db.rollback(() => {
          res.status(500).json({ error: "Failed to delete prescriptions" });
        });
      }

      // After deleting prescriptions, delete the patient
      db.query("DELETE FROM patient WHERE id = ?", [id], (error) => {
        if (error) {
          console.error(`Error deleting patient with id: ${id}`, error);
          return db.rollback(() => {
            res.status(500).json({ error: "Failed to delete patient" });
          });
        }

        // Commit the transaction after successful deletion
        db.commit((error) => {
          if (error) {
            console.error("Error committing transaction:", error);
            return db.rollback(() => {
              res.status(500).json({ error: "Failed to commit transaction" });
            });
          }

          console.log(`Patient with id: ${id} and their prescriptions deleted successfully`);
          res.json({ message: "Patient and associated prescriptions deleted successfully" });
        });
      });
    });
  });
});


// Route to delete a supplier
router.delete("/suppliers/:id", (req, res) => {
  const { id } = req.params;
  console.log(`Received request to delete supplier with id: ${id}`);

  // Start a transaction to ensure proper deletion across tables
  db.beginTransaction((error) => {
    if (error) {
      console.error("Error starting transaction:", error);
      return res.status(500).json({ error: "Failed to start transaction" });
    }

    // Step 1: Delete the rows in the orders table associated with the supplier
    db.query("DELETE FROM orders WHERE supplier_id = ?", [id], (error) => {
      if (error) {
        console.error(`Error deleting orders for supplier id: ${id}`, error);
        return db.rollback(() => {
          res.status(500).json({ error: "Failed to delete orders" });
        });
      }

      // Step 2: Update the rows in the inventory table to set supplier_id to NULL
      db.query("UPDATE inventory SET supplier_id = NULL WHERE supplier_id = ?", [id], (error) => {
        if (error) {
          console.error(`Error updating inventory for supplier id: ${id}`, error);
          return db.rollback(() => {
            res.status(500).json({ error: "Failed to update inventory" });
          });
        }

        // Step 3: Delete the supplier record
        db.query("DELETE FROM supplier WHERE id = ?", [id], (error) => {
          if (error) {
            console.error(`Error deleting supplier with id: ${id}`, error);
            return db.rollback(() => {
              res.status(500).json({ error: "Failed to delete supplier" });
            });
          }

          // Commit the transaction after successful deletion
          db.commit((error) => {
            if (error) {
              console.error("Error committing transaction:", error);
              return db.rollback(() => {
                res.status(500).json({ error: "Failed to commit transaction" });
              });
            }

            console.log(`Supplier with id: ${id} and associated orders and inventory updated successfully`);
            res.json({ message: "Supplier and associated orders deleted, inventory updated successfully" });
          });
        });
      });
    });
  });
});

router.put('/fulfill-supplier-change/:id', (req, res) => {
  const { id } = req.params;
  const { pharmacist_id, new_supplier_id } = req.body;

  console.log(`Received request to fulfill supplier change for pharmacist: ${pharmacist_id} with new supplier: ${new_supplier_id}`);

  // Call the stored procedure to handle the supplier change
  const query = 'CALL change_supplier(?, ?)';

  db.query(query, [pharmacist_id, new_supplier_id], (err, results) => {
    if (err) {
      console.error('Error fulfilling supplier change request:', err);
      return res.status(500).json({ error: 'Failed to fulfill request' });
    }

    console.log('Supplier change request successfully processed for pharmacist:', pharmacist_id);

    // If everything is successful, send a success response
    res.json({ message: 'Supplier change request fulfilled successfully' });
  });
});


router.get('/supplier-change-requests', (req, res) => {
  const query = "SELECT * FROM changesupplier WHERE status = 'Pending'";

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching supplier change requests:', err);
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }
    res.json(results);
  });
});

router.get("/top-pharmacist", (req, res) => {
  const query = `
    SELECT pharmacist_id, COUNT(*) AS total_fulfillments, SUM(price) AS total_revenue
    FROM prescription_fulfillments
    GROUP BY pharmacist_id
    ORDER BY total_fulfillments DESC, total_revenue DESC, pharmacist_id ASC
    LIMIT 1;
  `;

  db.query(query, (error, result) => {
    if (error) {
      console.error(error);  // For debugging purposes
      return res.status(500).json({ error: "Failed to retrieve top pharmacist" });
    }
    
    // Check if a result is returned
    if (result.length === 0) {
      return res.status(404).json({ error: "No top pharmacist found" });
    }

    res.json(result[0]);  // Send the top pharmacist details
  });
});


module.exports = router;
