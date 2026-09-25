# 🏙️ CityPulse

**The Live Civic Health Dashboard for the Modern Metropolis.**

![CityPulse Banner](https://img.shields.io/badge/Status-Live-success?style=for-the-badge) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

> **CityPulse** synthesizes fragmented, siloed municipal data into a single, real-time "heartbeat" for your city. By tracking traffic, air quality, utility grid loads, and emergency incidents, CityPulse empowers civic leaders and dispatch operators to make data-driven decisions instantly.

---

## 💡 The Problem
Modern cities generate petabytes of telemetry data every day—from traffic cameras to AQI sensors and power grid monitors. However, this data is deeply siloed across different municipal departments. When a crisis occurs (like a severe storm causing grid failures and traffic accidents), decision-makers lose critical minutes trying to piece together the full picture from separate dashboards.

## 🚀 The Solution
**CityPulse** solves this by unifying all civic telemetry into a highly polished, zero-latency dashboard. 

Our proprietary **City Pulse Index** automatically aggregates and weights various municipal signals into a single score out of 100. If the score drops, operators can instantly drill down into the live map to locate the anomalies, read real-time alerts, and understand exactly what is disrupting the city's flow.

---

## ✨ Key Features

- 🔄 **Real-Time Telemetry Engine**: Built on top of **Supabase Realtime**, the dashboard updates instantly across all clients without a single page refresh or polling loop.
- 🧠 **City Pulse Index**: A dynamic, composite health score (0-100) synthesized live from 5+ civic vectors (Traffic, Environment, Utilities, Safety).
- 🚨 **Automated Anomaly Detection**: The system calculates baselines and flags unusual deviations (e.g., a sudden 40% spike in grid load in the Central District).
- 🗺️ **Spatial Civic Intelligence**: A fully integrated live map overlay that plots emergency incidents and active traffic corridors in real time.
- 🎮 **Interactive Demo Engine**: No IoT sensors? No problem. We built a sophisticated internal scenario simulator that drives realistic mock data directly into Supabase, mimicking real-world crises to demonstrate the dashboard's capabilities dynamically.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Vite.
- **Styling**: Tailwind CSS, custom glassmorphism utilities, Lucide React icons.
- **Data Visualization**: Recharts for dynamic, animated metrics.
- **Backend as a Service**: Supabase (PostgreSQL).
- **Real-time Sync**: Supabase Realtime Channels (WebSockets).

---

## 🏗️ How We Built It

1. **The Foundation**: We started by designing a modern, highly aesthetic "Command Center" UI utilizing dark/light glassmorphism concepts to ensure the data is readable, urgent, and beautiful.
2. **The Data Pipeline**: We configured a Supabase PostgreSQL database with tables for `cities`, `metrics`, `civic_events`, `alerts`, and `anomalies`.
3. **The Realtime Engine**: Using Supabase's `onAuthStateChange` and channel subscriptions, we wired the React context (`CityPulseContext`) to listen for database inserts. Whenever a new row hits the DB, the dashboard updates immediately.
4. **The Scenario Simulator**: To demonstrate the true power of the platform for the judges, we built a React-based `DemoEngineContext` that periodically injects complex, orchestrated payloads into the backend to simulate events like "Severe Storm" or "Grid Overload".

---

## 🚧 Challenges We Ran Into

- **State Management & Infinite Loops**: Handling 5+ simultaneous WebSocket streams updating global React state at high frequencies required careful optimization of our `useEffect` dependency arrays and `useMemo` hooks to prevent React from hitting maximum update depths.
- **UI/UX Data Density**: Packing massive amounts of data (gauges, maps, charts, logs) into a single screen without overwhelming the user. We solved this with progressive disclosure, consistent color-coding by severity, and clean typographic hierarchies.

---

## 🏆 Accomplishments That We're Proud Of

- Achieving **true zero-latency UI updates** across the entire application.
- Building a UI that looks like a premium, enterprise-grade civic management tool.
- The built-in **Demo Simulator**, which flawlessly mimics a living, breathing city.

---

## 🔮 What's Next for CityPulse?

1. **Hardware IoT Integration**: Replacing the demo engine with real REST webhooks from hardware sensors (e.g., Raspberry Pi-based AQI sensors).
2. **AI-Powered Predictive Dispatch**: Implementing a machine learning layer to predict traffic congestion or grid failures *before* they happen based on historical patterns.
3. **Citizen Mobile App**: A stripped-down, read-only version of CityPulse for citizens to check the health of their neighborhood in real time.

---

## 💻 Running the Project Locally

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase Project (with the required schema)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Himanshu-kushwaha9654/citypulse.git
   cd citypulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.
