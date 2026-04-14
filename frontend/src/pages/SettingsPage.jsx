import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, MapPin, Info, Save, CheckCircle, Clock, User, Server } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEYS = {
    RISK_THRESHOLD: 'sos_risk_threshold',
    GEOFENCE_RADIUS: 'sos_geofence_radius',
};

const SettingsPage = () => {
    const { isConnected } = useSocket();
    const { user } = useAuth();

    const [riskThreshold, setRiskThreshold] = useState(
        () => parseInt(localStorage.getItem(STORAGE_KEYS.RISK_THRESHOLD) || '75', 10)
    );
    const [geofenceRadius, setGeofenceRadius] = useState(
        () => parseInt(localStorage.getItem(STORAGE_KEYS.GEOFENCE_RADIUS) || '500', 10)
    );
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEYS.RISK_THRESHOLD, String(riskThreshold));
        localStorage.setItem(STORAGE_KEYS.GEOFENCE_RADIUS, String(geofenceRadius));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const riskColor =
        riskThreshold > 75 ? 'var(--danger)' :
        riskThreshold > 40 ? 'var(--warning)' :
        'var(--primary)';

    return (
        <div style={{ overflow: 'hidden auto', flex: 1 }}>
        <div className="settings-page">
            {/* Header */}
            <div className="settings-page-header">
                <h1>Settings</h1>
                <p>Configure visual thresholds and display preferences. The backend simulation runs independently.</p>
            </div>

            {/* ── Risk Configuration ── */}
            <div className="settings-section" style={{ animationDelay: '0ms' }}>
                <div className="settings-section-header">
                    <div className="settings-section-icon" style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}>
                        <SlidersHorizontal size={16} color="var(--danger)" />
                    </div>
                    <div>
                        <div className="settings-section-title">Risk Threshold</div>
                        <div className="settings-section-sub">Visual status triggers based on AI risk score</div>
                    </div>
                </div>

                <div className="settings-field">
                    <div className="settings-field-info">
                        <div className="settings-field-label">Warning Threshold</div>
                        <div className="settings-field-desc">
                            Risk score above this value changes status to <span style={{ color: 'var(--warning)' }}>Warning</span>. Currently: <strong style={{ color: riskColor }}>{riskThreshold}</strong>
                        </div>
                    </div>
                    <div className="settings-field-control" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input
                            id="setting-risk-threshold"
                            type="range"
                            min="20"
                            max="90"
                            step="5"
                            value={riskThreshold}
                            onChange={e => setRiskThreshold(Number(e.target.value))}
                            className="settings-slider"
                        />
                        <span className="settings-value-display" style={{ color: riskColor }}>{riskThreshold}</span>
                    </div>
                </div>

                <div className="settings-field">
                    <div className="settings-field-info">
                        <div className="settings-field-label">Danger Threshold</div>
                        <div className="settings-field-desc">
                            Risk score above <strong style={{ color: 'var(--danger)' }}>{riskThreshold + 15 > 100 ? 100 : riskThreshold + 15}</strong> triggers <span style={{ color: 'var(--danger)' }}>Danger</span> status and SOS alert
                        </div>
                    </div>
                    <div className="settings-field-control">
                        <span className="settings-info-value" style={{ color: 'var(--danger)' }}>
                            {Math.min(100, riskThreshold + 15)}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Geofence Configuration ── */}
            <div className="settings-section" style={{ animationDelay: '80ms' }}>
                <div className="settings-section-header">
                    <div className="settings-section-icon" style={{ background: 'var(--info-bg)', border: '1px solid var(--info-border)' }}>
                        <MapPin size={16} color="var(--info)" />
                    </div>
                    <div>
                        <div className="settings-section-title">Geofence Safe Zone</div>
                        <div className="settings-section-sub">Visual radius displayed on the map (backend controls breach logic)</div>
                    </div>
                </div>

                <div className="settings-field">
                    <div className="settings-field-info">
                        <div className="settings-field-label">Safe Zone Radius</div>
                        <div className="settings-field-desc">
                            Visual circle radius on the map. The simulation engine uses 500m internally.
                        </div>
                    </div>
                    <div className="settings-field-control" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                            id="setting-geofence-radius"
                            type="number"
                            min="100"
                            max="2000"
                            step="50"
                            value={geofenceRadius}
                            onChange={e => setGeofenceRadius(Math.max(100, Math.min(2000, Number(e.target.value))))}
                            className="settings-number-input"
                        />
                        <span className="settings-value-display">m</span>
                    </div>
                </div>
            </div>

            {/* ── System Info ── */}
            <div className="settings-section" style={{ animationDelay: '160ms' }}>
                <div className="settings-section-header">
                    <div className="settings-section-icon" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-default)' }}>
                        <Info size={16} color="var(--text-muted)" />
                    </div>
                    <div>
                        <div className="settings-section-title">System Information</div>
                        <div className="settings-section-sub">Read-only connection and runtime details</div>
                    </div>
                </div>

                <div className="settings-field">
                    <div className="settings-field-info">
                        <div className="settings-field-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <User size={12} /> Operator
                        </div>
                    </div>
                    <span className="settings-info-value">{user?.username || 'admin'}</span>
                </div>

                <div className="settings-field">
                    <div className="settings-field-info">
                        <div className="settings-field-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Server size={12} /> Backend URL
                        </div>
                    </div>
                    <span className="settings-info-value">http://localhost:3000</span>
                </div>

                <div className="settings-field">
                    <div className="settings-field-info">
                        <div className="settings-field-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={12} /> Update Interval
                        </div>
                    </div>
                    <span className="settings-info-value">2.5s per tick</span>
                </div>

                <div className="settings-field">
                    <div className="settings-field-info">
                        <div className="settings-field-label">Connection Status</div>
                    </div>
                    <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                        <span className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`} />
                        {isConnected ? 'Socket Connected' : 'Socket Offline'}
                    </div>
                </div>
            </div>

            {/* Save / Toast */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button
                    id="btn-save-settings"
                    className="settings-save-btn"
                    onClick={handleSave}
                >
                    <Save size={16} />
                    Save Preferences
                </button>
                {saved && (
                    <div className="settings-toast">
                        <CheckCircle size={15} />
                        Preferences saved!
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

export default SettingsPage;
