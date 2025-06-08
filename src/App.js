import React, { useState, useEffect } from "react";
import axios from "axios";
import MapSelector from "./components/MapSelector.jsx";
import Dashboard from "./components/dashboard.js";
import "./App.css";
import { LoadScript } from "@react-google-maps/api";

function App() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [busLocation, setBusLocation] = useState(null); // State for live bus location

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 11.0168, lng: 76.9558 }); // Default fallback
        }
      );
    } else {
      setUserLocation({ lat: 11.0168, lng: 76.9558 });
    }
  }, []);

  useEffect(() => {
    const fetchBusLocation = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/location");
        setBusLocation(response.data.current_location); // Update bus location
      } catch (error) {
        console.error("Error fetching bus location:", error);
      }
    };

    const interval = setInterval(fetchBusLocation, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLoadMap = () => {
    setIsApiLoaded(true);
  };

  const handleShowResult = async () => {
    if (!from.trim() || !to.trim()) {
      setError("Please enter both From and To locations.");
      return;
    }

    setError("");
    setLoading(true);
    setShowMap(true);
    setShowDashboard(false);
    await fetchBusData();
    setLoading(false);
  };

  const fetchBusData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/bus`, {
        params: {
          from: from.trim(),
          to: to.trim(),
          ...(userLocation && { lat: userLocation.lat, lng: userLocation.lng }),
        },
      });

      if (response.data && response.data.length > 0) {
        setBuses(response.data);
        setSelectedBus(response.data[0]);
        setError("");
      } else {
        setBuses([]);
        setError("No buses found for the given route.");
      }
    } catch (err) {
      console.error("API Error:", err);
      setBuses([]);
      setError("Error fetching bus details. Please try again later.");
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      onLoad={handleLoadMap}
    >
      <div className="main-wrapper">
        <div className="form-section">
          <div className="container">
            <h1>Seat Detection App 🚌</h1>

            {!showMap && !showDashboard && (
              <div className="form-fields">
                <input
                  type="text"
                  placeholder="From (e.g., Gandhipuram)"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="To (e.g., Ukkadam)"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
                <button onClick={handleShowResult}>Show Result</button>
                <button onClick={() => setShowDashboard(true)}>
                  📊 View Analytics Dashboard
                </button>
                {error && <p className="error">{error}</p>}
              </div>
            )}

            {showDashboard ? (
              <>
                <Dashboard />
                <button
                  className="back-button"
                  onClick={() => setShowDashboard(false)}
                >
                  🔙 Back to Bus View
                </button>
              </>
            ) : showMap ? (
              <>
                <div className="bus-cards-container">
                  <div className="bus-cards">
                    {loading ? (
                      <p className="info-message">Loading bus details...</p>
                    ) : buses.length > 0 ? (
                      buses.map((bus, index) => (
                        <div
                          key={index}
                          className={`bus-card ${
                            selectedBus?.busNumber === bus.busNumber
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => setSelectedBus(bus)}
                        >
                          <h3>🚌 {bus.busNumber}</h3>
                          <p>📍 {bus.from} → 📍 {bus.to}</p>
                          <p>🚪 Empty Seats: {bus.emptySeats}</p>
                          <p>📊 Status: {bus.status}</p>
                          <p>🕑 Schedule: {bus.schedule.join(", ")}</p>
                          <div>
                            <p>📌 Stops:</p>
                            <ul>
                              {bus.stops.map((stop, i) => (
                                <li key={i}>{stop.name}</li>
                              ))}
                            </ul>
                          </div>
                          {bus.image_url && (
                            <img
                              src={bus.image_url}
                              alt={`Bus ${bus.busNumber}`}
                              style={{
                                width: "100%",
                                height: "150px",
                                objectFit: "cover",
                                marginTop: "10px",
                                borderRadius: "4px",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="info-message">
                        No buses found for this route
                      </p>
                    )}
                  </div>
                </div>

                {isApiLoaded && busLocation && selectedBus && (
                  <div className="map-container">
                    <MapSelector
                      from={selectedBus.from}
                      to={selectedBus.to}
                      waypoints={selectedBus.waypoints || []}
                      currentLocation={busLocation}
                    />
                  </div>
                )}

                <div className="buttons-row">
                  <button
                    className="back-button"
                    onClick={() => {
                      setShowMap(false);
                      setBuses([]);
                      setSelectedBus(null);
                    }}
                  >
                    🔙 Back to Search
                  </button>
                  <button
                    className="dashboard-button"
                    onClick={() => setShowDashboard(true)}
                  >
                    📊 View Analytics Dashboard
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </LoadScript>
  );
}

export default App;
