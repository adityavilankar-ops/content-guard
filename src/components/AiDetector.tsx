import React, { useState } from "react";

export default function AiDetector() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResults(data.results);
      } else {
        setError(data.error || "Failed to analyze text content.");
      }
    } catch (err) {
      setError("An error occurred while connecting to the scan server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#1e293b", padding: "24px", borderRadius: "16px", maxWidth: "600px", margin: "20px auto", color: "#f8fafc", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#2dd4bf" }}>QuillBot AI Text Detector</h2>
      <p style={{ color: "#94a3b8", fontSize: "14px" }}>Paste text below to check for AI-generated patterns.</p>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text content here to start scanning..."
        rows={6}
        disabled={loading}
        style={{ w: "100%", width: "100%", padding: "12px", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#e2e8f0" }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
        <span style={{ color: "#94a3b8", fontSize: "12px" }}>{text.length} characters</span>
        <button
          onClick={handleScan}
          disabled={loading || !text.trim()}
          style={{ background: "#0d9488", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
        >
          {loading ? "Analyzing..." : "Scan Text 🚀"}
        </button>
      </div>

      {error && <div style={{ color: "#f87171", marginTop: "12px" }}>{error}</div>}

      {results && (
        <div style={{ marginTop: "20px", background: "#0f172a", padding: "12px", borderRadius: "8px" }}>
          <h3 style={{ margin: "0 0 8px 0" }}>Analysis Results Matrix</h3>
          <pre style={{ color: "#4ade80", overflowX: "auto" }}>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}