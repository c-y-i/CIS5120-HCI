import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBuild } from "../context/BuildContext";
import "../styles/home.css";
import logo from "../assets/logo.png";
import componentsData from "../data/components.json";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8000";
const BUILDS_ENDPOINT = `${API_BASE}/api/builds`;

export default function BuildPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentBuild, updateBuild } = useBuild();

  const location = useLocation();
  const userId = localStorage.getItem("userId");

  const totalWeight = 0;

  // Component selections - initialize from context if available
  const [selectedFrame, setSelectedFrame] = useState("");
  const [selectedMotor, setSelectedMotor] = useState("");
  const [selectedPropeller, setSelectedPropeller] = useState("");
  const [selectedESC, setSelectedESC] = useState("");
  const [selectedFC, setSelectedFC] = useState("");
  const [selectedBattery, setSelectedBattery] = useState("");
  const [selectedReceiver, setSelectedReceiver] = useState("");

  // Load from context on mount
  useEffect(() => {
    if (currentBuild?.componentIds) {
      setSelectedFrame(currentBuild.componentIds.frameId || "");
      setSelectedMotor(currentBuild.componentIds.motorId || "");
      setSelectedPropeller(currentBuild.componentIds.propellerId || "");
      setSelectedESC(currentBuild.componentIds.escId || "");
      setSelectedFC(currentBuild.componentIds.flightControllerId || "");
      setSelectedBattery(currentBuild.componentIds.batteryId || "");
      setSelectedReceiver(currentBuild.componentIds.receiverId || "");
    }
  }, []);

  const handleSave = async () => {
    const now = new Date().toISOString();
    const payload = {
      id: currentBuild?.id || undefined,
      userId,
      name: currentBuild?.name || "Custom Build",
      note: currentBuild?.note || "",
      componentIds: {
        frameId: selectedFrame,
        motorId: selectedMotor,
        propellerId: selectedPropeller,
        escId: selectedESC || null,
        flightControllerId: selectedFC || null,
        batteryId: selectedBattery,
        receiverId: selectedReceiver || null,
      },
      totalWeight,
      createdAt: currentBuild?.createdAt || now,
      updatedAt: now,
    };

    // Case 1: User not logged in (anonymous state)
    if (!localStorage.getItem("userId") || userId === "leo") {
      const localBuilds = JSON.parse(localStorage.getItem("offlineBuilds") || "[]");
      localBuilds.push(payload);
      localStorage.setItem("offlineBuilds", JSON.stringify(localBuilds));
      alert("✅ Build saved locally. Log in later to sync your builds!");
      navigate("/");
      return;
    }

    // Case 2: User is logged in, data saved to backend as normal
    const isUpdate = Boolean(payload.id);
    const url = isUpdate ? `${BUILDS_ENDPOINT}/${payload.id}` : BUILDS_ENDPOINT;

    const res = await fetch(url, {
      method: isUpdate ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text().catch(() => "Save failed"));
    navigate("/");
  };

  const handleAnalyze = () => {
    // Create build config
    const build = {
      id: currentBuild?.id || "build-" + Date.now(),
      name: currentBuild?.name || "Custom Build",
      description: currentBuild?.description || "User created build",
      componentIds: {
        frameId: selectedFrame || null,
        motorId: selectedMotor || null,
        propellerId: selectedPropeller || null,
        escId: selectedESC || null,
        flightControllerId: selectedFC || null,
        batteryId: selectedBattery || null,
        receiverId: selectedReceiver || null,
      },
      createdAt: currentBuild?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to context
    updateBuild(build);

    // Navigate to analysis page
    navigate("/analysis", { state: { build } });
  };

  const canAnalyze = selectedMotor && selectedPropeller && selectedBattery && selectedFrame;
  const canSave = !!canAnalyze;

  return (
    <div className={`app-container ${menuOpen ? "menu-open" : ""}`}>
      {/* Top Bar */}
      <div className="top-bar">
        <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)}>
          ☰
        </button>

        <div className="logo-area">
          <img src={logo} alt="logo" className="logo-icon" />
          <span className="logo-text">RotorBench</span>
        </div>

        <button className="icon-btn home-btn" onClick={() => navigate("/")}>
          🏠
        </button>
      </div>

      {/* Page Title */}
      <div className="section-title" style={{ fontSize: "20px", fontWeight: "600" }}>
        Build Configuration
      </div>

      {/* Frame Selection */}
      <div>
        <div className="section-title">🔲 Frame</div>
        <div className="select-row">
          <select
            className="input-field"
            value={selectedFrame}
            onChange={(e) => setSelectedFrame(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Select frame...</option>
            {componentsData.frames.map((frame) => (
              <option key={frame.id} value={frame.id}>
                {frame.name} - ${frame.price}
              </option>
            ))}
          </select>
          {selectedFrame && (
            <button className="reset-btn" onClick={() => setSelectedFrame("")}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Motor Selection */}
      <div>
        <div className="section-title">⚙️ Motors</div>
        <div className="select-row">
          <select
            className="input-field"
            value={selectedMotor}
            onChange={(e) => setSelectedMotor(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Select motor...</option>
            {componentsData.motors.map((motor) => (
              <option key={motor.id} value={motor.id}>
                {motor.name} - ${motor.price}
              </option>
            ))}
          </select>
          {selectedMotor && (
            <button className="reset-btn" onClick={() => setSelectedMotor("")}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Propeller Selection */}
      <div>
        <div className="section-title">🔄 Propellers</div>
        <div className="select-row">
          <select
            className="input-field"
            value={selectedPropeller}
            onChange={(e) => setSelectedPropeller(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Select propeller...</option>
            {componentsData.propellers.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name} - ${prop.price}
              </option>
            ))}
          </select>
          {selectedPropeller && (
            <button className="reset-btn" onClick={() => setSelectedPropeller("")}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ESC Selection */}
      <div>
        <div className="section-title">⚡ ESC</div>
        <div className="select-row">
          <select className="input-field" value={selectedESC} onChange={(e) => setSelectedESC(e.target.value)} style={{ flex: 1 }}>
            <option value="">Select ESC...</option>
            {componentsData.escs.map((esc) => (
              <option key={esc.id} value={esc.id}>
                {esc.manufacturer} {esc.name} - ${esc.price}
              </option>
            ))}
          </select>
          {selectedESC && (
            <button className="reset-btn" onClick={() => setSelectedESC("")}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Flight Controller Selection */}
      <div>
        <div className="section-title">🖥️ Flight Controller</div>
        <div className="select-row">
          <select className="input-field" value={selectedFC} onChange={(e) => setSelectedFC(e.target.value)} style={{ flex: 1 }}>
            <option value="">Select flight controller...</option>
            {componentsData.flight_controllers.map((fc) => (
              <option key={fc.id} value={fc.id}>
                {fc.manufacturer} {fc.name} - ${fc.price}
              </option>
            ))}
          </select>
          {selectedFC && (
            <button className="reset-btn" onClick={() => setSelectedFC("")}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Battery Selection */}
      <div>
        <div className="section-title">🔋 Battery</div>
        <div className="select-row">
          <select
            className="input-field"
            value={selectedBattery}
            onChange={(e) => setSelectedBattery(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Select battery...</option>
            {componentsData.batteries.map((battery) => (
              <option key={battery.id} value={battery.id}>
                {battery.name} - ${battery.price}
              </option>
            ))}
          </select>
          {selectedBattery && (
            <button className="reset-btn" onClick={() => setSelectedBattery("")}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Receiver Selection */}
      <div>
        <div className="section-title">📡 Receiver (Optional)</div>
        <div className="select-row">
          <select
            className="input-field"
            value={selectedReceiver}
            onChange={(e) => setSelectedReceiver(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Select receiver...</option>
            {componentsData.receivers.map((rx) => (
              <option key={rx.id} value={rx.id}>
                {rx.name} - ${rx.price}
              </option>
            ))}
          </select>
          {selectedReceiver && (
            <button className="reset-btn" onClick={() => setSelectedReceiver("")}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Info Message */}
      {!canAnalyze && (
        <div style={{ margin: "20px 14px", padding: "12px", background: "#fff3e0", borderRadius: "8px", fontSize: "13px" }}>
          ⚠️ Please select at least Frame, Motor, Propeller, and Battery to analyze
        </div>
      )}

      <div className="bottom-buttons">
        <button
          className="action-btn save"
          onClick={handleSave}
          disabled={!canSave}
          style={{ opacity: canSave ? 1 : 0.5, cursor: canSave ? "pointer" : "not-allowed" }}
          title={canSave ? "Save & go Home" : "Select Frame, Motor, Propeller, Battery first"}
        >
          💾 Save & Home
        </button>

        <button
          className="action-btn analysis"
          disabled={!canAnalyze}
          onClick={handleAnalyze}
          style={{ opacity: canAnalyze ? 1 : 0.5 }}
        >
          📊 Analyze
        </button>
      </div>

      {/* Drawer (contained in phone) */}
      {menuOpen && (
        <div className="menu-overlay">
          <div className="menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-top-right">
              <button className="icon-btn menu-btn" onClick={() => setMenuOpen(false)}>
                ☰
              </button>
            </div>
            <button className="menu-item" onClick={() => navigate("/")}>
              Home
            </button>
            <button
              className="menu-item"
              onClick={() => {
                setMenuOpen(false);
                navigate("/saved");
              }}
            >
              Saved Builds
            </button>
            <button
              className="menu-item"
              onClick={() => { setMenuOpen(false); navigate("/profile", { state: { userId: "leo" } }); }}
            >
              Profile
            </button>
            <button className="menu-item">Documentation</button>
          </div>
          <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </div>
  );
}
