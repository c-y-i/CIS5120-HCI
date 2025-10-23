# CIS 5120 Project
## RotorBench

## TODOs:
- Front-end & UI design
- Back-end & data structure
- Component data
- Build analysis required math
- Rendering

# Project Structure

## Frontend

The frontend handles user interaction, visualization, and build configuration.

### Modules
- **Component Search**  
  Browse and filter through available components.

- **Home / View**  
  Main interface — includes *Analysis*, *Overview*, and related pages.

- **Rendering**  
  Utilizes **Babylon.js**, **Three.js**, or similar libraries for real-time 3D visualization.

- **Build**  
  Handles component *compatibility*, data organization, and user build states.

- **Analysis / Simulation**  
  Provides performance estimation, compatibility checks, and simulation views.

---

## Backend

The backend supports computation, data management, and build analysis through FastAPI or Flask.

### Modules
- **FastAPI or Flask**  
  Core backend framework providing RESTful API endpoints.

- **3D Model Data**  
  Handles `.obj` and related 3D model formats.

- **Build Analysis**  
  Processes build configurations and computes key performance metrics.

- **Component Data**  
  Manages component specifications, metadata, and relationships.

- **URL Shortener**  
  Generates shareable build/view links.

- **User Systems** *(placeholder)*  
  Future integration for authentication, profiles, and saved builds.

---

> **Note:** Placeholder features are not final, we may or may not implement them, depending on our time and interest.