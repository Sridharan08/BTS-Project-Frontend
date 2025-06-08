import React, { useState, useEffect } from 'react';

const ViewAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch alerts from your backend API
    fetch('/api/alerts')  // Adjust the endpoint as needed
      .then((response) => response.json())
      .then((data) => setAlerts(data))
      .catch((error) => console.error('Error fetching alerts:', error));
  }, []);

  return (
    <div>
      <h2>View Alerts</h2>
      {alerts.length === 0 ? (
        <p>No alerts at the moment</p>
      ) : (
        <ul>
          {alerts.map((alert, index) => (
            <li key={index}>
              <h3>{alert.title}</h3>
              <p>{alert.message}</p>
              <p>Time: {alert.timestamp}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewAlerts;
