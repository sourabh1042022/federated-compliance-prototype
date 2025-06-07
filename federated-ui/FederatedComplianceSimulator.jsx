import React, { useEffect, useState } from "react";

const FederatedComplianceSimulator = () => {
  const [metrics, setMetrics] = useState({
    round: 0,
    accuracy: 0,
    compliance_score: 0,
    convergence: 0,
    privacy_spent: 0,
  });

  const [inputText, setInputText] = useState("");
  const [nlpOutput, setNlpOutput] = useState(null);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/metrics");
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error("Error fetching metrics:", err);
    }
  };

  const handleAnalyze = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/nlp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      setNlpOutput(data);
    } catch (error) {
      console.error("Error during NLP analysis:", error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">Federated Compliance Monitor</h1>
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <MetricCard label="Round" value={metrics.round} />
        <MetricCard label="Accuracy" value={metrics.accuracy * 100} unit="%" />
        <MetricCard label="Convergence" value={metrics.convergence * 100} unit="%" />
        <MetricCard label="Privacy Spent" value={metrics.privacy_spent * 100} unit="%" />
        <MetricCard label="Compliance Score" value={metrics.compliance_score * 100} unit="%" />
      </div>

      <div className="mt-8 p-6 bg-white rounded shadow max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">🔍 Compliance Text Analyzer</h2>
        <textarea
          className="w-full border p-2 mb-3 rounded"
          rows={4}
          placeholder="Paste or type regulation text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleAnalyze}
        >
          Analyze Text
        </button>

        {nlpOutput && (
          <div className="mt-4 text-left">
            <p className="font-semibold">Extracted Obligations:</p>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {nlpOutput.entities.map((entity, idx) => (
                <li key={idx}>{entity}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm">
              <strong>Compliance Score:</strong> {Math.round(nlpOutput.compliance_score * 100)}%
            </p>
          </div>
        )}
      </div>

      <div className="mt-10 bg-white p-6 rounded shadow max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-3">🕵️ NLP Compliance Audit Log</h2>
        <AuditLog />
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, unit }) => (
  <div className="bg-white shadow-md rounded-lg p-4">
    <h2 className="text-sm text-gray-600">{label}</h2>
    <p className="text-xl font-bold">
      {value.toFixed(1)}{unit}
    </p>
  </div>
);

const AuditLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auditlog");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Failed to load audit log", err);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="text-left text-sm max-h-96 overflow-y-auto">
      {logs.map((entry, idx) => (
        <div key={idx} className="mb-3 border-b pb-2">
          <p><strong>Time:</strong> {entry.timestamp}</p>
          <p><strong>Text:</strong> {entry.input_text}</p>
          <p><strong>Obligations:</strong> {entry.obligations.join(", ")}</p>
          <p><strong>Score:</strong> {entry.compliance_score}</p>
        </div>
      ))}
      {logs.length === 0 && <p>No audit logs found.</p>}
    </div>
  );
};

export default FederatedComplianceSimulator;
