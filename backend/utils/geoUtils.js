/**
 * geoUtils.js
 * Utility functions for geo spatial calculations.
 */

/**
 * Calculates the great-circle distance between two points in meters (Haversine formula).
 */
function getDistanceMeter(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(dl / 2) * Math.sin(dl / 2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Moves point A towards point B by a specified distance.
 * If distance exceeds the gap, returns point B and the remaining distance.
 */
function moveTowards(p1, p2, distanceToMove) {
    const totalDist = getDistanceMeter(p1.lat, p1.lng, p2.lat, p2.lng);
    
    if (totalDist <= distanceToMove || totalDist === 0) {
        return { point: { ...p2 }, remaining: distanceToMove - totalDist };
    }
    
    const ratio = distanceToMove / totalDist;
    return {
        point: {
            lat: p1.lat + (p2.lat - p1.lat) * ratio,
            lng: p1.lng + (p2.lng - p1.lng) * ratio
        },
        remaining: 0
    };
}

module.exports = {
    getDistanceMeter,
    moveTowards
};
