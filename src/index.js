import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

import App from './App';
import AdminPanel from './admin/adminPanel';
import ManageRoutes from './admin/ManageRoutes';
import ViewAlerts from './admin/ViewAlerts';
import ManualOverride from './admin/ManualOverride';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/manage-routes" element={<ManageRoutes />} />
        <Route path="/admin/view-alerts" element={<ViewAlerts />} />
        <Route path="/admin/manual-override" element={<ManualOverride />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
