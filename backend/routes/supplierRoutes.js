const express = require('express');
const router = express.Router(); // Ensure this line is present
const db = require('../db');

// Route to get all pending orders for the supplier
router.get("/orders", (req, res) => {
  const supplierId = req.query.supplierId; // Assuming supplierId is sent in the query parameters
  console.log("Fetching orders for supplierId:", supplierId);

  // Query to fetch orders with details from supplier and pharmacist tables
  db.query(
    `SELECT o.order_id, o.drug_name, o.ordered_quantity, o.order_date, o.status, 
            s.name AS supplier_name, s.contact_info AS supplier_contact, 
            p.username AS pharmacist_username
     FROM orders o
     JOIN supplier s ON o.supplier_id = s.id
     LEFT JOIN pharmacist p ON o.pharmacist_id = p.id
     WHERE o.status = 'Pending' AND o.supplier_id = ?`,
    [supplierId],
    (error, results) => {
      if (error) {
        console.log("Error fetching orders:", error);
        return res.status(500).json({ error: "Failed to retrieve orders" });
      }
      console.log("Orders fetched:", results);
      res.json(results);
    }
  );
});

// Route to confirm and fulfill an order
router.post("/orders/:id/confirm", (req, res) => {
  const { id } = req.params;
  console.log(id);

  // Fetch pharmacist_id using order_id
  db.query(
    `SELECT pharmacist_id, drug_name, ordered_quantity, supplier_id 
     FROM orders WHERE order_id = ? AND status = 'Pending'`,
    [id],
    (error, results) => {
      if (error) {
        console.log("Error fetching order details:", error);
        return res.status(500).json({ error: "Failed to fetch order details" });
      }

      if (results.length === 0) {
        console.log("Order not found or not pending:", id);
        return res.status(404).json({ error: "Order not found or already confirmed" });
      }

      const { pharmacist_id, drug_name, ordered_quantity, supplier_id } = results[0];
      console.log("Fetched pharmacist_id:", pharmacist_id);

      // First, try to update the inventory
      db.query(
        `UPDATE inventory i
         SET i.quantity = i.quantity + ?, i.last_order_date = CURDATE()
         WHERE i.drug_name = ? AND i.supplier_id = ? AND i.pharmacist_id = ?`,
        [ordered_quantity, drug_name, supplier_id, pharmacist_id],
        (updateError, updateResult) => {
          if (updateError) {
            console.log("Error updating inventory:", updateError);
            return res.status(500).json({ error: "Failed to update inventory" });
          }

          if (updateResult.affectedRows === 0) {
            // Drug not found in inventory, need to insert new entry
            console.log("Drug not found in inventory, inserting new record");

            db.query(
              `INSERT INTO inventory (pharmacist_id, drug_name, quantity, supplier_id, last_order_date)
               VALUES (?, ?, ?, ?, CURDATE())`,
              [pharmacist_id, drug_name, ordered_quantity, supplier_id],
              (insertError, insertResult) => {
                if (insertError) {
                  console.log("Error inserting new inventory record:", insertError);
                  return res.status(500).json({ error: "Failed to insert new inventory record" });
                }

                console.log("New inventory record inserted for drug:", drug_name);
                // After inserting, proceed to update the order status
                confirmOrderStatus(id, supplier_id, res);
              }
            );
          } else {
            // Inventory updated successfully, proceed to update the order status
            confirmOrderStatus(id, supplier_id, res);
          }
        }
      );
    }
  );
});

// Function to confirm the order status after updating inventory
const confirmOrderStatus = (orderId, supplierId, res) => {
  db.query(
    `UPDATE orders
     SET status = 'Confirmed'
     WHERE order_id = ? AND status = 'Pending' AND supplier_id = ?`,
    [orderId, supplierId],
    (updateError, updateResult) => {
      if (updateError) {
        console.log("Error confirming order status:", updateError);
        return res.status(500).json({ error: "Failed to confirm order status" });
      }

      if (updateResult.affectedRows === 0) {
        console.log("Order not found or already confirmed:", orderId);
        return res.status(404).json({ error: "Order not found or already confirmed" });
      }

      console.log("Order confirmed successfully for order_id:", orderId);
      res.json({ message: "Order confirmed and inventory updated" });
    }
  );
};

module.exports = router;
