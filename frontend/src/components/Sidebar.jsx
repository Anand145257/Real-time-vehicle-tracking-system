import React from 'react';
import { AlertCircle, Gauge, Activity, ShieldAlert, Wifi, WifiOff } from 'lucide-react';

const Sidebar = ({ speed, riskScore, status, sosAlert, isConnected }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h1>Auto SOS System</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isConnected ? <Wifi size={12} color="var(--primary)" /> : <WifiOff size={12} color="var(--danger)" />}
                    {isConnected ? 'Live Telemetry Active' : 'Disconnected'}
                </p>
            </div>

            <div className="sidebar-content">
                <div className="metric-card">
                    <div className="metric-header"><Gauge size={16} style={{ display: 'inline', marginRight: '8px' }} /> Speed</div>
                    <div className="metric-value">{speed} <span className="metric-unit">km/h</span></div>
                </div>

                <div className="metric-card">
                    <div className="metric-header"><Activity size={16} style={{ display: 'inline', marginRight: '8px' }} /> AI Risk Score</div>
                    <div className="metric-value" style={{ color: riskScore > 75 ? 'var(--danger)' : riskScore > 40 ? 'var(--warning)' : 'var(--primary)' }}>
                        {riskScore} <span className="metric-unit">/ 100</span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header"><ShieldAlert size={16} style={{ display: 'inline', marginRight: '8px' }} /> Status</div>
                    <div className="metric-value" style={{ fontSize: '1.5rem', color: status === 'Safe' ? 'var(--primary)' : status === 'Warning' ? 'var(--warning)' : 'var(--danger)' }}>
                        {status}
                    </div>
                </div>

                {sosAlert && (
                    <div className="sos-alert">
                        <AlertCircle size={24} style={{ flexShrink: 0 }} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>SOS ACTIVATED</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{sosAlert.reason}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(Sidebar);
