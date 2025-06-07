import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = () => {
      fetch("http://localhost:5000/api/metrics")
        .then((res) => res.json())
        .then((data) => setMetrics(data))
        .catch((err) => console.error("API error:", err));
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const chartData = metrics ? [
    { name: "Accuracy", value: metrics.accuracy },
    { name: "Convergence", value: metrics.convergence },
    { name: "Privacy", value: metrics.privacy_spent },
    { name: "Compliance", value: metrics.compliance_score },
  ] : [];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Federated Learning Metrics (Live)</h2>
      {metrics ? (
        <>
          <p><strong>Round:</strong> {metrics.round}</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <p>Loading metrics...</p>
      )}
    </div>
  );
};

export default MetricsDashboard;
