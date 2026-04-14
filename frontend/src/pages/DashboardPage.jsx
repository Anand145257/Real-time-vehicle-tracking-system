import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import MapView from '../components/MapView';
import MetricsPanel from '../components/MetricsPanel';
import { useSocket } from '../context/SocketContext';

const DashboardPage = () => {
    const { isConnected, trafficAlert } = useSocket();

    return (
        <div className="dashboard-container">

            {/* ── Connecting overlay ── */}
            {!isConnected && (
                <div className="loading-overlay">
                    <div className="loader-spinner" />
                    <h2>Connecting to backend...</h2>
                    <p>Establishing secure Socket.io link to the real-time simulation engine.</p>
                </div>
            )}

            {/* ── Traffic alert banner ── */}
            {trafficAlert && (
                <div className="traffic-alert-banner" role="alert">
                    ⚠️ {trafficAlert.message}
                </div>
            )}

            {/* ── Map (left, flex 1) ── */}
            <ErrorBoundary>
                <MapView />
            </ErrorBoundary>

            {/* ── Metrics panel (right, fixed 320px) ── */}
            <ErrorBoundary>
                <MetricsPanel />
            </ErrorBoundary>

        </div>
    );
};

export default DashboardPage;
