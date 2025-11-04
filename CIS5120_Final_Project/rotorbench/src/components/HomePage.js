import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBuild } from "../context/BuildContext";
import "../styles/home.css";
import logo from "../assets/logo.png";
import BabylonViewer from "./BabylonViewer";
import componentsData from "../data/components.json";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentBuild } = useBuild();

  // Get component details from current build
  const getComponent = (type, id) => {
    if (!id) return null;
    return componentsData[type]?.find((c) => c.id === id) || null;
  };

  const motor = currentBuild ? getComponent("motors", currentBuild.componentIds?.motorId) : null;
  const propeller = currentBuild ? getComponent("propellers", currentBuild.componentIds?.propellerId) : null;
  const battery = currentBuild ? getComponent("batteries", currentBuild.componentIds?.batteryId) : null;
  const fc = currentBuild ? getComponent("flight_controllers", currentBuild.componentIds?.flightControllerId) : null;

  const hasBuild = currentBuild && motor && propeller && battery;
  
  return (
    <div className={`app-container${menuOpen ? " menu-open" : ""}`}>

      <div className="top-bar">
        <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)}>☰</button>

        <div className="logo-area">
          <img src={logo} alt="logo" className="logo-icon" />
          <span className="logo-text">RotorBench</span>
        </div>

        <button className="icon-btn search-btn" onClick={() => navigate("/build")}>🔍</button>
      </div>

      {/* View Switch */}
      <div className="view-switch">
        <button className="switch-btn">Detailed View</button>
        <button className="switch-btn">3D View</button>
      </div>

      {/* 3D viewer */}
      <BabylonViewer />

      {/* Spec Section - Shows saved build or placeholder */}
      <div className="spec-section">
        <div className="spec-left">
          <div className="spec-card">
            <div className="component-icon motor-icon" style={{width: "32px", height: "32px", fontSize: "20px"}}>⚙️</div>
            <div>
              <div className="spec-title">Motors</div>
              <div className="spec-value">{motor?.name || "Not selected"}</div>
            </div>
          </div>

          <div className="spec-card">
            <div className="component-icon propeller-icon" style={{width: "32px", height: "32px", fontSize: "20px"}}>🔄</div>
            <div>
              <div className="spec-title">Propellers</div>
              <div className="spec-value">{propeller?.name || "Not selected"}</div>
            </div>
          </div>

          <div className="spec-card">
            <div className="component-icon battery-icon" style={{width: "32px", height: "32px", fontSize: "20px"}}>🔋</div>
            <div>
              <div className="spec-title">Battery</div>
              <div className="spec-value">{battery?.name || "Not selected"}</div>
            </div>
          </div>

          <div className="spec-card">
            <div className="component-icon fc-icon" style={{width: "32px", height: "32px", fontSize: "20px"}}>🖥️</div>
            <div>
              <div className="spec-title">Flight Controller</div>
              <div className="spec-value">{fc?.name || "Not selected"}</div>
            </div>
          </div>
        </div>

        <div className="spec-right">
          <div className="spec-info"><span>Total Weight</span><b>{hasBuild ? "Analyze" : "--"}</b></div>
          <div className="spec-info"><span>T/W Ratio</span><b>{hasBuild ? "Analyze" : "--"}</b></div>
          <div className="spec-info"><span>Battery Voltage</span><b>{battery ? battery.voltage + "V" : "--"}</b></div>
          <div className="spec-info"><span>Battery Capacity</span><b>{battery ? battery.capacity + "mAh" : "--"}</b></div>
          <div className="spec-info"><span>Current Draw</span><b>{hasBuild ? "Analyze" : "--"}</b></div>
          <div className="spec-info"><span>Flight Time</span><b>{hasBuild ? "Analyze" : "--"}</b></div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="bottom-buttons">
        <button className="action-btn save" onClick={() => navigate("/build")}>
          {hasBuild ? "✏️ Edit Build" : "🔍 New Build"}
        </button>
        <button 
          className="action-btn analysis" 
          disabled={!hasBuild}
          onClick={() => navigate("/analysis", { state: { build: currentBuild } })}
          style={{ opacity: hasBuild ? 1 : 0.5, cursor: hasBuild ? "pointer" : "not-allowed" }}
        >
          📊 Analysis
        </button>
      </div>

      {menuOpen && (
        <div className="menu-overlay">
          <div className="menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-top-right">
              <button className="icon-btn menu-btn" onClick={() => setMenuOpen(false)}>☰</button>
            </div>
            <button className="menu-item" onClick={() => navigate("/build")}>
              Build Configuration
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
