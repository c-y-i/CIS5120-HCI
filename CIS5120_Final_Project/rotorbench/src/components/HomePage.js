import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import logo from "../assets/logo.png";
import componentsData from "../data/components.json";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Component selections
  const [selectedFrame, setSelectedFrame] = useState("");
  const [selectedMotor, setSelectedMotor] = useState("");
  const [selectedPropeller, setSelectedPropeller] = useState("");
  const [selectedBattery, setSelectedBattery] = useState("");
  const [selectedFC, setSelectedFC] = useState("");

  // Get selected component objects
  const frame = componentsData.frames.find((f) => f.id === selectedFrame);
  const motor = componentsData.motors.find((m) => m.id === selectedMotor);
  const propeller = componentsData.propellers.find((p) => p.id === selectedPropeller);
  const battery = componentsData.batteries.find((b) => b.id === selectedBattery);
  const fc = componentsData.flight_controllers.find((f) => f.id === selectedFC);

  // Check if minimum components are selected for analysis
  const canAnalyze = selectedMotor && selectedPropeller && selectedBattery && selectedFrame;

  const handleAnalyze = () => {
    if (!canAnalyze) return;

    // Create build config
    const build = {
      id: "build-" + Date.now(),
      name: "Quick Analysis",
      description: "Analysis from home page",
      componentIds: {
        frameId: selectedFrame,
        motorId: selectedMotor,
        propellerId: selectedPropeller,
        escId: null,
        flightControllerId: selectedFC || null,
        batteryId: selectedBattery,
        receiverId: null,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Navigate to analysis page
    navigate("/analysis", { state: { build } });
  };

  return (
    <div className={`app-container${menuOpen ? " menu-open" : ""}`}>
      <div className="top-bar">
        <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)}>
          ☰
        </button>

        <div className="logo-area">
          <img src={logo} alt="logo" className="logo-icon" />
          <span className="logo-text">RotorBench</span>
        </div>

        <button className="icon-btn search-btn" onClick={() => navigate("/build")}>
          🔍
        </button>
      </div>

      {/* Title */}
      <div className="section-title" style={{ fontSize: "20px", fontWeight: "600", marginTop: "16px" }}>
        Quick Build Analysis
      </div>

      {/* Component Selection Cards */}
      <div style={{ padding: "0 14px" }}>
        {/* Motor Selection */}
        <div className="component-select-card">
          <div className="component-select-icon">⚙️</div>
          <div className="component-select-content">
            <div className="component-select-label">Motors *</div>
            <select
              value={selectedMotor}
              onChange={(e) => setSelectedMotor(e.target.value)}
              className="component-select-dropdown"
            >
              <option value="">Select motor...</option>
              {componentsData.motors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Propeller Selection */}
        <div className="component-select-card">
          <div className="component-select-icon">🔄</div>
          <div className="component-select-content">
            <div className="component-select-label">Propellers *</div>
            <select
              value={selectedPropeller}
              onChange={(e) => setSelectedPropeller(e.target.value)}
              className="component-select-dropdown"
            >
              <option value="">Select propeller...</option>
              {componentsData.propellers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Battery Selection */}
        <div className="component-select-card">
          <div className="component-select-icon">🔋</div>
          <div className="component-select-content">
            <div className="component-select-label">Battery *</div>
            <select
              value={selectedBattery}
              onChange={(e) => setSelectedBattery(e.target.value)}
              className="component-select-dropdown"
            >
              <option value="">Select battery...</option>
              {componentsData.batteries.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Frame Selection */}
        <div className="component-select-card">
          <div className="component-select-icon">🔲</div>
          <div className="component-select-content">
            <div className="component-select-label">Frame *</div>
            <select
              value={selectedFrame}
              onChange={(e) => setSelectedFrame(e.target.value)}
              className="component-select-dropdown"
            >
              <option value="">Select frame...</option>
              {componentsData.frames.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Flight Controller Selection (Optional) */}
        <div className="component-select-card">
          <div className="component-select-icon">🖥️</div>
          <div className="component-select-content">
            <div className="component-select-label">Flight Controller (Optional)</div>
            <select value={selectedFC} onChange={(e) => setSelectedFC(e.target.value)} className="component-select-dropdown">
              <option value="">Select FC...</option>
              {componentsData.flight_controllers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.manufacturer} {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info/Warning Message */}
        {!canAnalyze ? (
          <div className="info-message">
            ⚠️ Select Motor, Propeller, Battery, and Frame to enable analysis
          </div>
        ) : (
          <div className="success-message">✅ Ready to analyze! Click the Analysis button below.</div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="bottom-buttons">
        <button className="action-btn save" disabled={!canAnalyze} style={{ opacity: canAnalyze ? 1 : 0.5 }}>
          💾 Save
        </button>
        <button
          className="action-btn analysis"
          disabled={!canAnalyze}
          onClick={handleAnalyze}
          style={{
            opacity: canAnalyze ? 1 : 0.5,
            cursor: canAnalyze ? "pointer" : "not-allowed",
          }}
        >
          ℹ️ Analysis
        </button>
        <button className="action-btn order" disabled={!canAnalyze} style={{ opacity: canAnalyze ? 1 : 0.5 }}>
          🛒 Order
        </button>
      </div>

      {menuOpen && (
        <div className="menu-overlay">
          <div className="menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-top-right">
              <button className="icon-btn menu-btn" onClick={() => setMenuOpen(false)}>
                ☰
              </button>
            </div>
            <button className="menu-item" onClick={() => navigate("/build")}>
              Full Build Configuration
            </button>
            <button className="menu-item">Saved Builds</button>
            <button className="menu-item">Profile</button>
            <button className="menu-item">Documentation</button>
          </div>
          <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </div>
  );
}
