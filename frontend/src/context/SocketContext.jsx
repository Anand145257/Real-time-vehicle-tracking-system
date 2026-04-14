import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = 'http://localhost:3000';

export const SocketProvider = ({ token, children }) => {
    const [socketData, setSocketData] = useState({
        location: null,
        speed: 0,
        riskScore: 0,
        status: 'Safe',
        routeCoordinates: [],
        sosAlert: null,
        trafficAlert: null,
        geofenceAlert: null,
        alertHistory: [],
        isConnected: false,
        connectionError: null,
    });

    // Keep a stable ref so we never recreate the socket on re-renders
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token) {
            setSocketData(prev => ({ ...prev, isConnected: false }));
            return;
        }

        const socket = io(SOCKET_URL, {
            auth: { token },
            reconnectionAttempts: 10,
            reconnectionDelay: 1500,
        });

        socketRef.current = socket;

        // --- Connection lifecycle ---
        socket.on('connect', () => {
            setSocketData(prev => ({ ...prev, isConnected: true, connectionError: null }));
            socket.emit('startTracking');
        });

        socket.on('disconnect', () => {
            setSocketData(prev => ({ ...prev, isConnected: false }));
        });

        socket.on('connect_error', (err) => {
            setSocketData(prev => ({ ...prev, isConnected: false, connectionError: err.message }));
        });

        // --- Telemetry Updates ---
        socket.on('vehicleUpdate', (data) => {
            setSocketData(prev => ({
                ...prev,
                location: data.location,
                speed: data.speed,
                riskScore: data.riskScore,
                status: data.status,
                // Clear SOS automatically when risk drops back below threshold
                sosAlert: data.riskScore <= 75 ? null : prev.sosAlert,
            }));
        });

        socket.on('routeUpdate', (data) => {
            if (data?.route) {
                setSocketData(prev => ({ ...prev, routeCoordinates: data.route }));
            }
        });

        // --- SOS Alert ---
        socket.on('sosAlert', (data) => {
            const alert = {
                ...data,
                type: 'sos',
                id: Date.now(),
                receivedAt: new Date().toISOString(),
            };
            setSocketData(prev => ({
                ...prev,
                sosAlert: alert,
                alertHistory: [alert, ...prev.alertHistory].slice(0, 100),
            }));
        });

        // --- Traffic Alert ---
        socket.on('trafficAlert', (data) => {
            const alert = {
                ...data,
                type: 'traffic',
                id: Date.now(),
                receivedAt: new Date().toISOString(),
            };
            setSocketData(prev => ({
                ...prev,
                trafficAlert: alert,
                alertHistory: [alert, ...prev.alertHistory].slice(0, 100),
            }));
            // Auto-dismiss banner after 8 seconds
            setTimeout(() => {
                setSocketData(prev => ({ ...prev, trafficAlert: null }));
            }, 8000);
        });

        // --- Geofence Alert (derived from sosAlert reason in backend) ---
        socket.on('geofenceAlert', (data) => {
            const alert = {
                ...data,
                type: 'geofence',
                id: Date.now(),
                receivedAt: new Date().toISOString(),
            };
            setSocketData(prev => ({
                ...prev,
                geofenceAlert: alert,
                alertHistory: [alert, ...prev.alertHistory].slice(0, 100),
            }));
            setTimeout(() => {
                setSocketData(prev => ({ ...prev, geofenceAlert: null }));
            }, 12000);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token]);

    const clearAlertHistory = () => {
        setSocketData(prev => ({ ...prev, alertHistory: [] }));
    };

    return (
        <SocketContext.Provider value={{ ...socketData, clearAlertHistory }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
    return ctx;
};
