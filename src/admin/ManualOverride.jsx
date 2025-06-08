import React, { useState } from 'react';

const ManualOverride = () => {
  const [busNumber, setBusNumber] = useState('');
  const [overrideStatus, setOverrideStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send a POST request to manually override the status
    fetch('/api/admin/override', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ busNumber, status: overrideStatus }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert('Override successful');
      })
      .catch((error) => {
        alert('Error overriding status');
      });
  };

  return (
    <div>
      <h2>Manual Status Override</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Bus Number:
          <input
            type="text"
            value={busNumber}
            onChange={(e) => setBusNumber(e.target.value)}
            required
          />
        </label>
        <label>
          New Status:
          <input
            type="text"
            value={overrideStatus}
            onChange={(e) => setOverrideStatus(e.target.value)}
            required
          />
        </label>
        <button type="submit">Override</button>
      </form>
    </div>
  );
};

export default ManualOverride;
