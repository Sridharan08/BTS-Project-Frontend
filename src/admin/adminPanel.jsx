import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import ManageRoutes from './ManageRoutes';
import ViewAlerts from './ViewAlerts';
import ManualOverride from './ManualOverride';

const AdminPanel = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <nav style={{ width: '200px', backgroundColor: '#f4f4f4', padding: '20px' }}>
        <h2>Admin Panel</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/admin/manage-routes">Manage Routes</Link></li>
          <li><Link to="/admin/view-alerts">View Alerts</Link></li>
          <li><Link to="/admin/manual-override">Manual Override</Link></li>
        </ul>
      </nav>
      <main style={{ flex: 1, padding: '20px' }}>
        <Routes>
          <Route path="manage-routes" element={<ManageRoutes />} />
          <Route path="view-alerts" element={<ViewAlerts />} />
          <Route path="manual-override" element={<ManualOverride />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;