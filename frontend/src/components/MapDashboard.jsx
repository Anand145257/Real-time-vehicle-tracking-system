import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import RouteLayer from './RouteLayer';

const DEFAULT_CENTER = { lat: 19.0760, lng: 72.8777 }; 
const DESTINATION = { lat: 19.0820, lng: 72.8810 }; 

// Custom HTML Markers using Leaflet's DivIcon
// CSS transition provides incredibly smooth 60fps-like marker interpolation between the 2.5s socket updates
const vehicleIcon = new L.DivIcon({
  html: `<div style="transition: transform 2.5s linear, top 2.5s linear, left 2.5s linear; display: flex; align-items: center; justify-content: center; background: #3b82f6; width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 1.2rem;">🚗</div>`,
  className: '', 
  iconSize: [40, 40],
  iconAnchor: [20, 20] 
});

const destinationIcon = new L.DivIcon({
  html: `<div style="display: flex; align-items: center; justify-content: center; background: #ef4444; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: white; font-weight: bold;">E</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Auto-pan map to maintain vehicle in view
const UpdateMapCenter = ({ location }) => {
    const map = useMap();
    useEffect(() => {
        if (location) map.panTo(location, { animate: true, duration: 2.5 });
    }, [location, map]);
    return null;
};

const MapDashboard = ({ location, routeCoordinates }) => {
    return (
        <div className="map-container">
            <MapContainer 
              center={DEFAULT_CENTER} 
              zoom={14} 
              zoomControl={true}
              style={{ height: '100%', width: '100%' }}
            >
                {/* Premium Dark Theme TileLayer via CartoDB */}
                <TileLayer
                    attribution='&copy; OpenStreetMap | CARTO'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                <UpdateMapCenter location={location || DEFAULT_CENTER} />

                {/* Geofence Boundary Visualization */}
                <Circle 
                    center={DEFAULT_CENTER} 
                    radius={500} 
                    pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 2, dashArray: '8, 8' }} 
                />

                {/* Pure Render Component */}
                <RouteLayer coordinates={routeCoordinates} />
                
                {/* Simulated markers */}
                <Marker position={location || DEFAULT_CENTER} icon={vehicleIcon} />
                <Marker position={DESTINATION} icon={destinationIcon} />
            </MapContainer>
        </div>
    );
};

export default React.memo(MapDashboard);
