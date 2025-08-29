import React, { useState, useEffect } from "react";
import api from "../../api";

const AdminDashboard = () => {
  const [role, setRole] = useState(""); // Store selected role
  const [doctors, setDoctors] = useState([]);
  const [pharmacists, setPharmacists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierChangeRequests, setSupplierChangeRequests] = useState([]); // New state for supplier change requests
  const [editUser, setEditUser] = useState(null); // Store user to be edited
  const [formData, setFormData] = useState({
    username: '',
    specialty: '', // Only for doctors
    pharmacy_location: '', // Only for pharmacists
    date_of_birth: '', // Only for patients
    contact_info: '', // For patients and suppliers
    address: '', // Only for suppliers
  });
  const [topPharmacist, setTopPharmacist] = useState(null); 
  const token = localStorage.getItem("token");

  // Function to handle user deletion
  const handleDelete = (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      api.delete(`/api/admin/${type}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(() => {
        // Remove the deleted user from the respective list
        if (type === 'doctors') setDoctors(doctors.filter((doctor) => doctor.id !== id));
        if (type === 'pharmacists') setPharmacists(pharmacists.filter((pharmacist) => pharmacist.id !== id));
        if (type === 'patients') setPatients(patients.filter((patient) => patient.id !== id));
        if (type === 'suppliers') setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
      })
      .catch(error => {
        console.error("Error deleting user:", error);
      });
    }
  };

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Function to handle form submission for update
  const handleUpdate = (e) => {
    e.preventDefault();
    const updateData = { ...formData };
    api.put(`/api/admin/${editUser.type}/${editUser.id}`, updateData, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    .then(response => {
      setEditUser(null); // Exit edit mode
      setFormData({ username: '', specialty: '', pharmacy_location: '', date_of_birth: '', contact_info: '', address: '' });
      api.get(`/api/admin/${editUser.type}`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => {
          if (editUser.type === 'doctors') setDoctors(res.data);
          if (editUser.type === 'pharmacists') setPharmacists(res.data);
          if (editUser.type === 'patients') setPatients(res.data);
          if (editUser.type === 'suppliers') setSuppliers(res.data);
        })
        .catch(fetchError => console.error("Error refetching data after update:", fetchError));
    })
    .catch(error => {
      console.error("Error updating user:", error);
    });
  };

  // Fetch users and supplier change requests based on the selected role
  useEffect(() => {
    if (role) {
      api.get(`/api/admin/${role}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).then(response => {
        if (role === "doctors") setDoctors(response.data);
        if (role === "pharmacists") setPharmacists(response.data);
        if (role === "patients") setPatients(response.data);
        if (role === "suppliers") setSuppliers(response.data);
      }).catch(error => console.error("Error fetching users:", error));
    }

    // Fetch supplier change requests sent by pharmacists
    api.get("/api/admin/supplier-change-requests", {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(response => {
      setSupplierChangeRequests(response.data);
    }).catch(error => {
      console.error("Error fetching supplier change requests:", error);
    });
     
    api.get("/api/admin/top-pharmacist", {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        console.log("Response data received:", response.data);
        if (response.data) {
          setTopPharmacist(response.data); // Set the top pharmacist data
          console.log("Top pharmacist data set successfully:", response.data);
        } else {
          console.warn("No data received for top pharmacist.");
        }
      })
      .catch(error => {
        // Log error response if available
        if (error.response) {
          console.error("Error response from server:", error.response);
        } else if (error.request) {
          console.error("No response received from the server:", error.request);
        } else {
          console.error("Error in setting up the request:", error.message);
        }
        console.error("Error fetching top pharmacist:", error);
      });
    
    
  }, [role]);

  const handleEdit = (user, type) => {
    setEditUser({ id: user.id, type });
    setFormData({
      username: user.username || '',
      specialty: user.specialty || '',
      pharmacy_location: user.pharmacy_location || '',
      date_of_birth: user.date_of_birth || '',
      contact_info: user.contact_info || '',
      address: user.address || ''
    });
  };

  // Function to handle fulfilling a supplier change request

const handleFulfillRequest = (id, pharmacist_id, new_supplier_id) => {
  const requestData = {
    pharmacist_id,
    new_supplier_id
  };
  console.log(pharmacist_id,new_supplier_id)
  api.put(`/api/admin/fulfill-supplier-change/${id}`, requestData, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }).then(() => {
    // Remove fulfilled request from the list
    setSupplierChangeRequests(supplierChangeRequests.filter(request => request.id !== id));
  }).catch(error => {
    console.error("Error fulfilling request:", error);
  });
};


return (
  <div className="p-6 max-w-3xl mx-auto bg-gradient-to-r from-red-400 to-blue-400 rounded-lg shadow-lg">
    <h2 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h2>

    {/* Role Selection */}
    <div className="mb-4">
      <label htmlFor="role" className="text-xl font-semibold text-white">Select Role:</label>
      <select
        id="role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">-- Select a Role --</option>
        <option value="doctors">Doctors</option>
        <option value="pharmacists">Pharmacists</option>
        <option value="patients">Patients</option>
        <option value="suppliers">Suppliers</option>
      </select>
    </div>

    {/* Supplier Change Requests Card */}
    <div className="mt-6">
      <h3 className="text-2xl font-semibold mb-4 text-white">Supplier Change Requests</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {supplierChangeRequests.map(request => (
          <div key={request.id} className="bg-white p-4 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
            <p><strong>Pharmacist ID:</strong> {request.pharmacist_id}</p>
            <p><strong>New Supplier ID:</strong> {request.new_supplier_id}</p>
            <p><strong>Request Date:</strong> {new Date(request.request_date).toLocaleString()}</p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => handleFulfillRequest(request.id, request.pharmacist_id, request.new_supplier_id)}
                className="bg-green-500 text-white p-2 rounded transform transition duration-300 ease-in-out hover:scale-105"
              >
                Fulfill
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Top Pharmacist Section */}
    <div className="mt-6">
  {topPharmacist ? (
    <>
      <h3 className="text-2xl font-semibold mb-4 text-white">Top Pharmacist by Fulfillments and Revenue</h3>
      <div className="bg-white p-4 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
        <p><strong>Pharmacist ID:</strong> {topPharmacist.pharmacist_id}</p>
        <p><strong>Fulfillments:</strong> {topPharmacist.total_fulfillments}</p>
        <p><strong>Revenue:</strong> ${topPharmacist.total_revenue}</p>
        <div className="flex justify-between mt-4">
          <button
            onClick={() => alert('Report details for Top Pharmacist')}
            className="bg-green-500 text-white p-2 rounded transform transition duration-300 ease-in-out hover:scale-105"
          >
            View Report
          </button>
        </div>
      </div>
    </>
  ) : (
    <p className="text-white">Loading top pharmacist data...</p>
  )}
</div>



    {/* Existing User Lists Section (Doctors, Pharmacists, etc.) */}
    <div className="mt-6">
      {role && (
        <>
          <h3 className="text-2xl font-semibold mb-4 text-white">{role.charAt(0).toUpperCase() + role.slice(1)}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(role === 'doctors' ? doctors : role === 'pharmacists' ? pharmacists : role === 'patients' ? patients : suppliers).map(user => (
              <div key={user.id} className="bg-white p-4 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
                <h4 className="text-xl font-semibold">{user.username}</h4>
                {role === "doctors" && <p>{user.specialty}</p>}
                {role === "pharmacists" && <p>{user.pharmacy_location}</p>}
                {role === "patients" && <p>{user.date_of_birth}</p>}
                {role === "suppliers" && <p>{user.address}</p>}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleEdit(user, role)}
                    className="bg-blue-500 text-white p-2 rounded transform transition duration-300 ease-in-out hover:scale-105"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id, role)}
                    className="bg-red-500 text-white p-2 rounded transform transition duration-300 ease-in-out hover:scale-105"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>

    {/* Form for Editing User */}
    {editUser && (
      <form onSubmit={handleUpdate} className="mt-6">
        <h3 className="text-2xl font-semibold mb-4 text-white">Edit User</h3>
        <div className="space-y-4">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Username"
            className="w-full p-2 border rounded"
          />
          {role === "doctors" && (
            <input
              type="text"
              name="specialty"
              value={formData.specialty}
              onChange={handleInputChange}
              placeholder="Specialty"
              className="w-full p-2 border rounded"
            />
          )}
          {role === "pharmacists" && (
            <input
              type="text"
              name="pharmacy_location"
              value={formData.pharmacy_location}
              onChange={handleInputChange}
              placeholder="Pharmacy Location"
              className="w-full p-2 border rounded"
            />
          )}
          {role === "patients" && (
            <input
              type="text"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              placeholder="Date of Birth"
              className="w-full p-2 border rounded"
            />
          )}
          <input
            type="text"
            name="contact_info"
            value={formData.contact_info}
            onChange={handleInputChange}
            placeholder="Contact Info"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Address"
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
            Update User
          </button>
        </div>
      </form>
    )}
  </div>
);

};

export default AdminDashboard;
