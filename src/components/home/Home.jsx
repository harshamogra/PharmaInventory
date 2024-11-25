import React from "react";
import { useNavigate } from "react-router-dom";


const Home = () => {
  const navigate = useNavigate(); // Hook to programmatically navigate

  const handleLoginRedirect = () => {
    navigate("/login"); // Redirect to the login page
  };

  const handleRegisterRedirect = () => {
    navigate("/register"); // Redirect to the register page
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen">
      <img 
        src="/assets/home.jpg" 
        alt="Background" 
        className="absolute top-0 left-0 w-full h-full object-cover" 
      />
      <div className="bg-transparent border border-white border-opacity-60 bg-opacity-70 p-8 rounded-lg shadow-2xl max-w-lg mx-auto z-10">
        <h1 className="text-4xl font-extrabold text-white mb-6">
          Welcome to the Pharmaceutical Management System
        </h1>
        <p className="text-white text-lg mb-8">
          Manage prescriptions, inventory, and more with ease.
        </p>
        <div className="flex space-x-6 justify-center">
          <button
            onClick={handleLoginRedirect}
            className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-orange-500 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Login
          </button>
          <button
            onClick={handleRegisterRedirect}
            className="bg-gradient-to-r from-orange-800 to-red-950 hover:from-orange-600 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};
export default Home;
