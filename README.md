# TransSmart – Smarter Routes. Better Logistics

A smart logistics platform that connects **shippers with transporters** for efficient cargo delivery.

TransSmart uses **AI-powered truck matching, route optimization, and real-time tracking** to streamline freight operations and reduce logistics inefficiencies.

---

# Demo & Documentation

- **Demo Video:** https://www.youtube.com/watch?v=ComG5VYCjaM
- **Project Documentation:** https://drive.google.com/file/d/1AIPxEqYLkwDbLMMyXKKsSLRZA3LNAbMb/view?usp=sharing

---

# Project Overview

TransSmart simplifies freight booking by allowing **shippers to post delivery jobs** and **transporters to browse and accept them**.

The platform integrates modern technologies to automate logistics workflows.

Core integrations include:

- **Groq AI** for intelligent truck matching and route optimization
- **OSRM / OpenStreetMap** for routing and geolocation
- **Socket.IO** for real-time tracking and communication

This creates a **transparent workflow from job creation to payment completion**.

---

# Key Features

### Smart Match

AI ranks available trucks based on:

- Capacity
- Availability
- Fuel type
- Eco-friendliness

This helps shippers quickly find the most suitable transporter.

---

### Route Optimization

Multiple routes are generated using **OSRM** and evaluated by AI.

Routes are ranked based on:

- Fastest route
- Cheapest route
- Eco-friendly route

This reduces travel time, fuel usage, and operational costs.

---

### Real-Time Chatbot

- Multilingual communication
- Responds in the user's preferred language
- Assists both shippers and transporters with logistics queries

---

### Live Trip Tracking

- Real-time location updates using **Socket.IO**
- Interactive map visualization
- Continuous delivery monitoring

---

### Job Lifecycle

The entire delivery process is managed within the platform:

**Create Job → Transporter Request → Accept → Trip Start → Delivery → Payment**

---

### Role-Based Access

Separate dashboards for:

- Shippers
- Transporters
- Admin

Each role has customized features and permissions.

---

### Payments

Supports multiple payment options:

- UPI
- Card
- Net Banking
- Cash

Invoices and payment history are automatically maintained.

---

### Reviews & Ratings

Shippers can rate transporters after job completion, helping maintain **trust and service quality** within the platform.

---

### Analytics

Dashboard insights include:

- Job statistics
- Platform usage metrics
- Estimated carbon footprint

---

# Problem Statement

Freight logistics is often **manual, slow, and inefficient**.

Common industry challenges include:

- Difficulty finding suitable transporters
- Lack of transparency in job status
- Poor route planning
- Inefficient vehicle utilization
- Limited visibility into logistics operations

These issues result in **higher operational costs, delivery delays, and increased carbon emissions**.

---

# Solution

TransSmart addresses these problems with a **centralized AI-powered logistics platform**.

Key capabilities include:

- **AI Smart Matching** — Automatically recommends the best trucks for each job.
- **Route Optimization** — Reduces fuel usage, delivery time, and operational costs.
- **Real-Time Communication** — Chat and notifications enable instant interaction.
- **Transparent Workflow** — Every stage of delivery is visible to both parties.
- **Unified Platform** — Jobs, trucks, trips, payments, and reviews are managed in one system.

---

# Tech Stack

| Layer | Technologies |
|-------|--------------|
| Backend | Node.js, Express 5, Mongoose, Socket.IO |
| Frontend | React 18, Vite 6, React Router, Axios |
| Database | MongoDB |
| AI | Groq API (llama-3.3-70b-versatile) |
| Maps & Routing | OSRM, Nominatim, Leaflet, React-Leaflet |
| Authentication | JWT, bcryptjs |
| Real-time Communication | Socket.IO |
| UI | Framer Motion, Lucide React, CSS |

---

# APIs and Services

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

Used for enhanced map styling and visualization.

---

# Setup and Run Instructions

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Groq API Key

---

## 1. Clone the Repository

```bash
git clone https://github.com/nes268/transSmart.git
cd transSmart
```

## 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/transsmart
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

Start backend:

```bash
npm run dev
```

Backend runs at: **http://localhost:5000**

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Optional `.env` file:

```
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_SOCKET_URL=http://localhost:5000
```

Start frontend:

```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

## 4. Run the Application

1. Ensure MongoDB is running.
2. Start both servers:

**Backend:**
```bash
cd backend && npm run dev
```

**Frontend:**
```bash
cd frontend && npm run dev
```

3. Open in browser: **http://localhost:5173**

## 5. Create Accounts

Register as:

- **Shipper**
- **Transporter**

**Workflow:**

1. Shippers create logistics jobs
2. Transporters add trucks and browse jobs
3. Use Smart Match and Route Optimization
4. Communicate using chatbot
5. Track deliveries in real time

---

# Project Structure

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
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   └── public/
│
├── docs/
└── .env.example
```

---

# Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| PORT | Backend | Server port |
| MONGO_URI | Backend | MongoDB connection string |
| JWT_SECRET | Backend | Secret key for authentication |
| GROQ_API_KEY | Backend | API key for AI features |
| GROQ_MODEL | Backend | Groq AI model |
| VITE_MAPBOX_TOKEN | Frontend | Optional map token |
| VITE_SOCKET_URL | Frontend | Backend URL for Socket.IO |

---

# License

ISC License
