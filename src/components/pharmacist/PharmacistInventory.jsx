import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000/api/pharmacist"; // replace with your backend API base URL

const PharmacistInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [prescriptionIdInput, setPrescriptionIdInput] = useState("");
  const [prescriptionDetails, setPrescriptionDetails] = useState(null); // New state for prescription details
  const [orderDrugName, setOrderDrugName] = useState("");
  const [orderQuantity, setOrderQuantity] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [changeRequestMessage, setChangeRequestMessage] = useState(""); // For change request
  const [newSupplierId, setNewSupplierId] = useState(""); // For new supplier input
  const [priceInput, setPriceInput] = useState('');  // Define the state for priceInput
  const [inventoryData, setInventoryData] = useState([]);
  const token = localStorage.getItem('token');
  const pharmacistId = localStorage.getItem('pharmacistId');

  useEffect(() => {
    fetchInventory();
    fetchOrders();
    checkThreshold();
  }, []);

  

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory?pharmacistId=${pharmacistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('Inventory response:', data);
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const checkThreshold = async () => {
    if (!pharmacistId) {
        setErrorMessage('Please enter a pharmacist ID');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/check?pharmacistId=${pharmacistId}`, {
            headers: {
                'Authorization': `Bearer ${token}`, // Add authorization header
            },
        });
        if (!response.ok) {
            throw new Error('Error fetching inventory');
        }
        const data = await response.json();
        setInventoryData(data);
        setErrorMessage('');
    } catch (err) {
        setErrorMessage('Failed to fetch inventory');
        console.error('Error:', err);
    }
};

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders?pharmacistId=${pharmacistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Fetch Prescription Handler
  const handleFetchPrescription = async () => {
    if (!prescriptionIdInput || !pharmacistId) {
      setErrorMessage("Please enter a prescription ID and ensure pharmacistId exists.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionIdInput}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPrescriptionDetails(data); // Set fetched prescription details
        setErrorMessage("");
      } else {
        const error = await response.json();
        setErrorMessage("Failed to fetch prescription: " + error.message);
        setPrescriptionDetails(null); // Clear details on failure
      }
    } catch (error) {
      setErrorMessage("Error fetching prescription: " + error.message);
      setPrescriptionDetails(null);
    }
  };

  const handleFulfillPrescription = async () => {
    if (!prescriptionIdInput || !pharmacistId || !priceInput) {
      setErrorMessage("Please enter a prescription ID, ensure pharmacistId exists, and enter a price.");
      return;
    }
  console.log(priceInput)
    const fulfillmentDate = new Date();
  
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions/fulfill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prescriptionId: prescriptionIdInput,
          pharmacistId: pharmacistId,
          fulfillmentDate: fulfillmentDate.toISOString().slice(0, 10),
          priceInput: parseFloat(priceInput),  // Send the price here
        }),
      });
  
      if (response.ok) {
        setSuccessMessage("Prescription fulfilled successfully.");
        setErrorMessage("");
        setPrescriptionIdInput("");
        setPriceInput("");  // Clear the price input field
        fetchInventory();
        fetchOrders();
      } else {
        const error = await response.json();
        setErrorMessage("Failed to fulfill prescription: " + error.message);
        setSuccessMessage("");
      }
    } catch (error) {
      setErrorMessage("Error fulfilling prescription: " + error.message);
      setSuccessMessage("");
    }
  };
  

  const handlePlaceOrder = async () => {
    if (!orderDrugName || !orderQuantity || !supplierId || !pharmacistId) {
      setErrorMessage("Please enter a drug name, quantity, supplier ID, and ensure pharmacistId exists.");
      return;
    }

    if (!supplierId.startsWith('supp')) {
      setErrorMessage("Supplier ID must start with 'supp'.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          drugName: orderDrugName,
          orderedQuantity: parseInt(orderQuantity, 10),
          pharmacistId: pharmacistId,
          supplierId: supplierId,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Order placed successfully.");
        setErrorMessage("");
        setOrderDrugName("");
        setOrderQuantity("");
        setSupplierId("");
        fetchOrders();
      } else {
        const error = await response.json();
        setErrorMessage("Failed to place order: " + error.message);
        setSuccessMessage("");
      }
    } catch (error) {
      setErrorMessage("Error placing order: " + error.message);
      setSuccessMessage("");
    }
  };

  // Handle Supplier Change Request
  const handleSupplierChangeRequest = async () => {
    if (!newSupplierId || !pharmacistId) {
      setChangeRequestMessage("Please enter a new supplier ID.");
      return;
    }

    if (!newSupplierId.startsWith('supp')) {
      setChangeRequestMessage("Supplier ID must start with 'supp'.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/changesupplier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          pharmacistId: pharmacistId,
          newSupplierId: newSupplierId,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Supplier change request submitted successfully.");
        setErrorMessage("");
        setNewSupplierId("");
      } else {
        const error = await response.json();
        setErrorMessage("Failed to submit supplier change request: " + error.message);
        setSuccessMessage("");
      }
    } catch (error) {
      setErrorMessage("Error submitting supplier change request: " + error.message);
      setSuccessMessage("");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-400">Pharmacist Dashboard</h2>

      {/* Success and Error Messages */}
      {successMessage && <div className="bg-green-200 text-green-800 p-4 rounded mb-4">{successMessage}</div>}
      {errorMessage && <div className="bg-red-200 text-red-800 p-4 rounded mb-4">{errorMessage}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory Card */}
        <div className="bg-blue-100 rounded-lg shadow-lg p-6 animate__animated animate__fadeIn">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Inventory</h3>
          <ul>
            {inventory.map((item, index) => (
              <li key={index} className="border-b py-3">
                <div className="font-medium text-gray-800">{item.drug_name}</div>
                <div className="text-sm text-gray-500">Quantity: {item.quantity} units</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Orders Card */}
        <div className="bg-green-100 rounded-lg shadow-lg p-6 animate__animated animate__fadeIn">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Orders</h3>
          <ul>
            {orders.map((order, index) => (
              <li key={index} className="border-b py-3">
                <div className="font-medium text-gray-800">{order.drug_name}</div>
                <div className="text-sm text-gray-500">Ordered Quantity: {order.ordered_quantity} units</div>
                <div className="text-sm text-gray-500">Status: {order.status}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

        {/* checkThreshold */}
      <div className="bg-blue-100 rounded-lg shadow-lg p-6 animate__animated animate__fadeIn mt-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Drugs with low stock</h3>
        <ul>
          {inventoryData.map((drug, index) => (
            <li key={index} className="border-b py-3">
              <div className="font-medium text-gray-800">{drug.drug_name}</div>
              <div className="text-sm text-gray-500">Quantity: {drug.quantity} units</div>
            </li>
          ))}
        </ul>
      </div>


      {/* Fulfill Prescription Card */}
      {/* Fulfill Prescription Card */}
<div className="bg-yellow-100 rounded-lg shadow-lg p-6 mt-8 animate__animated animate__fadeIn">
  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Fulfill Prescription</h3>
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600">Prescription ID</label>
    <input
      type="text"
      value={prescriptionIdInput}
      onChange={(e) => setPrescriptionIdInput(e.target.value)}
      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
    />
  </div>

  <button
    onClick={handleFetchPrescription}
    className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 w-full"
  >
    Fetch Prescription
  </button>

  {/* Display Prescription Details */}
  {prescriptionDetails && (
    <div className="mt-6 p-4 bg-white border border-gray-300 rounded-lg shadow">
      <h4 className="font-semibold">Prescription Details</h4>
      <p><strong>Doctor ID:</strong> {prescriptionDetails.doctor_id}</p>
      <p><strong>Prescription Date:</strong> {prescriptionDetails.prescription_date}</p>
      <p><strong>Medications:</strong> {prescriptionDetails.medications}</p>
      <p><strong>Instructions:</strong> {prescriptionDetails.instructions}</p>
    </div>
  )}

  {/* Enter Price */}
  <div className="mb-4 mt-6">
    <label className="block text-sm font-medium text-gray-600">Price</label>
    <input
      type="text"
      value={priceInput}
      onChange={(e) => setPriceInput(e.target.value)}
      placeholder="Enter price"
      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
    />
  </div>

  <button
    onClick={handleFulfillPrescription}
    className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 w-full mt-4"
  >
    Fulfill Prescription
  </button>
</div>


      {/* Place Drug Order Card */}
      <div className="bg-red-100 rounded-lg shadow-lg p-6 mt-8 animate__animated animate__fadeIn">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Place Drug Order</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Drug Name</label>
          <input
            type="text"
            value={orderDrugName}
            onChange={(e) => setOrderDrugName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Quantity</label>
          <input
            type="number"
            value={orderQuantity}
            onChange={(e) => setOrderQuantity(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Supplier ID</label>
          <input
            type="text"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          onClick={handlePlaceOrder}
          className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 w-full"
        >
          Place Order
        </button>
      </div>

      {/* Change Supplier Card */}
      <div className="bg-purple-100 rounded-lg shadow-lg p-6 mt-8 animate__animated animate__fadeIn">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Change Supplier</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">New Supplier ID</label>
          <input
            type="text"
            value={newSupplierId}
            onChange={(e) => setNewSupplierId(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          onClick={handleSupplierChangeRequest}
          className="bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 w-full"
        >
          Request Supplier Change
        </button>

        {changeRequestMessage && (
          <div className="mt-4 text-red-500">{changeRequestMessage}</div>
        )}
      </div>
    </div>
  );
};

export default PharmacistInventory;
