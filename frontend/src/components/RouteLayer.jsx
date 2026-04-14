import React from 'react';
import { Polyline } from 'react-leaflet';

const RouteLayer = ({ coordinates }) => {
    // We explicitly do NO math or API fetching here.
    // The backend provides the exact pathing array. Single source of truth.
    if (!coordinates || coordinates.length === 0) return null;

    return (
        <Polyline 
            positions={coordinates} 
            pathOptions={{ 
                color: '#3b82f6', // Bright blue
                weight: 6, 
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round'
            }} 
        />
    );
};

export default React.memo(RouteLayer);
