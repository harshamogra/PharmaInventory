import React, { useState } from "react";
import api from '../../api';
import { useNavigate } from "react-router-dom"; // Import useNavigate

const RegistrationForm = () => {
  const [id, setId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate ID to ensure it follows the known formats
    const validPrefixes = ["admin", "doc", "pat", "pharm", "supp"];
    const isValidId = validPrefixes.some((prefix) => id.startsWith(prefix));

    console.log("ID validation result:", isValidId);

    if (!isValidId) {
      alert("Invalid ID format. Please check your ID.");
      console.error("Invalid ID format. ID provided:", id);
      return;
    }

    console.log("Payload being sent:", {
      id,
      username,
      password,
    });

    try {
      console.log("Sending registration request to the server...");
      const response = await api.post("/api/auth/register", {
        id,
        username,
        password,
      });

      console.log("Server response status:", response.status);

      if (response.status === 201) {
        console.log("Registration successful.");
        alert("Registration successful!");
        navigate("/login"); // Redirect to the login page after successful registration
      } else {
        console.warn("Registration failed. Server did not return status 201.");
        alert("Registration failed.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-700"
      style={{
        backgroundImage: "url('assets/register.jpg')", // Replace with your image URL
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md p-8 bg-transparent border border-whit rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-gray-200 mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="id">
              ID:
            </label>
            <input
              type="text"
              id="id"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                console.log("ID input changed:", e.target.value);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="username">
              Username:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                console.log("Username input changed:", e.target.value);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                console.log("Password input changed.");
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-orange-500 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
