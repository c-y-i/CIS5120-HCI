import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/home.css";
import "../styles/analysis.css";     // reuse typography/sections/palette
import "../styles/profile.css";      // small profile-only tweaks
import logo from "../assets/logo.png";

export default function UserProfilePage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [edit, setEdit] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Pass userId via route state or default to "leo"
    const userId = location.state?.userId || "leo";
    const ghAvatar = (u) => (u ? `https://github.com/${u}.png` : "");

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:8000/api/users/${userId}`);
                if (!res.ok) throw new Error((await res.json()).detail || "Failed to load profile");
                const data = await res.json();
                setUser(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [userId]);

    const onChange = (path, value) => {
        setUser(prev => {
            const next = { ...prev };
            if (path.startsWith("preferences.")) {
                const key = path.split(".")[1];
                next.preferences = { ...(next.preferences || {}), [key]: value };
            } else {
                next[path] = value;
            }
            return next;
        });
    };

    const saveProfile = async () => {
        if (!user) return;
        setSaving(true);
        setError(null);
        try {
            // PUT full profile (keeps schema simple)
            const res = await fetch(`http://localhost:8000/api/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
            if (!res.ok) throw new Error((await res.json()).detail || "Save failed");
            const saved = await res.json();
            setUser(saved);
            setEdit(false);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

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

            {/* Page Title */}
            <div className="page-header">
                <h2 className="page-title">Profile</h2>
            </div>

            {/* Loading */}
            {loading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading profile…</p>
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div className="error-message">
                    <p>⚠️ {error}</p>
                    <button className="action-btn analysis" onClick={() => navigate(0)}>Retry</button>
                </div>
            )}

            {/* Content */}
            {user && !loading && (
                <div className="analysis-content">
                    {/* Identity Card (uses your highlight gradient style) */}
                    <div className="metric-card highlight profile-identity">
                        <div className="metric-icon" aria-hidden>👤</div>
                        <div className="metric-content">
                            <div className="metric-label">Display Name</div>
                            {!edit ? (
                                <div className="metric-value-large">{user.displayName}</div>
                            ) : (
                                <input
                                    className="input-field"
                                    value={user.displayName || ""}
                                    onChange={(e) => onChange("displayName", e.target.value)}
                                    placeholder="Your name"
                                />
                            )}
                            <div className="metric-badge">User ID: {user.id}</div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="metric-card">
                        <div className="metric-icon">✉️</div>
                        <div className="metric-content">
                            <div className="metric-label">Email</div>
                            {!edit ? (
                                <div className="metric-value">{user.email}</div>
                            ) : (
                                <input
                                    className="input-field"
                                    value={user.email || ""}
                                    onChange={(e) => onChange("email", e.target.value)}
                                    placeholder="name@example.com"
                                />
                            )}
                            <div className="metric-subtitle">Used for notifications and orders</div>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon">🐙</div>
                        <div className="metric-content">
                            <div className="metric-label">GitHub Username</div>
                            {!edit ? (
                                <div className="metric-value">{user.githubUsername || "—"}</div>
                            ) : (
                                <input
                                    className="input-field"
                                    value={user.githubUsername || ""}
                                    onChange={(e) => onChange("githubUsername", e.target.value)}
                                    placeholder="octocat"
                                />
                            )}

                            {/* Preview */}
                            {user.githubUsername && (
                                <div className="avatar-preview" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <img
                                        src={ghAvatar(user.githubUsername)}
                                        alt="GitHub avatar"
                                        width={72}
                                        height={72}
                                        style={{ borderRadius: 12, objectFit: "cover", border: "2px solid rgba(0,0,0,0.1)" }}
                                    />
                                    <a
                                        href={`https://github.com/${user.githubUsername}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="link"
                                    >
                                        github.com/{user.githubUsername}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preferences (cards use your soft greys/blue) */}
                    <h3 className="section-header">⚙️ Preferences</h3>
                    <div className="pref-grid">
                        <div className="pref-card">
                            <div className="pref-icon">🎨</div>
                            <div className="pref-label">Theme</div>
                            {!edit ? (
                                <div className="pref-value">{user.preferences?.theme || "system"}</div>
                            ) : (
                                <select
                                    className="component-select-dropdown"
                                    value={user.preferences?.theme || "system"}
                                    onChange={(e) => onChange("preferences.theme", e.target.value)}
                                >
                                    <option value="dark">dark</option>
                                    <option value="light">light</option>
                                    <option value="system">system</option>
                                </select>
                            )}
                        </div>

                        <div className="pref-card">
                            <div className="pref-icon">🔔</div>
                            <div className="pref-label">Notifications</div>
                            {!edit ? (
                                <div className="pref-value">{user.preferences?.notifications || "disabled"}</div>
                            ) : (
                                <select
                                    className="component-select-dropdown"
                                    value={user.preferences?.notifications || "disabled"}
                                    onChange={(e) => onChange("preferences.notifications", e.target.value)}
                                >
                                    <option value="enabled">enabled</option>
                                    <option value="disabled">disabled</option>
                                </select>
                            )}
                        </div>

                        <div className="pref-card">
                            <div className="pref-icon">🌐</div>
                            <div className="pref-label">Language</div>
                            {!edit ? (
                                <div className="pref-value">{user.preferences?.language || "en-US"}</div>
                            ) : (
                                <input
                                    className="input-field"
                                    value={user.preferences?.language || "en-US"}
                                    onChange={(e) => onChange("preferences.language", e.target.value)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="flight-card highlight" style={{ margin: "14px" }}>
                        <div className="flight-icon">⏱️</div>
                        <div className="flight-label">Last Updated</div>
                        <div className="flight-value-large">
                            {new Date(user.updatedAt || user.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Buttons */}
            {!loading && (
                <div className="bottom-buttons">
                    {!edit ? (
                        <>
                            <button className="action-btn save" onClick={() => setEdit(true)}>✏️ Edit</button>
                            <button className="action-btn order" onClick={() => navigate(-1)}>← Back</button>
                        </>
                    ) : (
                        <>
                            <button className="action-btn save" onClick={saveProfile} disabled={saving}>
                                {saving ? "Saving…" : "💾 Save"}
                            </button>
                            <button className="action-btn order" onClick={() => setEdit(false)}>Cancel</button>
                        </>
                    )}
                </div>
            )}

            {/* Menu Drawer */}
            {menuOpen && (
                <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
                    <div className="menu-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-top-right">
                            <button className="icon-btn menu-btn" onClick={() => setMenuOpen(false)}>☰</button>
                        </div>
                        <button className="menu-item" onClick={() => navigate("/build")}>Build Configuration</button>
                        <button className="menu-item" onClick={() => navigate("/analysis", { state: { build: null } })}>Analysis</button>
                        <button className="menu-item" onClick={() => navigate("/profile", { state: { userId } })}>Profile</button>
                        <button className="menu-item">Documentation</button>
                    </div>
                    <div className="menu-backdrop" />
                </div>
            )}
        </div>
    );
}
