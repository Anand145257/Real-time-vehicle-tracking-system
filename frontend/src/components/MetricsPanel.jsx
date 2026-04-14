import React from 'react';
import { Gauge, Activity, ShieldCheck, ShieldAlert, AlertTriangle, Wifi, WifiOff, TriangleAlert } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const MetricsPanel = () => {
    const { speed, riskScore, status, sosAlert, geofenceAlert, isConnected } = useSocket();

    // Determine risk bar color
    const riskColor =
        riskScore > 75 ? 'var(--danger)' :
        riskScore > 40 ? 'var(--warning)' :
        'var(--primary)';

    const statusClass =
        status === 'Danger' ? 'danger' :
        status === 'Warning' ? 'warning' :
        'safe';

    const StatusIcon =
        status === 'Danger' ? ShieldAlert :
        status === 'Warning' ? AlertTriangle :
        ShieldCheck;

    return (
        <aside className="metrics-panel" aria-label="Live metrics panel">
            {/* Header */}
            <div className="metrics-panel-header">
                <span className="metrics-panel-title">Live Telemetry</span>
                <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}
                    title={isConnected ? 'Backend connected' : 'Backend disconnected'}>
                    {isConnected
                        ? <><span className="connection-dot connected" /><Wifi size={12} /></>
                        : <><span className="connection-dot disconnected" /><WifiOff size={12} /></>
                    }
                </div>
            </div>

            {/* Body */}
            <div className="metrics-panel-body">

                {/* Speed Card */}
                <div className="metric-card" style={{ animationDelay: '0ms' }}>
                    <div className="metric-card-label">
                        <Gauge size={13} />
                        Speed
                    </div>
                    <div className="metric-card-value" style={{ color: speed > 90 ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {speed}
                        <span className="metric-card-unit">km/h</span>
                    </div>
                </div>

                {/* Risk Score Card */}
                <div className="metric-card" style={{ animationDelay: '60ms' }}>
                    <div className="metric-card-label">
                        <Activity size={13} />
                        AI Risk Score
                    </div>
                    <div className="metric-card-value" style={{ color: riskColor }}>
                        {riskScore}
                        <span className="metric-card-unit">/ 100</span>
                    </div>
                    {/* Animated progress bar */}
                    <div className="risk-bar-track">
                        <div
                            className="risk-bar-fill"
                            style={{
                                width: `${riskScore}%`,
                                background: riskColor,
                            }}
                        />
                    </div>
                </div>

                {/* Status Card */}
                <div className="metric-card" style={{ animationDelay: '120ms' }}>
                    <div className="metric-card-label">
                        <StatusIcon size={13} />
                        System Status
                    </div>
                    <div style={{ marginTop: '4px' }}>
                        <span className={`status-badge ${statusClass}`}>
                            <StatusIcon size={13} />
                            {status}
                        </span>
                    </div>
                </div>

                {/* Geofence Alert */}
                {geofenceAlert && (
                    <div className="geofence-alert-box">
                        <TriangleAlert size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>Geofence Breach</div>
                            <div style={{ fontSize: '0.78rem', marginTop: 3, opacity: 0.85 }}>
                                Vehicle has exited the designated safe zone.
                            </div>
                        </div>
                    </div>
                )}

                {/* SOS Alert */}
                {sosAlert && (
                    <div className="sos-alert-box">
                        <div className="sos-alert-header">
                            <ShieldAlert size={16} />
                            SOS Activated
                        </div>
                        <div className="sos-alert-reason">{sosAlert.reason}</div>
                    </div>
                )}

                {/* Idle state */}
                {!isConnected && !sosAlert && (
                    <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.82rem',
                        lineHeight: 1.7,
                    }}>
                        Waiting for backend connection…<br />
                        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                            Start the backend server to begin telemetry
                        </span>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default React.memo(MetricsPanel);
