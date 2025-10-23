"""
Main module for the RotorBench backend.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="RotorBench API ", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "IM ALIVE"}

@app.get("/api/components")
async def get_components():
    """Get all available drone components"""
    # we need to decide on the data structure... 
    # this is just placeholder 
    return {
        "motors": [],
        "propellers": [],
        "escs": [],
        "flight_controllers": [],
        "frames": []
    }

@app.get("/api/builds")
async def get_builds():
    """Get saved builds"""
    return {"builds": []}

@app.post("/api/builds")
async def create_build(build_data: dict):
    """Create a new build configuration"""
    return {"message": "Build created", "build": build_data}

if __name__ == "__main__":
    # boot up api server
    uvicorn.run(app, host="0.0.0.0", port=8000)