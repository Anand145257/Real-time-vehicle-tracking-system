import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, MapPin, Trash2, ShieldAlert, Wifi } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const TABS = [
    { id: 'all',      label: 'All Alerts',  icon: AlertCircle },
    { id: 'sos',      label: 'SOS',         icon: ShieldAlert },
    { id: 'traffic',  label: 'Traffic',     icon: AlertTriangle },
    { id: 'geofence', label: 'Geofence',    icon: MapPin },
];

function formatTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const AlertItem = ({ alert, index }) => {
    const isTraffic  = alert.type === 'traffic';
    const isGeofence = alert.type === 'geofence';
    const isSOS      = alert.type === 'sos';

    const iconClass  = isSOS ? 'sos' : isTraffic ? 'traffic' : 'geofence';
    const severity   = isSOS ? 'high' : isTraffic ? 'medium' : 'low';
    const Icon       = isSOS ? ShieldAlert : isTraffic ? AlertTriangle : MapPin;

    const title =
        isSOS      ? 'SOS Alert' :
        isTraffic  ? 'Traffic Alert' :
        'Geofence Breach';

    const message =
        isSOS      ? (alert.reason || 'High risk detected') :
        isTraffic  ? (alert.message || 'Heavy traffic detected — route recalculating') :
        'Vehicle exited the designated safe zone';

    return (
        <div className="alert-item" style={{ animationDelay: `${index * 40}ms` }}>
            <div className={`alert-item-icon ${iconClass}`}>
                <Icon size={18} />
            </div>
            <div className="alert-item-body">
                <div className="alert-item-title">{title}</div>
                <div className="alert-item-message">{message}</div>
                <div className="alert-item-meta">
                    <span className="alert-item-time">
                        {formatDate(alert.receivedAt)} · {formatTime(alert.receivedAt)}
                    </span>
                    <span className={`alert-severity-badge ${severity}`}>{severity}</span>
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ activeTab }) => (
    <div className="alerts-empty">
        <div className="alerts-empty-icon">
            <AlertCircle size={30} color="var(--text-muted)" />
        </div>
        <h3>No alerts yet</h3>
        <p>
            {activeTab === 'all'
                ? 'All SOS, traffic, and geofence alerts will appear here as the vehicle is tracked in real-time.'
                : `No ${activeTab} alerts have been triggered yet.`}
        </p>
    </div>
);

const AlertsPage = () => {
    const { alertHistory, clearAlertHistory, isConnected } = useSocket();
    const [activeTab, setActiveTab] = useState('all');

    const filtered = activeTab === 'all'
        ? alertHistory
        : alertHistory.filter(a => a.type === activeTab);

    const countForTab = (id) =>
        id === 'all' ? alertHistory.length : alertHistory.filter(a => a.type === id).length;

    return (
        <div className="alerts-page">
            {/* Header */}
            <div className="alerts-page-header">
                <div>
                    <h1 className="alerts-page-title">Alert History</h1>
                    <p className="alerts-page-sub">
                        Real-time SOS, traffic, and geofence events — {alertHistory.length} total recorded
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Live indicator */}
                    <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                        <span className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`} />
                        {isConnected ? 'Monitoring Live' : 'Backend Offline'}
                    </div>
                    {alertHistory.length > 0 && (
                        <button
                            id="btn-clear-alerts"
                            className="btn-ghost-danger"
                            onClick={clearAlertHistory}
                        >
                            <Trash2 size={14} />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="alerts-tabs" role="tablist">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        id={`tab-${id}`}
                        role="tab"
                        aria-selected={activeTab === id}
                        className={`alerts-tab${activeTab === id ? ' active' : ''}`}
                        onClick={() => setActiveTab(id)}
                    >
                        <Icon size={14} />
                        {label}
                        <span className="alerts-tab-badge">{countForTab(id)}</span>
                    </button>
                ))}
            </div>

            {/* Alert List */}
            <div className="alerts-list-container" role="tabpanel">
                {filtered.length === 0 ? (
                    <EmptyState activeTab={activeTab} />
                ) : (
                    filtered.map((alert, i) => (
                        <AlertItem key={alert.id || i} alert={alert} index={i} />
                    ))
                )}
            </div>
        </div>
    );
};

export default AlertsPage;
