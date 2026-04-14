/**
 * SimulationService.js
 * Core engine for real-time movement, risk assessment, and traffic reroutes.
 */
const { fetchRoute } = require('./RoutingService');
const { moveTowards, getDistanceMeter } = require('../utils/geoUtils');
const logger = require('../utils/logger');

class SimulationEngine {
    constructor(io) {
        this.io = io;
        this.DEFAULT_CENTER = { lat: 19.0760, lng: 72.8777 }; 
        this.DESTINATION = { lat: 19.0820, lng: 72.8810 };
        
        // Geofencing Safe Zone Configuration
        this.GEOFENCE_CENTER = { ...this.DEFAULT_CENTER };
        this.GEOFENCE_RADIUS_METERS = 500; // Trigger alert if more than 500m from origin

        this.state = {
            location: { ...this.DEFAULT_CENTER },
            speed: 0,
            previousSpeed: 0,
            idleTime: 0,
            riskScore: 0,
            status: 'Safe',
            routeCoordinates: [],
            currentRouteIndex: 0,
            isTrafficSimulated: false,
            sosTriggered: false,
            geofenceBreached: false
        };

        this.updateIntervalMs = 2500; // 2.5s update cycle
        this.loopTimer = null;
    }

    async init() {
        logger.info("Initializing Simulation Engine...");
        this.state.routeCoordinates = await fetchRoute(this.DEFAULT_CENTER, this.DESTINATION);
        logger.info(`Engine ready. Points loaded: ${this.state.routeCoordinates.length}`);
        this.startLoop();
    }

    startLoop() {
        if (this.loopTimer) clearInterval(this.loopTimer);
        this.loopTimer = setInterval(() => this.tick(), this.updateIntervalMs);
    }

    stopLoop() {
        if (this.loopTimer) {
            clearInterval(this.loopTimer);
            this.loopTimer = null;
        }
        logger.info("Simulation engine loop securely stopped.");
    }

    async triggerTrafficReroute() {
        this.state.isTrafficSimulated = true;
        this.state.speed = Math.max(0, this.state.speed - 80); // Sudden braking due to traffic
        
        const payload = this.buildPayload();
        
        logger.warn("Heavy Traffic Blockade Simulated", { speed: this.state.speed });
        
        this.io.emit('sosAlert', {
            ...payload,
            riskScore: 85,
            status: 'Danger',
            reason: "Heavy Traffic Detected! Calculating alternative route..."
        });

        // Compute simulated alternate route
        const altDest = { 
            lat: this.DESTINATION.lat + (Math.random() - 0.5) * 0.005, 
            lng: this.DESTINATION.lng + (Math.random() - 0.5) * 0.005 
        };
        
        const newRoute = await fetchRoute(this.state.location, altDest);
        if (newRoute.length > 0) {
            this.state.routeCoordinates = newRoute;
            this.state.currentRouteIndex = 0;
            this.io.emit('routeUpdate', { route: this.state.routeCoordinates });
            logger.info("New alternative route generated and pushed to clients.");
            
            // Explicitly emit a 'Route Changed' SOS alert so the user sees it visually
            this.io.emit('sosAlert', {
                ...payload,
                riskScore: 85,
                status: 'Danger',
                reason: "ROUTE CHANGED! Actively taking an alternative path."
            });
            
            // Emit a dedicated traffic alert for the UI notification banner
            this.io.emit('trafficAlert', {
                message: "Traffic Re-routing Active: Adjusting path due to heavy traffic ahead.",
                timestamp: new Date().toISOString()
            });
        }
        
        setTimeout(() => { 
            this.state.isTrafficSimulated = false; 
            logger.info("Traffic cleared.");
        }, 30000); // 30 seconds of traffic impact
    }

    async tick() {
        try {
            const { routeCoordinates, currentRouteIndex } = this.state;
            if (routeCoordinates.length === 0 || currentRouteIndex >= routeCoordinates.length - 1) {
                logger.info("Destination Reached! Restarting simulation for continuous demo looping.");
                this.state.currentRouteIndex = 0;
                this.state.location = { ...this.DEFAULT_CENTER };
                this.state.speed = 0;
                
                // Refetch base route and sync clients
                fetchRoute(this.DEFAULT_CENTER, this.DESTINATION).then(route => {
                    this.state.routeCoordinates = route;
                    this.io.emit('routeUpdate', { route: this.state.routeCoordinates });
                });
                return;
            }

            this.state.previousSpeed = this.state.speed;

            // 1. Random Traffic Event Trigger (every ~90 seconds on average)
            if (!this.state.isTrafficSimulated && Math.random() > 0.97) {
                await this.triggerTrafficReroute();
            } else {
                // Speed logic
                let acceleration = (Math.random() - 0.2) * (this.state.isTrafficSimulated ? 10 : 40); 
                let maxSpeed = this.state.isTrafficSimulated ? 20 : 120; // slow in traffic
                this.state.speed = Math.max(0, Math.min(maxSpeed, this.state.speed + acceleration));
                
                // Random harsh brake simulation
                if (Math.random() > 0.85 && this.state.speed > 50 && !this.state.isTrafficSimulated) {
                    this.state.speed = Math.max(0, this.state.speed - 45); 
                }
            }

            // 2. Strict Kinematic Path Following
            // speed (km/h) to (m/s): speed / 3.6
            // distance moved in updateIntervalMs: (speed / 3.6) * (updateIntervalMs / 1000)
            let distanceToMove = (this.state.speed / 3.6) * (this.updateIntervalMs / 1000); 
            
            while (distanceToMove > 0 && this.state.currentRouteIndex < this.state.routeCoordinates.length - 1) {
                let nextPoint = this.state.routeCoordinates[this.state.currentRouteIndex + 1];
                let result = moveTowards(this.state.location, nextPoint, distanceToMove);
                this.state.location = result.point;
                distanceToMove = result.remaining;
                if (distanceToMove > 0) {
                    this.state.currentRouteIndex++; 
                }
            }

            // 3. Risk Assessment & Geofencing
            this.calculateRisk();
            this.evaluateGeofence();

            // 4. Emit State
            const payload = this.buildPayload();
            this.io.emit('vehicleUpdate', payload);

            // Standard SOS behavior (excluding overarching traffic reroute which has its own sos)
            if (this.state.riskScore > 75 && !this.state.isTrafficSimulated) {
                let reason = "High Driver Risk Detected";
                if (this.state.speed > 80) reason += " (Overspeeding)";
                if (this.state.previousSpeed - this.state.speed > 30) reason += " (Harsh Braking)";
                this.io.emit('sosAlert', { ...payload, reason });
                logger.warn("SOS Emitted", { reason, score: this.state.riskScore });
            } else if (this.state.geofenceBreached) {
                this.io.emit('sosAlert', { 
                    ...payload, 
                    reason: "GEOFENCE BREACH: Vehicle exceeded designated safe zone boundaries!" 
                });
                logger.warn("SOS Emitted", { reason: "GEOFENCE BREACH" });
            }
        } catch (err) {
            logger.error('Error during simulation tick execution', { error: err.message, stack: err.stack });
        }
    }

    calculateRisk() {
        let risk = this.state.isTrafficSimulated ? 85 : 0; 
        const speedDrop = this.state.previousSpeed - this.state.speed;

        if (!this.state.isTrafficSimulated) {
            if (this.state.speed > 70) risk += (this.state.speed - 70) * 1.5; 
            if (speedDrop > 30) risk += speedDrop * 1.5;
            if (Math.random() > 0.8 && this.state.speed > 60) risk += 20; // erratic behavior
        }

        if (this.state.speed < 5) {
            this.state.idleTime += (this.updateIntervalMs / 1000);
            if (this.state.idleTime > 60) risk += 10; 
        } else {
            this.state.idleTime = 0;
        }

        if (this.state.geofenceBreached) {
            risk = Math.max(risk, 80); // Ensure geofence breach always keeps high risk status
        }

        this.state.riskScore = Math.min(100, Math.max(0, Math.floor(risk)));
        this.state.status = this.state.riskScore > 75 ? 'Danger' : this.state.riskScore > 40 ? 'Warning' : 'Safe';
    }

    evaluateGeofence() {
        const distanceFromCenter = getDistanceMeter(
            this.state.location.lat, 
            this.state.location.lng, 
            this.GEOFENCE_CENTER.lat, 
            this.GEOFENCE_CENTER.lng
        );
        this.state.geofenceBreached = distanceFromCenter > this.GEOFENCE_RADIUS_METERS;
    }

    buildPayload() {
        return {
            location: { ...this.state.location },
            speed: Math.floor(this.state.speed),
            riskScore: this.state.riskScore,
            status: this.state.status,
            timestamp: new Date().toISOString()
        };
    }

    getCurrentRoute() {
        return this.state.routeCoordinates;
    }
    
    getInitialPayload() {
        return this.buildPayload();
    }
}

module.exports = SimulationEngine;
