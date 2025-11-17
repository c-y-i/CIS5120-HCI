# RotorBench

**MultiRotor WorkBench - A drone build configurator and analysis tool**

RotorBench helps FPV drone enthusiasts design, analyze, and optimize their drone builds with real-time performance calculations, component compatibility checking, and detailed flight time simulations.

## Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 14+** (for frontend)
- **npm or yarn** (package manager)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/c-y-i/CIS5120-HCI.git
cd CIS5120-HCI/CIS5120_Final_Project
```

### 2. Backend Setup

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd ../rotorbench

# Install dependencies
npm install

# Or with yarn:
yarn install
```

## Running the Application

### Start the Backend Server

```bash
cd CIS5120_Final_Project/backend

# Make sure virtual environment is activated
# Then start the server:
python -m uvicorn main:app --reload --port 8000
```

The backend will start at: **http://localhost:8000**
- API Docs: **http://localhost:8000/docs**

### Start the Frontend

In a **separate terminal**:

```bash
cd CIS5120_Final_Project/rotorbench

# Start the development server
npm start
```

The frontend will start at: **http://localhost:3000**

## Features

- **Component Selection** - Browse and select from motors, propellers, batteries, ESCs, flight controllers, frames, and receivers
- **Performance Analysis** - Calculate thrust-to-weight ratio, flight time, hover time, and power consumption
- **Battery Simulation** - Detailed discharge curves showing voltage and capacity over time
- **Compatibility Validation** - Automatic checks for voltage, current, and size compatibility
- **Cost Tracking** - Real-time build cost calculation
- **User Profiles** - Save and manage multiple drone configurations
- **Interactive Charts** - Responsive visualizations for battery discharge and performance metrics
- **Mobile-Friendly** - Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

**Backend:** FastAPI, Pydantic, Uvicorn

**Frontend:** React, React Router, Recharts, Babylon.js, CSS3

## Testing

Run the comprehensive test suite:

```bash
cd CIS5120_Final_Project/backend
python test_api.py
```


## About

App developed for CIS 5120 (Human-Computer Interaction) at the University of Pennsylvania.
