"""
Main module for the RotorBench backend.
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from typing import Optional
from pydantic import BaseModel
import uvicorn

from models.components import (
    Motor, Propeller, ESC, FlightController,
    Frame, Battery, Receiver,
    ComponentDatabase, DroneBuild, DroneBuildConfig,
    BuildAnalysis
)
from utils.component_data import (
    get_all_components_db,
    get_all_motors,
    get_all_propellers,
    get_all_escs,
    get_all_flight_controllers,
    get_all_frames,
    get_all_batteries,
    get_all_receivers,
    get_component_by_id,
    get_all_saved_builds,
    hydrate_build,
    save_build,
    delete_build
)
from utils.build_analysis import analyze_build
from models.user import UserProfile
from utils.user_data import list_users, get_user, save_user, delete_user
from utils.builds_data import list_builds, get_build, create_build, update_build, delete_build

from datetime import datetime

class Build(BaseModel):
    id: Optional[str] = None
    userId: str
    name: Optional[str] = None
    note: Optional[str] = None
    frameId: str
    motorId: str
    propellerId: str
    batteryId: str
    escId: Optional[str] = None
    fcId: Optional[str] = None
    receiverId: Optional[str] = None
    totalWeight: Optional[float] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

app = FastAPI(title="RotorBench API", version="1.0.0")

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
    return {"message": "RotorBench API is running!", "version": "1.0.0"}


# Component endpoints
@app.get("/api/components", response_model=ComponentDatabase)
async def get_components():
    """Get all available drone components"""
    return get_all_components_db()


@app.get("/api/components/motors", response_model=List[Motor])
async def get_motors():
    """Get all available motors"""
    return get_all_motors()


@app.get("/api/components/propellers", response_model=List[Propeller])
async def get_propellers():
    """Get all available propellers"""
    return get_all_propellers()


@app.get("/api/components/escs", response_model=List[ESC])
async def get_escs():
    """Get all available ESCs"""
    return get_all_escs()


@app.get("/api/components/flight-controllers", response_model=List[FlightController])
async def get_flight_controllers():
    """Get all available flight controllers"""
    return get_all_flight_controllers()


@app.get("/api/components/frames", response_model=List[Frame])
async def get_frames():
    """Get all available frames"""
    return get_all_frames()


@app.get("/api/components/batteries", response_model=List[Battery])
async def get_batteries():
    """Get all available batteries"""
    return get_all_batteries()


@app.get("/api/components/receivers", response_model=List[Receiver])
async def get_receivers():
    """Get all available receivers"""
    return get_all_receivers()


@app.get("/api/components/{component_type}/{component_id}")
async def get_component(component_type: str, component_id: str):
    """Get a specific component by type and ID"""
    component = get_component_by_id(component_type, component_id)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    return component


# Build endpoints
@app.get("/api/builds", response_model=List[DroneBuildConfig])
async def get_builds():
    """Get all saved build configurations"""
    return get_all_saved_builds()


@app.post("/api/builds", response_model=DroneBuildConfig)
async def create_build(build_config: DroneBuildConfig):
    """Save a new build configuration"""
    success = save_build(build_config)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save build")
    return build_config


@app.get("/api/builds/{build_id}", response_model=DroneBuildConfig)
async def get_build(build_id: str):
    """Get a specific build configuration by ID"""
    builds = get_all_saved_builds()
    for build in builds:
        if build.id == build_id:
            return build
    raise HTTPException(status_code=404, detail="Build not found")


@app.put("/api/builds/{build_id}", response_model=DroneBuildConfig)
async def update_build(build_id: str, build_config: DroneBuildConfig):
    """Update an existing build configuration"""
    if build_id != build_config.id:
        raise HTTPException(status_code=400, detail="Build ID mismatch")
    
    success = save_build(build_config)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update build")
    return build_config


@app.delete("/api/builds/{build_id}")
async def delete_build_endpoint(build_id: str):
    """Delete a build configuration"""
    success = delete_build(build_id)
    if not success:
        raise HTTPException(status_code=404, detail="Build not found")
    return {"message": "Build deleted successfully"}


@app.get("/api/builds/{build_id}/hydrated", response_model=DroneBuild)
async def get_hydrated_build(build_id: str):
    """
    Get a build with all component details (hydrated from IDs)
    Useful for analysis without sending full component objects
    """
    builds = get_all_saved_builds()
    build_config = None
    for build in builds:
        if build.id == build_id:
            build_config = build
            break
    
    if not build_config:
        raise HTTPException(status_code=404, detail="Build not found")
    
    hydrated = hydrate_build(build_config)
    if not hydrated:
        raise HTTPException(status_code=500, detail="Failed to hydrate build")
    
    return hydrated


@app.post("/api/builds/analyze", response_model=BuildAnalysis)
async def analyze_drone_build(build: DroneBuild):
    """
    Analyze a drone build configuration.
    Returns performance metrics, flight simulation, and validation results.
    Accepts a full DroneBuild object with complete component data.
    """
    return analyze_build(build)


@app.post("/api/builds/{build_id}/analyze", response_model=BuildAnalysis)
async def analyze_saved_build(build_id: str):
    """
    Analyze a saved build configuration by ID.
    Hydrates the build from stored component IDs and analyzes it.
    """
    builds = get_all_saved_builds()
    build_config = None
    for build in builds:
        if build.id == build_id:
            build_config = build
            break
    
    if not build_config:
        raise HTTPException(status_code=404, detail="Build not found")
    
    hydrated = hydrate_build(build_config)
    if not hydrated:
        raise HTTPException(status_code=500, detail="Failed to hydrate build")
    
    return analyze_build(hydrated)

@app.get("/api/users", response_model=List[UserProfile])
async def api_list_users():
    return list_users()

@app.get("/api/users/{user_id}", response_model=UserProfile)
async def api_get_user(user_id: str):
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/users", response_model=UserProfile)
async def api_create_user(profile: UserProfile):
    if profile.created_at is None:
        profile.created_at = datetime.utcnow()
    profile.updated_at = datetime.utcnow()
    if not save_user(profile):
        raise HTTPException(status_code=500, detail="Failed to save user")
    return profile

@app.put("/api/users/{user_id}", response_model=UserProfile)
async def api_update_user(user_id: str, profile: UserProfile):
    if user_id != profile.id:
        raise HTTPException(status_code=400, detail="User ID mismatch")

    if profile.created_at is None:
        profile.created_at = datetime.utcnow()
    profile.updated_at = datetime.utcnow()

    if not save_user(profile):
        raise HTTPException(status_code=500, detail="Failed to update user")
    return profile


@app.delete("/api/users/{user_id}")
async def api_delete_user(user_id: str):
    if not delete_user(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@app.get("/api/builds")
def api_list_builds(userId: Optional[str] = Query(None)):
    return list_builds(userId)

@app.get("/api/builds/{bid}")
def api_get_build(bid: str):
    b = get_build(bid)
    if not b:
        raise HTTPException(status_code=404, detail="Build not found")
    return b

@app.post("/api/builds", status_code=201)
def api_create_build(build: Build):
    if not build.userId:
        raise HTTPException(status_code=400, detail="userId is required")
    return create_build(build.model_dump(exclude_none=True))

@app.put("/api/builds/{bid}")
def api_put_build(bid: str, build: Build):
    if build.id and build.id != bid:
        raise HTTPException(status_code=400, detail="ID mismatch")
    updated = update_build(bid, build.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Build not found")
    return updated

@app.delete("/api/builds/{bid}")
def api_delete_build(bid: str):
    if not delete_build(bid):
        raise HTTPException(status_code=404, detail="Build not found")
    return {"ok": True}

if __name__ == "__main__":
    # boot up api server
    uvicorn.run(app, host="0.0.0.0", port=8000)
