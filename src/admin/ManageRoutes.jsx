// src/pages/ManageRoutes.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import MapSelector from "../components/MapSelector";

function ManageRoutes() {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/bus") // ✅ Ensure this endpoint returns JSON
      .then((res) => {
        setBuses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bus data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Manage Bus Routes</h2>

      {loading ? (
        <p>Loading buses...</p>
      ) : buses.length === 0 ? (
        <p>No buses found.</p>
      ) : (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "30px" }}>
          {buses.map((bus) => (
            <div
              key={bus.bus_number}
              onClick={() => setSelectedBus(bus)}
              style={{
                padding: "10px 15px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: selectedBus?.bus_number === bus.bus_number ? "#f0f8ff" : "#fff",
              }}
            >
              <h4>Bus #{bus.bus_number}</h4>
              <p><strong>From:</strong> {bus.from}</p>
              <p><strong>To:</strong> {bus.to}</p>
            </div>
          ))}
        </div>
      )}

      {selectedBus && (
        <div>
          <h3>Map View for Bus #{selectedBus.bus_number}</h3>
          <MapSelector from={selectedBus.from} to={selectedBus.to} />
        </div>
      )}
    </div>
  );
}

export default ManageRoutes;
