import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import RouteLayer from './RouteLayer';
import { useSocket } from '../context/SocketContext';

const DEFAULT_CENTER = { lat: 19.0760, lng: 72.8777 };
const DESTINATION     = { lat: 19.0820, lng: 72.8810 };

// ── Vehicle icon — pulsing ring when risk is high ──
const buildVehicleIcon = (riskScore) => {
  const ringColor = riskScore > 75 ? '#ef4444' : riskScore > 40 ? '#f59e0b' : '#10b981';
  const bgColor   = riskScore > 75 ? '#ef4444' : '#3b82f6';
  return new L.DivIcon({
    html: `
      <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
        ${riskScore > 40 ? `
          <div style="
            position:absolute;inset:-6px;border-radius:50%;
            border:2px solid ${ringColor};opacity:0.6;
            animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite;
          "></div>` : ''}
        <div style="
          width:40px;height:40px;border-radius:50%;
          background:${bgColor};
          border:2.5px solid rgba(255,255,255,0.9);
          box-shadow:0 4px 14px rgba(0,0,0,0.4), 0 0 12px ${ringColor}55;
          display:flex;align-items:center;justify-content:center;
          font-size:1.15rem;z-index:1;
        ">🚗</div>
      </div>`,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

const destinationIcon = new L.DivIcon({
  html: `<div style="
    width:36px;height:36px;border-radius:50%;
    background:linear-gradient(135deg,#ef4444,#dc2626);
    border:2.5px solid rgba(255,255,255,0.9);
    box-shadow:0 4px 14px rgba(239,68,68,0.5);
    display:flex;align-items:center;justify-content:center;
    color:white;font-weight:800;font-size:0.8rem;font-family:Inter,sans-serif;
  ">END</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// Ping style injected once
if (!document.getElementById('marker-ping-style')) {
  const style = document.createElement('style');
  style.id = 'marker-ping-style';
  style.textContent = `@keyframes ping {
    75%, 100% { transform: scale(2); opacity: 0; }
  }`;
  document.head.appendChild(style);
}

// Auto pan  
const AutoPan = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) map.panTo(location, { animate: true, duration: 2.2 });
  }, [location, map]);
  return null;
};

const MapView = () => {
  const { location, routeCoordinates, riskScore, geofenceAlert } = useSocket();

  const vehicleIcon = React.useMemo(
    () => buildVehicleIcon(riskScore),
    [riskScore > 75, riskScore > 40] // only rebuild on status change, not every tick
  );

  // Geofence circle color changes on breach
  const geofenceColor = geofenceAlert ? '#ef4444' : '#3b82f6';

  return (
    <div className="map-panel">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={14}
        zoomControl={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* CARTO Dark Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Auto pan to vehicle */}
        <AutoPan location={location || DEFAULT_CENTER} />

        {/* Geofence safe zone */}
        <Circle
          center={DEFAULT_CENTER}
          radius={500}
          pathOptions={{
            color: geofenceColor,
            fillColor: geofenceColor,
            fillOpacity: geofenceAlert ? 0.08 : 0.05,
            weight: 2,
            dashArray: '6 6',
          }}
        />

        {/* Route polyline */}
        <RouteLayer coordinates={routeCoordinates} />

        {/* Vehicle marker */}
        <Marker position={location || DEFAULT_CENTER} icon={vehicleIcon} />

        {/* Destination marker */}
        <Marker position={DESTINATION} icon={destinationIcon} />
      </MapContainer>
    </div>
  );
};

export default React.memo(MapView);
