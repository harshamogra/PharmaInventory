import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/home/Home";
import Login from "./components/Auth/Login";
import RegistrationForm from "./components/Auth/RegistrationForm"; // New import for RegistrationForm
import AdminDashboard from "./components/admin/AdminDashboard";
import Prescription from "./components/doctor/Prescription";
import PatientPrescription from "./components/patient/PatientPrescription";
import PharmacistInventory from "./components/pharmacist/PharmacistInventory";
import Supplier from "./components/supplier/Supplier";

const App = () => {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("");

  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedRole = localStorage.getItem('role');

    if (storedUserId && storedRole) {
      setUserId(storedUserId);
      setRole(storedRole);
    }
  }, []);

  const handleUnauthorizedAccess = () => {
    console.log("Redirecting to Home due to insufficient permissions.");
    return <Home />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setRole={setRole} setUserId={setUserId} />} />
        <Route path="/register" element={<RegistrationForm />} /> {/* New route for RegistrationForm */}
        <Route
          path="/admin"
          element={isLoggedIn() && role === 'Admin' ? (
            <AdminDashboard />
          ) : (
            handleUnauthorizedAccess()
          )}
        />
        <Route
          path="/doctor"
          element={isLoggedIn() && role === 'Doctor' ? (
            <Prescription />
          ) : (
            handleUnauthorizedAccess()
          )}
        />
        <Route
          path="/patient"
          element={isLoggedIn() && role === 'Patient' ? (
            <PatientPrescription />
          ) : (
            handleUnauthorizedAccess()
          )}
        />
        <Route
          path="/pharmacist"
          element={isLoggedIn() && role === 'Pharmacist' ? (
            <PharmacistInventory />
          ) : (
            handleUnauthorizedAccess()
          )}
        />
        <Route
          path="/supplier"
          element={isLoggedIn() && role === 'Supplier' ? (
            <Supplier />
          ) : (
            handleUnauthorizedAccess()
          )}
        />
        <Route path="*" element={<Home />} /> {/* Redirect unknown routes to Home */}
      </Routes>
    </Router>
  );
};

export default App;
