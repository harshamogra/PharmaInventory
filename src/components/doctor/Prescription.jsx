import React, { useState, useEffect } from "react";
import api from '../../api';

const initialPrescription = {
  patient_id: "",
  doctor_id: "",
  prescription_date: new Date().toISOString().split("T")[0],
  medications: "",
  instructions: "",
};

const Prescription = () => {
  const [prescription, setPrescription] = useState(initialPrescription);
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState("");

  // Function to get the JWT token and user ID (doctor or patient), assuming it's stored in localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token"); // Adjust as per your storage method
  };

  const getUserId = () => {
    return localStorage.getItem("userId"); // Adjust as per your storage method
  };

  const fetchPrescriptions = async () => {
    const token = getAuthToken(); // Retrieve the token

    if (!token) {
      setError("Authorization required. Please log in.");
      return;
    }

    const patientId = getUserId(); // Get patient ID from localStorage
    if (!patientId) {
      setError("Patient ID not found.");
      return;
    }

    try {
      console.log(`Fetching prescriptions for patient ID: ${patientId}`);
      const response = await api.get(`/api/doctor/prescriptions/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send JWT token in Authorization header
        },
      });
      if (response.status !== 200) {
        throw new Error("Failed to fetch prescriptions.");
      }
      const data = response.data;
      console.log("Prescriptions fetched successfully:", data);
      setPrescriptions(data);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating prescription field: ${name} = ${value}`);
    setPrescription({ ...prescription, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting prescription:", prescription);

    const token = getAuthToken(); // Retrieve the token
    const doctorId = getUserId(); // Get doctor ID from localStorage

    if (!token || !doctorId) {
      setError("Authorization required. Please log in.");
      return;
    }

    try {
      const response = await api.post("/api/doctor/prescriptions", {
        patient_id: prescription.patient_id,
        doctor_id: doctorId,
        prescription_date: prescription.prescription_date,
        medications: prescription.medications,
        instructions: prescription.instructions,
      }, {
        headers: {
          Authorization: `Bearer ${token}`, // Send JWT token in Authorization header
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to add prescription.");
      }

      const newPrescription = response.data;
      console.log("Prescription added successfully:", newPrescription);

      // Update the list directly or refetch the data
      setPrescriptions((prevPrescriptions) => [...prevPrescriptions, newPrescription]);
      fetchPrescriptions(); // Refetch the list to ensure it's up-to-date

      setPrescription(initialPrescription);
    } catch (err) {
      console.error("Error adding prescription:", err);
      setError(err.message);
    }
  };

  const handleViewPrescription = (id) => {
    const selectedPrescription = prescriptions.find((p) => p.prescription_id === id);
    if (selectedPrescription) {
      console.log("Viewing prescription details for ID:", id);
      alert(`Patient ID: ${selectedPrescription.patient_id}
        Doctor ID: ${selectedPrescription.doctor_id}
        Medications: ${selectedPrescription.medications}
        Instructions: ${selectedPrescription.instructions}
        Date: ${selectedPrescription.prescription_date}`);
    } else {
      console.log(`Prescription with ID ${id} not found.`);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-700 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white bg-opacity-90 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Create a Prescription</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow-lg rounded-lg">
          <div className="card p-4 bg-indigo-100 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700">Patient ID:</label>
            <input
              type="text"
              name="patient_id"
              value={prescription.patient_id}
              onChange={handleChange}
              required
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="card p-4 bg-indigo-100 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700">Doctor ID:</label>
            <input
              type="text"
              name="doctor_id"
              value={prescription.doctor_id}
              onChange={handleChange}
              required
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="card p-4 bg-indigo-100 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700">Medications:</label>
            <input
              type="text"
              name="medications"
              value={prescription.medications}
              onChange={handleChange}
              required
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="card p-4 bg-indigo-100 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700">Instructions:</label>
            <textarea
              name="instructions"
              value={prescription.instructions}
              onChange={handleChange}
              required
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="card p-4 bg-indigo-100 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              name="prescription_date"
              value={prescription.prescription_date}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
          >
            Add Prescription
          </button>
        </form>
      </div>

      <div className="max-w-4xl mx-auto bg-white bg-opacity-90 mt-12 p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Prescription List</h2>
        <ul className="space-y-4">
          {prescriptions.map((presc) => (
            <li
              key={presc.prescription_id}
              className="p-4 bg-indigo-100 rounded-lg shadow-md"
            >
              <div>
                <strong>Patient ID:</strong> {presc.patient_id}
              </div>
              <div>
                <strong>Doctor ID:</strong> {presc.doctor_id}
              </div>
              <div>
                <strong>Date:</strong> {presc.prescription_date}
              </div>
              <button
                onClick={() => handleViewPrescription(presc.prescription_id)}
                className="mt-2 text-indigo-600 hover:underline"
              >
                View Details
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Prescription;
