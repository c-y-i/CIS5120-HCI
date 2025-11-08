import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBuild } from "../context/BuildContext";
import "../styles/home.css";
import logo from "../assets/logo.png";
import BabylonViewer from "./BabylonViewer";
import componentsData from "../data/components.json";
import TwoDViewer from "./TwoDViewer";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentBuild, analysisResults } = useBuild();

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
  const hasAnalysis = analysisResults && hasBuild;
  const [activeView, setActiveView] = useState("3D");

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
      <div className="view-switch-container">
        <div className="view-switch-track">
          <div
            className="view-switch-slider"
            style={{
              transform: activeView === "3D" ? "translateX(0%)" : "translateX(100%)",
            }}
          />
          {["3D", "2D"].map((view) => (
            <button
              key={view}
              className={`view-switch-option ${activeView === view ? "active" : ""}`}
              onClick={() => setActiveView(view)}
            >
              {view} View
            </button>
          ))}
        </div>
      </div>

      {/* 3D viewer */}
      <div className="viewer-container">
        {activeView === "3D" && <BabylonViewer />}
        {activeView === "2D" && <TwoDViewer />}
      </div>

      {/* Spec Section - Shows saved build or placeholder */}
      {/* Spec Section - Logically Grouped and Clear */}
      <div className="spec-section-grouped">

        {/* Overall Section */}
        <div className="spec-card-group">
          <div className="spec-header">
            <div className="spec-icon overall-icon">⚖️</div>
            <div>
              <div className="spec-title">Overall</div>
              <div className="spec-value">System Summary</div>
            </div>
          </div>

          <div className="spec-divider"></div>
          <div className="spec-info">
            <span>Total Weight</span>
            <b>{hasAnalysis ? `${analysisResults.performance.totalWeight}g` : "--"}</b>
          </div>
          <div className="spec-info">
            <span>T/W Ratio</span>
            <b>{hasAnalysis ? `${analysisResults.performance.thrustToWeightRatio}:1` : "--"}</b>
          </div>
        </div>

        {/* Motors */}
        <div className="spec-card-group">
          <div className="spec-header">
            <div className="spec-icon motor-icon">⚙️</div>
            <div>
              <div className="spec-title">Motors</div>
              <div className="spec-value">{motor?.name || "Not selected"}</div>
            </div>
          </div>
        </div>

        {/* Propellers */}
        <div className="spec-card-group">
          <div className="spec-header">
            <div className="spec-icon propeller-icon">🔄</div>
            <div>
              <div className="spec-title">Propellers</div>
              <div className="spec-value">{propeller?.name || "Not selected"}</div>
            </div>
          </div>
        </div>

        {/* Battery */}
        <div className="spec-card-group">
          <div className="spec-header">
            <div className="spec-icon battery-icon">🔋</div>
            <div>
              <div className="spec-title">Battery</div>
              <div className="spec-value">{battery?.name || "Not selected"}</div>
            </div>
          </div>

          <div className="spec-divider"></div>

          <div className="spec-info">
            <span>Voltage</span>
            <b>{battery ? `${battery.voltage}V` : "--"}</b>
          </div>
          <div className="spec-info">
            <span>Capacity</span>
            <b>{battery ? `${battery.capacity}mAh` : "--"}</b>
          </div>
          <div className="spec-info">
            <span>Current Draw</span>
            <b>{hasAnalysis ? `${analysisResults.flightSimulation.avgCurrentDraw}A` : "--"}</b>
          </div>
          <div className="spec-info">
            <span>Flight Time</span>
            <b>{hasAnalysis ? `${analysisResults.flightSimulation.estimatedFlightTime}min` : "--"}</b>
          </div>
        </div>

        {/* Flight Controller */}
        <div className="spec-card-group">
          <div className="spec-header">
            <div className="spec-icon fc-icon">🖥️</div>
            <div>
              <div className="spec-title">Flight Controller</div>
              <div className="spec-value">{fc?.name || "Not selected"}</div>
            </div>
          </div>
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
