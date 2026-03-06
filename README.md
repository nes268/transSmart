# TransSmart

A logistics platform that connects **shippers** with **transporters** for cargo delivery. Built with AI-powered smart matching, route optimization, and real-time tracking.

---

## Project Overview

TransSmart streamlines freight booking by allowing shippers to post jobs and transporters to browse and accept them. The platform uses Groq AI for intelligent truck matching and route selection, OSRM/OpenStreetMap for routing, and Socket.IO for real-time updates and chat.

### Key Features

- **Smart Match** – AI ranks trucks for a job using capacity, availability, fuel type, and eco-friendliness
- **Optimize Route** – Multiple route candidates from OSRM; AI selects the best by objective (eco, fastest, cheapest)
- **Real-time Chatbot** – Multilingual support; replies in the user’s language for shippers and transporters
- **Live Trip Tracking** – Real-time location sharing via Socket.IO
- **Job Lifecycle** – Create jobs → transporter requests → accept → trip → complete → payment
- **Role-based Access** – Shipper, Transporter, and Admin dashboards
- **Payments** – Create payments for completed jobs and mark as paid (UPI, card, net banking, cash)
- **Reviews & Ratings** – Transporters receive reviews from shippers
- **Analytics** – Dashboard stats and carbon footprint estimation

---

## Problem Statement

Manual freight coordination is slow, opaque, and inefficient. Shippers struggle to find suitable transporters; transporters lack visibility into suitable jobs. Route and vehicle choices are rarely optimized for cost, time, or environmental impact.

### How TransSmart Addresses It

- **AI Smart Match** reduces manual search by recommending the best trucks for each job
- **Route Optimization** improves fuel use, cost, and emissions
- **Real-time Chat** provides instant answers for shippers and transporters in their language
- **Transparent Workflow** – job status, payments, and trip tracking are visible to all parties
- **Single Platform** – jobs, trucks, trips, payments, and reviews in one place

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | Node.js, Express 5, Mongoose, Socket.IO |
| **Frontend** | React 18, Vite 6, React Router, Axios |
| **Database** | MongoDB |
| **AI** | Groq API (llama-3.3-70b-versatile) |
| **Maps & Routing** | OSRM, Nominatim (OpenStreetMap), Leaflet, React-Leaflet, Mapbox GL (optional) |
| **Auth** | JWT, bcryptjs |
| **Real-time** | Socket.IO |
| **UI** | Framer Motion, Lucide React, CSS |

### APIs & Services

- **Groq API** – Smart match, route selection, multilingual chatbot
- **OSRM** – Road routing and route alternatives
- **Nominatim** – Geocoding (address → coordinates)
- **Mapbox** (optional) – Styled maps via `VITE_MAPBOX_TOKEN`

---

## Setup and Run Instructions

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** (local or cloud, e.g. MongoDB Atlas)
- **Groq API key** – [Get one](https://console.groq.com) (free tier)

### Step 1: Clone the repository

```bash
git clone https://github.com/nes268/transSmart.git
cd transSmart
```

### Step 2: Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/transsmart
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

- Replace `MONGO_URI` with your MongoDB connection string (e.g. Atlas)
- Replace `GROQ_API_KEY` with your Groq API key
- Replace `JWT_SECRET` with a strong secret for production

Start the backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### Step 3: Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env` (optional):

```env
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_SOCKET_URL=http://localhost:5000
```

`VITE_MAPBOX_TOKEN` is optional (used for styled maps).  
`VITE_SOCKET_URL` defaults to `http://localhost:5000` in dev.

Start the frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173` (or the port Vite shows).

### Step 4: Run the application

1. Ensure MongoDB is running.
2. Backend: `cd backend && npm run dev`
3. Frontend: `cd frontend && npm run dev`
4. Open `http://localhost:5173` in the browser.

### Step 5: Create accounts

- **Register** as Shipper or Transporter.
- **Shippers** create jobs; **Transporters** browse jobs and add trucks.
- Use **AI Tools** for Smart Match and Optimize Route.
- Use the **Chat** button (bottom-right) for real-time help.

---

## Project Structure

```
transSmart/
├── backend/          # Node.js + Express API
│   ├── config/       # DB, env
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── realtime/     # Socket.IO chat handlers
│   ├── routes/
│   └── utils/        # aiClient, routeOptimizer
├── frontend/         # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   └── public/
├── docs/
└── .env.example
```

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `PORT` | backend | Server port (default: 5000) |
| `MONGO_URI` | backend | MongoDB connection string |
| `JWT_SECRET` | backend | Secret for JWT signing |
| `GROQ_API_KEY` | backend | Groq API key (AI features) |
| `GROQ_MODEL` | backend | Groq model (default: llama-3.3-70b-versatile) |
| `VITE_MAPBOX_TOKEN` | frontend | Mapbox token (optional) |
| `VITE_SOCKET_URL` | frontend | Backend URL for Socket.IO |

---

## License

ISC
