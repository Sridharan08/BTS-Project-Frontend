import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import "./Dashboard.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/dashboard");
        setDashboardData(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // auto-refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (!dashboardData) return <p>Loading dashboard...</p>;

  const {
    totalBuses,
    busiestRoutes,
    peakHours,
    averageSpeed,
    totalDelays,
    trafficStatus,
    alertTrends
  } = dashboardData;

  return (
    <div className="dashboard-wrapper">
      <h2>📊 Real-Time Bus Analytics Dashboard</h2>

      <div className="cards-container">
        <div className="card">🚌 Total Buses: <strong>{totalBuses}</strong></div>
        <div className="card">🚦 Avg. Speed: <strong>{averageSpeed} km/h</strong></div>
        <div className="card">⏱️ Delays: <strong>{totalDelays}</strong></div>
        <div className="card">📡 Traffic: <strong>{trafficStatus}</strong></div>
      </div>

      <div className="charts-container">
        <div className="chart-box">
          <h4>📍 Busiest Routes</h4>
          <BarChart width={500} height={300} data={busiestRoutes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="route" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </div>

        <div className="chart-box">
          <h4>🕒 Peak Hours</h4>
          <LineChart width={500} height={300} data={peakHours}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="activity" stroke="#82ca9d" />
          </LineChart>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
