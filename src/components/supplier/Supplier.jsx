import React, { useEffect, useState } from "react";
import api from '../../api';

// Supplier component
const Supplier = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  // Get the supplierId from localStorage (or another method if needed)
  const supplierId = localStorage.getItem("supplierId"); // Adjust as needed

  // Get the JWT token from localStorage
  const token = localStorage.getItem("token");

  // Fetch orders on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          setError("No JWT token found. Please login.");
          return;
        }

        // Fetch orders from the server and filter by supplierId
        const ordersResponse = await api.get(
          `/api/supplier/orders?supplierId=${supplierId}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`, // Attach the JWT token here
            },
          }
        );

        if (ordersResponse.status === 200) {
          const ordersData = ordersResponse.data;
          setOrders(ordersData);
        } else {
          setError(ordersResponse.data?.error || "Error fetching orders");
        }
      } catch (error) {
        setError("Error fetching data: " + error.message);
      }
    };

    fetchData();
  }, [supplierId, token]);

  // Handle confirming an order (i.e., fulfilling it)
  const handleConfirmOrder = async (orderId) => {
    const order = orders.find((o) => o.order_id === orderId);

    // If order is found and is still pending, proceed to confirm it
    if (order && order.status === "Pending") {
      try {
        const response = await api.post(
          `/api/supplier/orders/${orderId}/confirm`,
          {
            supplierId: supplierId,
          },
          {
            headers: {
              "Authorization": `Bearer ${token}`, // Attach the JWT token here
            },
          }
        );

        if (response.status === 200) {
          // Update the order status to "Confirmed" in the UI
          setOrders((prevOrders) =>
            prevOrders.map((o) =>
              o.order_id === orderId ? { ...o, status: "Confirmed" } : o
            )
          );
        } else {
          console.error("Error confirming order:", response.data);
        }
      } catch (error) {
        console.error("Error confirming order:", error);
      }
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Supplier Dashboard</h2>

      {error && <p className="text-red-500">{error}</p>}

      <h3 className="text-xl font-semibold mb-4">Orders Received</h3>
      <ul className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <li
              key={order.order_id}
              className="p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg shadow-md animate__animated animate__fadeIn"
            >
              <div><strong>Order ID:</strong> {order.order_id}</div>
              <div><strong>Drug Name:</strong> {order.drug_name}</div>
              <div><strong>Ordered Quantity:</strong> {order.ordered_quantity}</div>
              <div><strong>Status:</strong> {order.status}</div>
              {order.status === "Pending" && (
                <button
                  onClick={() => handleConfirmOrder(order.order_id)}
                  className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 shadow-lg transition duration-300"
                  style={{ backgroundColor: '#FFD700' }} // Golden color scheme
                >
                  Fulfill Order
                </button>
              )}
            </li>
          ))
        ) : (
          <p className="text-gray-600">No orders received.</p>
        )}
      </ul>
    </div>
  );
};

export default Supplier;
