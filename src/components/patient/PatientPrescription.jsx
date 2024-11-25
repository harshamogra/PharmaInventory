import React, { useState, useEffect } from "react";

const PatientPrescription = () => {
  const [patientId, setPatientId] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState("");

  // Retrieve the patient ID and token from localStorage when the component mounts
  useEffect(() => {
    const storedPatientId = localStorage.getItem("patientId");
    const token = localStorage.getItem("token"); // Retrieve token for authorization
    console.log(`Stored patient ID: ${storedPatientId}`);

    if (storedPatientId) {
      setPatientId(storedPatientId);
      handleFetchPrescriptions(storedPatientId, token);
    } else {
      setError("Patient ID not found. Please log in.");
    }
  }, []);

  // Fetch prescriptions using the patient ID and token for authorization
  const handleFetchPrescriptions = async (patientId, token) => {
    try {
      console.log(`Fetching prescriptions for patient ID: ${patientId}`);
      const response = await fetch(`http://localhost:5000/api/patient/prescription/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send JWT token in the Authorization header
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching prescriptions:", errorData);
        throw new Error("Failed to fetch prescriptions.");
      }

      const data = await response.json();
      console.log("Prescriptions fetched successfully:", data);
      setPrescriptions(data);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-300 via-blue-500 to-indigo-600 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold text-white text-center mb-8">Your Prescriptions</h2>

        {error && <p className="text-red-600 text-center mb-6">{error}</p>} {/* Display error if exists */}

        {prescriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prescriptions.map((presc) => (
              <div
                key={presc.doctor_id}
                className="bg-white p-8 rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105"
              >
                <div className="mb-4">
                  <p className="text-xl font-semibold text-gray-800">Doctor: {presc.doctor_id}</p>
                </div>
                <div className="mb-4">
                  <p className="text-md font-medium text-gray-600">Medications:</p>
                  <p className="text-lg text-gray-800">{presc.medications}</p>
                </div>
                <div className="mb-4">
                  <p className="text-md font-medium text-gray-600">Instructions:</p>
                  <p className="text-lg text-gray-800">{presc.instructions}</p>
                </div>
                <div>
                  <p className="text-md font-medium text-gray-600">Prescription Date:</p>
                  <p className="text-lg text-gray-800">{presc.prescription_date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white text-center text-xl">No prescriptions found for this Patient ID.</p>
        )}
      </div>
    </div>
  );
};

export default PatientPrescription;
