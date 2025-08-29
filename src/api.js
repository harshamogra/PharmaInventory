import axios from 'axios';

// Base URL configuration - change this for different environments
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
