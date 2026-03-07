# TransSmart

A smart logistics platform that connects **shippers** with **transporters** for efficient cargo delivery.  
TransSmart uses **AI-powered truck matching, route optimization, and real-time tracking** to streamline freight operations.

---

## Project Overview

TransSmart simplifies freight booking by allowing **shippers to post delivery jobs** and **transporters to browse and accept them**.

The platform integrates:

- **Groq AI** for intelligent truck matching and route optimization  
- **OSRM / OpenStreetMap** for routing and geolocation  
- **Socket.IO** for real-time tracking and communication  

The system provides a **transparent workflow from job creation to payment completion**.

---

## Key Features

### Smart Match
AI ranks available trucks based on:
- Capacity
- Availability
- Fuel type
- Eco-friendliness

### Route Optimization
Multiple route options are generated using **OSRM**, and AI selects the best route based on:
- Fastest route
- Cheapest route
- Eco-friendly route

### Real-Time Chatbot
- Multilingual support
- Responds in the user's language
- Helps both shippers and transporters

### Live Trip Tracking
- Real-time location updates using **Socket.IO**
- Interactive map visualization

### Job Lifecycle
Complete workflow management:
Create Job → Transporter Request → Accept → Trip Start → Delivery → Payment

### Role-Based Access
Separate dashboards for:
- Shippers
- Transporters
- Admin

### Payments
Supports multiple payment options:
- UPI
- Card
- Net Banking
- Cash

### Reviews & Ratings
Shippers can rate transporters after job completion.

### Analytics
Dashboard insights including:
- Job statistics
- Platform usage
- Estimated carbon footprint

---

## Problem Statement

Freight logistics is often **manual, slow, and inefficient**.

Common challenges include:

- Difficulty finding suitable transporters
- Lack of transparency in job status
- Poor route planning
- Inefficient vehicle utilization
- Limited visibility into logistics operations

These issues lead to **higher costs, delays, and unnecessary carbon emissions**.

---

## Solution

TransSmart solves these problems by providing a **centralized digital logistics platform**.

- **AI Smart Matching** – Automatically recommends the best trucks for each job.
- **Route Optimization** – Reduces fuel usage, delivery time, and operational costs.
- **Real-Time Communication** – Chat system allows instant interaction between users.
- **Transparent Workflow** – Every stage of the delivery process is visible to both parties.
- **Unified Platform** – Manages jobs, trucks, trips, payments, and reviews in one system.

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Backend | Node.js, Express 5, Mongoose, Socket.IO |
| Frontend | React 18, Vite 6, React Router, Axios |
| Database | MongoDB |
| AI | Groq API (llama-3.3-70b-versatile) |
| Maps & Routing | OSRM, Nominatim (OpenStreetMap), Leaflet, React-Leaflet |
| Authentication | JWT, bcryptjs |
| Real-time Communication | Socket.IO |
| UI | Framer Motion, Lucide React, CSS |

---

## APIs and Services

### Groq API
Used for:
- Smart truck matching
- Route optimization
- Multilingual chatbot responses

### OSRM
Provides:
- Road routing
- Route alternatives

### Nominatim
Used for:
- Address geocoding
- Converting addresses into coordinates

### Mapbox (Optional)
Used for enhanced map styling.

---

## Setup and Run Instructions

### Prerequisites

Make sure the following are installed:

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Groq API Key

### 1. Clone the Repository

```bash
git clone https://github.com/nes268/transSmart.git
cd transSmart
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/transsmart
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

Start the backend server:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create an optional `.env` file:

```env
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 4. Run the Application

1. Ensure MongoDB is running.
2. Start both servers:
   - **Backend:** `cd backend && npm run dev`
   - **Frontend:** `cd frontend && npm run dev`
3. Open in browser: `http://localhost:5173`

### 5. Create Accounts

- Register as **Shipper** or **Transporter**
- **Shippers** create logistics jobs
- **Transporters** add trucks and browse jobs
- Use **Smart Match** and **Route Optimization**
- Chat using the real-time chatbot

---

## Project Structure

```
transSmart/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── realtime/
│   ├── routes/
│   └── utils/
├── frontend/
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

| Variable | Location | Description |
|----------|----------|-------------|
| `PORT` | Backend | Server port |
| `MONGO_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | Secret key for JWT |
| `GROQ_API_KEY` | Backend | API key for AI features |
| `GROQ_MODEL` | Backend | Groq model used |
| `VITE_MAPBOX_TOKEN` | Frontend | Optional Mapbox token |
| `VITE_SOCKET_URL` | Frontend | Backend URL for Socket.IO |

---

## License

ISC License
