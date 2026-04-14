import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bell, Settings, LogOut, Shield, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const NavBar = () => {
    const { logout } = useAuth();
    const { isConnected, alertHistory } = useSocket();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    // Count unread alerts (SOS + traffic + geofence types)
    const unreadCount = alertHistory.length;

    return (
        <nav className="navbar" role="navigation" aria-label="Main navigation">
            {/* Brand */}
            <NavLink to="/dashboard" className="navbar-brand">
                <div className="navbar-brand-icon">
                    <Shield size={18} color="#fff" />
                </div>
                <div className="navbar-brand-text">
                    <span className="navbar-brand-title">Auto SOS</span>
                    <span className="navbar-brand-sub">Vehicle Tracking</span>
                </div>
            </NavLink>

            {/* Nav Links */}
            <div className="navbar-links">
                <NavLink
                    to="/dashboard"
                    id="nav-dashboard"
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                    <LayoutDashboard size={15} />
                    Dashboard
                </NavLink>

                <NavLink
                    to="/alerts"
                    id="nav-alerts"
                    className={({ isActive }) => `nav-link nav-alert-indicator${isActive ? ' active' : ''}`}
                >
                    <Bell size={15} />
                    Alerts
                    {unreadCount > 0 && (
                        <span className="nav-alert-count">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </NavLink>

                <NavLink
                    to="/settings"
                    id="nav-settings"
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                    <Settings size={15} />
                    Settings
                </NavLink>
            </div>

            {/* Right side */}
            <div className="navbar-right">
                {/* Connection Status */}
                <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                    <span className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`} />
                    {isConnected ? 'Live' : 'Offline'}
                </div>

                {/* Logout */}
                <button
                    id="nav-logout"
                    className="nav-logout-btn"
                    onClick={handleLogout}
                    aria-label="Logout"
                >
                    <LogOut size={14} />
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default NavBar;
