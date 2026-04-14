/**
 * RoutingService.js
 * Interacts with OSRM. Handles caching and retries.
 */

const CACHE = new Map();

async function fetchRouteWithRetry(origin, destination, retries = 3) {
    const cacheKey = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}`;
    
    if (CACHE.has(cacheKey)) {
        console.log("[Route] Cache hit");
        return CACHE.get(cacheKey);
    }

    const osrmApiUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(osrmApiUrl);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const coords = data.routes[0].geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
                CACHE.set(cacheKey, coords);
                
                // Prevent memory leak in very long simulations
                if (CACHE.size > 50) CACHE.clear(); 

                return coords;
            }
        } catch (err) {
            console.error(`[Route] OSRM Fetch Attempt ${attempt} failed: ${err.message}`);
            if (attempt === retries) {
                console.error("[Route] All OSRM retries exhausted. Providing fallback direct route.");
                // Fallback direct line matching {lat, lng} structure exactly
                return [{ lat: origin.lat, lng: origin.lng }, { lat: destination.lat, lng: destination.lng }];
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
    }
    return [{ lat: origin.lat, lng: origin.lng }, { lat: destination.lat, lng: destination.lng }];
}

module.exports = {
    fetchRoute: fetchRouteWithRetry
};
