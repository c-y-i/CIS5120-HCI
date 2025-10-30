import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import logo from "../assets/logo.png";
import drone from "../assets/drone.png";
import motorIcon from "../assets/motors.png";
import propellerIcon from "../assets/propellers.png";
import batteryIcon from "../assets/battery.png";
import controllerIcon from "../assets/controller.png";
import BabylonViewer from "../components/BabylonViewer";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
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

      {/* Spec Section */}
      <div className="spec-section">
        <div className="spec-left">
          <div className="spec-card">
            <img src={motorIcon} alt="motor" className="spec-icon" />
            <div>
              <div className="spec-title">Motors</div>
              <div className="spec-value">2306 2400KV</div>
            </div>
          </div>

          <div className="spec-card">
            <img src={propellerIcon} alt="propeller" className="spec-icon" />
            <div>
              <div className="spec-title">Propellers</div>
              <div className="spec-value">5x5x3 HQ Prop</div>
            </div>
          </div>

          <div className="spec-card">
            <img src={batteryIcon} alt="battery" className="spec-icon" />
            <div>
              <div className="spec-title">Battery</div>
              <div className="spec-value">4S 5000mAh LiPo</div>
            </div>
          </div>

          <div className="spec-card">
            <img src={controllerIcon} alt="controller" className="spec-icon" />
            <div>
              <div className="spec-title">Flight Controller</div>
              <div className="spec-value">JHEMCU F405</div>
            </div>
          </div>
        </div>

        <div className="spec-right">
          <div className="spec-info"><span>Total Weight</span><b>740g</b></div>
          <div className="spec-info"><span>T/W Ratio</span><b>7.0:1</b></div>
          <div className="spec-info"><span>Battery Voltage</span><b>14.8V</b></div>
          <div className="spec-info"><span>Battery Capacity</span><b>5000mAh</b></div>
          <div className="spec-info"><span>Current Draw</span><b>53.2A</b></div>
          <div className="spec-info"><span>Flight Time</span><b>5min</b></div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="bottom-buttons">
        <button className="action-btn save">💾 Save</button>
        <button className="action-btn analysis">ℹ️ Analysis</button>
        <button className="action-btn order">🛒 Order</button>
      </div>

      {menuOpen && (
        <div className="menu-overlay">
          <div className="menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-top-right">
              <button className="icon-btn menu-btn" onClick={() => setMenuOpen(false)}>☰</button>
            </div>
            <button className="menu-item">Saved configure</button>
            <button className="menu-item">Profile</button>
            <button className="menu-item">Document</button>
          </div>
          {/* Click anywhere on the right to close */}
          <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
        </div>
      )}
      {menuOpen && (
        <div className="menu-overlay">
          <div className="menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-top-right">
              <button className="icon-btn menu-btn" onClick={() => setMenuOpen(false)}>☰</button>
            </div>
            <button className="menu-item">Saved configure</button>
            <button className="menu-item">Profile</button>
            <button className="menu-item">Document</button>
          </div>
          <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
        </div>
      )}

    </div>
  );
}
