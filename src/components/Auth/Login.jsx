import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Import MUI icons

const Login = ({ setRole, setUserId }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();

  const handleLoginClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset error message

    try {
      // Send a POST request to the backend for authentication
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });

      // If successful, handle login
      const { token, role, id } = response.data;

      // Store the token, role, and user ID for further use
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', id); // Store the user ID (doctor's ID) locally

      // If the user is a patient, store their ID as patientId as well
      if (role === 'Patient') {
        localStorage.setItem('patientId', id);
      }

      console.log("Redirecting user to:", role);

      if (role === 'Pharmacist'){
        localStorage.setItem('pharmacistId', id);
      }

      if (role === 'Supplier'){
        localStorage.setItem('supplierId', id);
      }

      // Set role and user ID to update the app state
      setRole(role);
      setUserId(id);

      // Navigate to the respective dashboard based on role
      if (role === 'Admin') {
        navigate('/admin');
      } else if (role === 'Doctor') {
        navigate('/doctor');
      } else if (role === 'Patient') {
        navigate('/patient');
      } else if (role === 'Pharmacist') {
        navigate('/pharmacist');
      } else if (role === 'Supplier') {
        navigate('/supplier');
      }

    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        setError(error.response.data.error || "An error occurred. Please try again.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
      {/* Background Image using <img> tag */}
      <img 
        src="/assets/login.jpg" 
        alt="Background" 
        className="absolute top-0 left-0 w-full h-full object-cover opacity-90 z-0" 
      />
  
      {/* Home Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-orange-500 hover:to-orange-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 z-10"
      >
        Home
      </button>
  
      {/* Form Container - Transparent Background with Border and Frosted Glass Effect */}
      <div className="bg-transparent border border-white border-opacity-60 shadow-md rounded-lg p-8 w-96 z-10 backdrop-blur-0">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Login</h2>
        <form onSubmit={handleLoginClick}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-400"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6 relative">
            <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"} // Toggle password visibility
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-400"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 mt-1 text-black" // Set icon color to black
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
            >
              {showPassword ? <VisibilityOff /> : <Visibility />} {/* Show or Hide icon */}
            </button>
          </div>
          {error && <div className="text-red-500 font-bold text-sm mb-4">{error}!</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-orange-500 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
