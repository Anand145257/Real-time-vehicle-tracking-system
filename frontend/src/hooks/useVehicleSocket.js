import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export function useVehicleSocket(token) {
    const [socketData, setSocketData] = useState({
        location: null,
        speed: 0,
        riskScore: 0,
        status: 'Safe',
        routeCoordinates: [],
        sosAlert: null,
        trafficAlert: null
    });

    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) {
            setIsConnected(false);
            return;
        }

        const socket = io(SOCKET_URL, {
            auth: { token },
            reconnectionAttempts: 10,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            console.log("Connected to backend");
            setIsConnected(true);
            socket.emit('startTracking');
        });
        
        socket.on('disconnect', () => setIsConnected(false));
        
        socket.on('connect_error', (err) => {
            console.error("Socket Connection Error:", err.message);
            setIsConnected(false);
        });

        // Clear listeners to prevent duplicate triggers
        socket.off('vehicleUpdate');
        socket.off('routeUpdate');
        socket.off('sosAlert');
        socket.off('trafficAlert');

        socket.on('vehicleUpdate', (data) => {
            setSocketData(prev => ({
                ...prev,
                location: data.location,
                speed: data.speed,
                riskScore: data.riskScore,
                status: data.status,
                // Clear SOS if risk is low again
                sosAlert: data.riskScore <= 75 ? null : prev.sosAlert
            }));
        });

        socket.on('routeUpdate', (data) => {
            if (data && data.route) {
                setSocketData(prev => ({ ...prev, routeCoordinates: data.route }));
            }
        });

        socket.on('sosAlert', (data) => {
            setSocketData(prev => ({ ...prev, sosAlert: data }));
        });

        socket.on('trafficAlert', (data) => {
            setSocketData(prev => ({ ...prev, trafficAlert: data }));
            // Auto-dismiss traffic alert after 8 seconds
            setTimeout(() => {
                setSocketData(prev => ({ ...prev, trafficAlert: null }));
            }, 8000);
        });

        return () => {
            socket.disconnect();
        };
    }, [token]);

    return { ...socketData, isConnected };
}
