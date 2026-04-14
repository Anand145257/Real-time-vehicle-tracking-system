# 🚦 Real-Time Vehicle Tracking System

A full-stack, production-ready **real-time vehicle tracking system** featuring JWT authentication, live Socket.io communication, behavior-based SOS alerts, traffic-aware routing, and an interactive Leaflet map dashboard built with React.

---

## 📸 Features

- 🗺️ **Live Map Tracking** — Real-time vehicle position updates rendered on an interactive Leaflet map
- 🚨 **SOS Alert System** — Automated behavior-based SOS detection with alert history and notifications
- 📡 **WebSocket Communication** — Bidirectional real-time data streaming via Socket.io
- 🔐 **JWT Authentication** — Secure login with token-based access control for both REST and Socket.io
- 🚦 **Traffic-Aware Routing** — Dynamic route calculation using RoutingService
- 📊 **Metrics Dashboard** — Live vehicle metrics panel with speed, heading, and risk indicators
- ⚙️ **Settings & Alerts Pages** — Dedicated multi-page navigation with React Router
- 🌙 **Premium Dark UI** — Glassmorphism-inspired dark-themed design with smooth micro-animations

---

## 🏗️ Project Structure

```
Real-time-vehicle-tracking-system/
├── backend/                        # Node.js + Express + Socket.io server
│   ├── server.js                   # Main entrypoint — REST API & WebSocket hub
│   ├── services/
│   │   ├── SimulationService.js    # Vehicle movement simulation engine
│   │   └── RoutingService.js       # Traffic-aware route calculation
│   └── utils/
│       ├── geoUtils.js             # Geospatial helper functions
│       └── logger.js               # Structured logging utility
│
├── frontend/                       # React + Vite single-page application
│   ├── index.html
│   └── src/
│       ├── main.jsx                # App entry point
│       ├── App.jsx                 # Router setup
│       ├── context/
│       │   ├── AuthContext.jsx     # JWT auth state management
│       │   └── SocketContext.jsx   # Global Socket.io context
│       ├── hooks/
│       │   └── useVehicleSocket.js # Custom hook for vehicle socket events
│       ├── components/
│       │   ├── MapDashboard.jsx    # Main map + metrics container
│       │   ├── MapView.jsx         # Leaflet map component
│       │   ├── MetricsPanel.jsx    # Live vehicle metrics
│       │   ├── NavBar.jsx          # Top navigation bar
│       │   ├── Sidebar.jsx         # Navigation sidebar
│       │   ├── RouteLayer.jsx      # Map route overlay
│       │   ├── AppLayout.jsx       # Shared page layout wrapper
│       │   └── ErrorBoundary.jsx   # React error boundary
│       └── pages/
│           ├── LoginPage.jsx       # Authentication page
│           ├── DashboardPage.jsx   # Main tracking dashboard
│           ├── AlertsPage.jsx      # SOS alert history & management
│           └── SettingsPage.jsx    # User settings
│
├── start.bat                       # One-click launcher (Windows)
├── package.json                    # Root scripts
└── .gitignore
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js v5** | REST API server |
| **Socket.io v4** | Real-time WebSocket communication |
| **JSON Web Token (JWT)** | Authentication & authorization |
| **dotenv** | Environment variable management |
| **Firebase Admin** | (Configured for future DB integration) |
| **CORS** | Cross-origin request handling |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI component framework |
| **Vite** | Lightning-fast dev server & bundler |
| **React Router v7** | Multi-page client-side routing |
| **Leaflet + React-Leaflet** | Interactive map rendering |
| **Socket.io Client v4** | Real-time server communication |
| **Lucide React** | Icon library |
| **Vanilla CSS** | Custom design system with dark theme |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anand145257/Real-time-vehicle-tracking-system.git
   cd Real-time-vehicle-tracking-system
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

---

## ▶️ Running the Application

### Option 1 — One-Click Launch (Windows)
Double-click `start.bat` from the project root. This starts both the backend and frontend concurrently.

### Option 2 — Manual (Two Terminals)

**Terminal 1 — Start the Backend:**
```bash
cd backend
node server.js
```
> Backend runs on **http://localhost:3000**

**Terminal 2 — Start the Frontend:**
```bash
cd frontend
npm run dev
```
> Frontend runs on **http://localhost:5173**

---

## 🔐 Authentication

The system uses JWT-based authentication.

**Default credentials:**
| Username | Password |
|---|---|
| `admin` | `admin123` |

On login, a JWT token is issued (expires in 1 hour) and used for all subsequent Socket.io connections.

---

## 📡 API Reference

### REST Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/status` | Server health check & uptime | None |
| `POST` | `/api/login` | Authenticate and receive JWT token | None |

### Socket Events

| Event | Direction | Description |
|---|---|---|
| `startTracking` | Client → Server | Begin vehicle simulation |
| `vehicleUpdate` | Server → Client | Emits real-time vehicle telemetry |
| `routeUpdate` | Server → Client | Sends calculated route coordinates |
| `sosAlert` | Server → Client | Triggers SOS alert notification |

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
JWT_SECRET=your_super_secret_key
```

---

## 📂 Key Components Explained

### `SimulationService.js`
The core simulation engine that drives vehicle movement. It calculates position updates at regular intervals, monitors speed/heading/risk levels, and emits SOS alerts when thresholds are exceeded.

### `RoutingService.js`
Handles traffic-aware route computation, fetching road-network-aware paths between origin and destination points.

### `SocketContext.jsx`
A React context provider that manages a single global Socket.io connection, making real-time data available across all components and pages without prop drilling.

### `AuthContext.jsx`
Manages authentication state, JWT token storage, and protected route enforcement throughout the application.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👤 Author

**Anand145257**  
GitHub: [@Anand145257](https://github.com/Anand145257)

---

> Built with ❤️ for real-time fleet management and vehicle safety monitoring.
