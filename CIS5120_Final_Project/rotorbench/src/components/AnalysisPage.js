import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBuild } from "../context/BuildContext";
import "../styles/home.css";
import "../styles/analysis.css";
import logo from "../assets/logo.png";
import componentsData from "../data/components.json";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalysisPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { updateAnalysis } = useBuild();
  const build = location.state?.build;

  useEffect(() => {
    if (build) {
      analyzeBuild();
    }
  }, [build]);

  const analyzeBuild = async () => {
    setLoading(true);
    setError(null);

    try {
      // Hydrate build with full component objects
      const hydratedBuild = hydrateBuild(build);

      console.log("Sending to API:", JSON.stringify(hydratedBuild, null, 2));

      const response = await fetch("http://localhost:8000/api/builds/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hydratedBuild),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        // Handle validation errors
        let errorMsg = "Analysis failed";
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Pydantic validation errors
            errorMsg = errorData.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
          } else if (typeof errorData.detail === 'string') {
            errorMsg = errorData.detail;
          } else {
            errorMsg = JSON.stringify(errorData.detail);
          }
        }
        console.error("Error message:", errorMsg);
        throw new Error(errorMsg);
      }

      const analysisData = await response.json();
      console.log("Analysis result:", analysisData);
      setAnalysis(analysisData);
      // Save to context so HomePage can display it
      updateAnalysis(analysisData);
    } catch (err) {
      setError(err.message);
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const hydrateBuild = (buildConfig) => {
    const getComponentById = (type, id) => {
      if (!id) return null;
      const components = componentsData[type];
      return components?.find((c) => c.id === id) || null;
    };

    // Get components
    const frame = getComponentById("frames", buildConfig.componentIds.frameId);
    const motors = getComponentById("motors", buildConfig.componentIds.motorId);
    const propellers = getComponentById("propellers", buildConfig.componentIds.propellerId);
    const esc = getComponentById("escs", buildConfig.componentIds.escId);
    const flightController = getComponentById("flight_controllers", buildConfig.componentIds.flightControllerId);
    const battery = getComponentById("batteries", buildConfig.componentIds.batteryId);
    const receiver = getComponentById("receivers", buildConfig.componentIds.receiverId);

    // Log for debugging
    console.log("Build config IDs:", buildConfig.componentIds);
    console.log("Hydrated components:", {
      frame: frame ? "✓ " + frame.name : "✗ null",
      motors: motors ? "✓ " + motors.name : "✗ null",
      propellers: propellers ? "✓ " + propellers.name : "✗ null",
      esc: esc ? "✓ " + esc.name : "✗ null",
      flightController: flightController ? "✓ " + flightController.name : "✗ null",
      battery: battery ? "✓ " + battery.name : "✗ null",
      receiver: receiver ? "✓ " + receiver.name : "✗ null",
    });

    return {
      id: buildConfig.id,
      name: buildConfig.name,
      description: buildConfig.description || "",
      components: {
        frame: frame,
        motors: motors,
        propellers: propellers,
        esc: esc,
        flightController: flightController, // Use camelCase - Pydantic will convert
        battery: battery,
        receiver: receiver,
      },
      createdAt: buildConfig.createdAt || new Date().toISOString(),
      updatedAt: buildConfig.updatedAt || new Date().toISOString(),
    };
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case "excellent":
        return "#4caf50";
      case "good":
        return "#8bc34a";
      case "adequate":
        return "#ffc107";
      case "poor":
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  };

  const getRatingLabel = (rating) => {
    return rating.charAt(0).toUpperCase() + rating.slice(1);
  };

  if (!build) {
    return (
      <div className="app-container">
        <div className="top-bar">
          <button className="icon-btn" onClick={() => navigate("/build")}>
            ←
          </button>
          <div className="logo-area">
            <img src={logo} alt="logo" className="logo-icon" />
            <span className="logo-text">RotorBench</span>
          </div>
          <div style={{ width: "40px" }} />
        </div>
        <div className="error-message">
          <p>No build selected. Please go back and select a build.</p>
          <button className="action-btn analysis" onClick={() => navigate("/build")}>
            Back to Build
          </button>
        </div>
      </div>
    );
  }

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
      <div className="page-header">
        <h2 className="page-title">Analysis</h2>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Analyzing build...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button className="action-btn analysis" onClick={analyzeBuild}>
            Retry
          </button>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !loading && (
        <div className="analysis-content">
          {/* Selected Components */}
          <div className="components-section">
            <h3 className="section-header">📦 Selected Components</h3>

            {build.componentIds.motorId && (
              <div className="component-card">
                <div className="component-icon motor-icon">⚙️</div>
                <div className="component-info">
                  <div className="component-title">Motors</div>
                  <div className="component-value">
                    {componentsData.motors.find((m) => m.id === build.componentIds.motorId)?.name}
                  </div>
                </div>
              </div>
            )}

            {build.componentIds.propellerId && (
              <div className="component-card">
                <div className="component-icon propeller-icon">🔄</div>
                <div className="component-info">
                  <div className="component-title">Propellers</div>
                  <div className="component-value">
                    {componentsData.propellers.find((p) => p.id === build.componentIds.propellerId)?.name}
                  </div>
                </div>
              </div>
            )}

            {build.componentIds.batteryId && (
              <div className="component-card">
                <div className="component-icon battery-icon">🔋</div>
                <div className="component-info">
                  <div className="component-title">Battery</div>
                  <div className="component-value">
                    {componentsData.batteries.find((b) => b.id === build.componentIds.batteryId)?.name}
                  </div>
                </div>
              </div>
            )}

            {build.componentIds.flightControllerId && (
              <div className="component-card">
                <div className="component-icon fc-icon">🖥️</div>
                <div className="component-info">
                  <div className="component-title">Flight Controller</div>
                  <div className="component-value">
                    {componentsData.flight_controllers.find((f) => f.id === build.componentIds.flightControllerId)?.name}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="metrics-section">
            <h3 className="section-header">📊 Performance Metrics</h3>

            <div className="metric-card">
              <div className="metric-icon weight-icon">⚖️</div>
              <div className="metric-content">
                <div className="metric-label">Total Weight</div>
                <div className="metric-value">{analysis.performance.totalWeight}g</div>
                <div className="metric-subtitle">Including all components</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon thrust-icon">🚀</div>
              <div className="metric-content">
                <div className="metric-label">Max Thrust</div>
                <div className="metric-value">{analysis.performance.maxThrust}g</div>
                <div className="metric-subtitle">All motors at full throttle</div>
              </div>
            </div>

            <div className="metric-card highlight">
              <div className="metric-icon ratio-icon">⚖️</div>
              <div className="metric-content">
                <div className="metric-label">T/W Ratio</div>
                <div className="metric-value-large">{analysis.performance.thrustToWeightRatio}:1</div>
                <div
                  className="metric-badge"
                  style={{
                    backgroundColor: getRatingColor(analysis.performance.rating.thrustToWeight),
                  }}
                >
                  {getRatingLabel(analysis.performance.rating.thrustToWeight)} - Racing capable
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon power-icon">⚡</div>
              <div className="metric-content">
                <div className="metric-label">Power System</div>
                <div className="metric-value">{analysis.performance.powerDraw}W</div>
                <div className="metric-subtitle">Average power draw</div>
              </div>
            </div>
          </div>

          {/* Flight Time Simulation */}
          <div className="flight-section">
            <h3 className="section-header">✈️ Flight Time Simulation</h3>

            <div className="flight-grid">
              <div className="flight-card">
                <div className="flight-icon">🔋</div>
                <div className="flight-label">Battery Capacity</div>
                <div className="flight-value">{analysis.flightSimulation.batteryCapacity}mAh</div>
              </div>

              <div className="flight-card">
                <div className="flight-icon">⚡</div>
                <div className="flight-label">Avg Current Draw</div>
                <div className="flight-value">{analysis.flightSimulation.avgCurrentDraw}A</div>
              </div>

              <div className="flight-card highlight">
                <div className="flight-icon">⏱️</div>
                <div className="flight-label">Estimated Flight Time</div>
                <div className="flight-value-large">{analysis.flightSimulation.estimatedFlightTime} min</div>
              </div>

              <div className="flight-card">
                <div className="flight-icon">📏</div>
                <div className="flight-label">Estimated Range</div>
                <div className="flight-value">{analysis.flightSimulation.estimatedRange} km</div>
              </div>

              <div className="flight-card">
                <div className="flight-icon">🏁</div>
                <div className="flight-label">Hover Time</div>
                <div className="flight-value">{analysis.flightSimulation.hoverTime} min</div>
              </div>

              <div className="flight-card">
                <div className="flight-icon">💨</div>
                <div className="flight-label">Max Speed</div>
                <div className="flight-value">{analysis.flightSimulation.maxSpeed} km/h</div>
              </div>

              <div className="flight-card">
                <div className="flight-icon">📊</div>
                <div className="flight-label">Efficiency</div>
                <div className="flight-value">{analysis.flightSimulation.efficiency} mAh/km</div>
              </div>
            </div>
          </div>

          {/* Battery Discharge Curve */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={analysis.flightSimulation.dischargeData}
              margin={{ top: 20, right: 40, left: 60, bottom: 30 }}  // Increase left margin
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                label={{
                  value: "Flight Time (Hours)",
                  position: "insideBottom",
                  offset: -5,
                }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: "Voltage (V)",
                  angle: -90,
                  position: "insideLeft", // Retain insideLeft, but ensure sufficient margin
                  offset: -10, // Slightly to the left, avoiding being too close to the axis
                }}
                tick={{ fontSize: 12 }}
                domain={["auto", "auto"]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "Capacity (mAh)",
                  angle: 90,
                  position: "insideRight",
                  offset: -5,
                }}
                tick={{ fontSize: 12 }}
                domain={["auto", "auto"]}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="voltage"
                stroke="#2196f3"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Battery Voltage (V)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="remainingCapacity"
                stroke="#f44336"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Remaining Capacity (mAh)"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Validation Messages */}
          {analysis.errors.length > 0 && (
            <div className="validation-section error">
              <h3 className="section-header">❌ Errors</h3>
              {analysis.errors.map((err, i) => (
                <div key={i} className="validation-message">
                  {err}
                </div>
              ))}
            </div>
          )}

          {analysis.warnings.length > 0 && (
            <div className="validation-section warning">
              <h3 className="section-header">⚠️ Warnings</h3>
              {analysis.warnings.map((warn, i) => (
                <div key={i} className="validation-message">
                  {warn}
                </div>
              ))}
            </div>
          )}

          {/* Total Cost */}
          <div className="cost-section">
            <h3 className="section-header">💰 Total Cost</h3>
            <div className="cost-card">
              <div className="cost-label">Build Total</div>
              <div className="cost-value">${analysis.totalCost}</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Buttons */}
      <div className="bottom-buttons">
        <button className="action-btn save" onClick={() => navigate("/build", { state: { build } })}>
          💾 Save
        </button>
        <button className="action-btn order">🛒 Order</button>
      </div>

      {/* Menu Drawer */}
      {menuOpen && (
        <div className="menu-overlay">
          <div className="menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-top-right">
              <button className="icon-btn menu-btn" onClick={() => setMenuOpen(false)}>
                ☰
              </button>
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

