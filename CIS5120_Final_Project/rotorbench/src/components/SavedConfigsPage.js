import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/home.css";
import "../styles/analysis.css";
import logo from "../assets/logo.png";

const API_BASE =
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8000";

export default function SavedConfigsPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    const [q, setQ] = useState("");
    const [busyId, setBusyId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const userId = location.state?.userId || localStorage.getItem("userId") || "leo";

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE}/api/builds?userId=${encodeURIComponent(userId)}`);
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();

                // sort newest first (createdAt/updatedAt)
                const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
                    const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
                    const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
                    return tb - ta;
                });
                setItems(sorted);
            } catch (e) {
                setError(e.message || "Failed to load saved builds");
            } finally {
                setLoading(false);
            }
        })();
    }, [userId]);

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return items;
        return items.filter((it) => {
            const idx = items.indexOf(it);
            const fallbackName = `Saved Config #${idx + 1}`;
            const name = (it.name || fallbackName || it.id || "").toLowerCase();
            const note = (it.note || "").toLowerCase();
            return name.includes(term) || note.includes(term);
        });
    }, [items, q]);

    const displayName = (it) => {
        const idx = items.indexOf(it);
        return it.name && it.name.trim()
            ? it.name
            : `Saved Config #${idx + 1}`;
    };

    const openWithAnalysis = async (build) => {
        setBusyId(build.id);
        try {
            let analysis = null;

            // Try existing cached analysis
            let res = await fetch(`${API_BASE}/api/builds/${encodeURIComponent(build.id)}/analysis`);
            if (res.ok) {
                analysis = await res.json();
            } else if (res.status === 404) {
                // Run analysis if not present
                res = await fetch(`${API_BASE}/api/builds/${encodeURIComponent(build.id)}/analyze`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ force: false }),
                });
                if (!res.ok) throw new Error(await res.text());
                analysis = await res.json();
            } else {
                throw new Error(await res.text());
            }

            navigate("/analysis", { state: { build, analysis, userId } });
        } catch (e) {
            alert(e.message || "Failed to open analysis.");
        } finally {
            setBusyId(null);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const CompRow = ({ label, value }) => (
        <div style={{ display: "flex", gap: 8, padding: "4px 0" }}>
            <span className="saved-tag" style={{ width: 140 }}>{label}</span>
            <span className="saved-val" style={{ wordBreak: "break-all" }}>{value || "—"}</span>
        </div>
    );

    return (
        <div className={`app-container ${menuOpen ? "menu-open" : ""}`}>
            {/* Top Bar */}
            <div className="top-bar">
                <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)}>☰</button>
                <div className="logo-area">
                    <img src={logo} alt="logo" className="logo-icon" />
                    <span className="logo-text">RotorBench</span>
                </div>
                <button className="icon-btn home-btn" onClick={() => navigate("/")}>🏠</button>
            </div>

            {/* Header + search */}
            <div className="page-header">
                <h2 className="page-title">Saved Configurations</h2>
                <div className="saved-toolbar" style={{ display: "flex", gap: 10, padding: "0 14px" }}>
                    <input
                        className="input-field"
                        placeholder="Search saved configs…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button className="action-btn analysis" onClick={() => navigate("/build", { state: { userId } })}>
                        + New Build
                    </button>
                </div>
            </div>

            {/* Loading / Error */}
            {loading && (
                <div className="loading-container">
                    <div className="spinner" />
                    <p>Loading saved builds…</p>
                </div>
            )}
            {!loading && error && (
                <div className="error-message">
                    <p>⚠️ {error}</p>
                    <button className="action-btn analysis" onClick={() => navigate(0)}>Retry</button>
                </div>
            )}

            {/* List with dropdown per item */}
            {!loading && !error && (
                <div className="analysis-content" style={{ padding: "0 14px 14px" }}>
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="metric-card highlight">
                                <div className="metric-content">
                                    <div className="metric-label">No saved builds yet</div>
                                    <div className="metric-value">Create a build to see it here.</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {filtered.map((it) => {
                                const ids = it.componentIds || {};
                                const title = displayName(it);
                                const isOpen = expandedId === it.id;
                                return (
                                    <li key={it.id} style={{ marginBottom: 10 }}>
                                        <div className="metric-card" style={{ padding: 0 }}>
                                            {/* Row header */}
                                            <div
                                                className="metric-content"
                                                style={{ cursor: busyId === it.id ? "wait" : "pointer", padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}
                                                onClick={() => openWithAnalysis(it)}
                                                title="Open analysis"
                                            >
                                                <div>
                                                    <div className="metric-label">Build</div>
                                                    <div className="metric-value-large">{title}</div>
                                                    {it.note && <div className="metric-subtitle">{it.note}</div>}
                                                    {(it.updatedAt || it.createdAt) && (
                                                        <div className="metric-badge">
                                                            Updated {new Date(it.updatedAt || it.createdAt).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    className="action-btn"
                                                    style={{ marginLeft: 12 }}
                                                    onClick={(e) => { e.stopPropagation(); toggleExpand(it.id); }}
                                                    aria-expanded={isOpen}
                                                    title={isOpen ? "Hide components" : "Show components"}
                                                >
                                                    {isOpen ? "▾ Hide" : "▸ Components"}
                                                </button>
                                            </div>

                                            {/* Dropdown body */}
                                            {isOpen && (
                                                <div style={{ padding: "0 14px 14px" }}>
                                                    <CompRow label="Frame" value={ids.frameId} />
                                                    <CompRow label="Motor" value={ids.motorId} />
                                                    <CompRow label="Propeller" value={ids.propellerId} />
                                                    <CompRow label="ESC" value={ids.escId} />
                                                    <CompRow label="Flight Controller" value={ids.flightControllerId || it.fcId} />
                                                    <CompRow label="Battery" value={ids.batteryId} />
                                                    <CompRow label="Receiver" value={ids.receiverId} />
                                                    {typeof it.totalWeight !== "undefined" && (
                                                        <CompRow label="Total Weight" value={`${it.totalWeight} g`} />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            {/* Drawer */}
            {menuOpen && (
                <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
                    <div className="menu-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-top-right">
                            <button className="icon-btn menu-btn" onClick={() => setMenuOpen(false)}>☰</button>
                        </div>
                        <button className="menu-item" onClick={() => { setMenuOpen(false); navigate("/build", { state: { userId } }); }}>
                            Build Configuration
                        </button>
                        <button className="menu-item" onClick={() => { setMenuOpen(false); navigate("/saved", { state: { userId } }); }}>
                            Saved Configurations
                        </button>
                        <button className="menu-item" onClick={() => { setMenuOpen(false); navigate("/profile", { state: { userId } }); }}>
                            Profile
                        </button>
                    </div>
                    <div className="menu-backdrop" />
                </div>
            )}
        </div>
    );
}
