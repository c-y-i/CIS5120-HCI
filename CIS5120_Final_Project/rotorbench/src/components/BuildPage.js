import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css"; // reuse container + icons etc.

import logo from "../assets/logo.png";

export default function BuildPage() {
  const navigate = useNavigate();

  return (
    <div className="app-container">

      {/* Top Bar */}
      <div className="top-bar">
        <button className="icon-btn menu-btn">☰</button>

        <div className="logo-area">
          <img src={logo} alt="logo" className="logo-icon" />
          <span className="logo-text">RotorBench</span>
        </div>

        {/* Home Button */}
        <button className="icon-btn home-btn" onClick={() => navigate("/")}>🏠</button>
      </div>

      {/* Page Title */}
      <div className="section-title">Drone Build Preset</div>

      {/* Preset Dropdown */}
      <select className="input-field">
        <option>Example Preset</option>
      </select>

      {/* Search Inputs */}
      {["Flight controller", "ESC", "Power system"].map((label) => (
        <div className="search-row" key={label}>
          <input className="search-input" placeholder={label} />
          <button className="search-btn-small">🔍</button>
          <button className="search-btn-small">✖</button>
        </div>
      ))}

      {/* Frame Section */}
      {[
        ["Frame", "size / configuration"],
        ["Motors", "kv / size"],
        ["Propellers", "size / blades"],
        ["Video System", "VTX type"]
      ].map(([title, placeholder]) => (
        <div key={title}>
          <div className="section-title">{title}</div>
          <div className="select-row">
            <select className="input-field">
              <option>{placeholder}</option>
            </select>
            <button className="reset-btn">Reset</button>
          </div>
        </div>
      ))}

      {/* Budget Slider */}
      <div className="section-title">Budget</div>
      <input type="range" min="0" max="1000" className="slider" />
      <div className="section-title">Currency: $ USD</div>

      {/* Save Button */}
      <div className="bottom-buttons">
        <button className="action-btn save">💾 Save</button>
      </div>

    </div>
  );
}
