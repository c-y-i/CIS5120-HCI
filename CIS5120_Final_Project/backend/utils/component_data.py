"""
Utility functions for component data handling.
"""
import json
from pathlib import Path
from typing import List, Dict, Optional
from models.components import (
    Motor, Propeller, ESC, FlightController, 
    Frame, Battery, Receiver,
    ComponentDatabase, DroneBuild, DroneBuildConfig,
    DroneComponents
)

# Path to JSON data files (for development/testing)
# In production, this would come from a database
DATA_DIR = Path(__file__).parent.parent.parent / "rotorbench" / "src" / "data"
COMPONENTS_FILE = DATA_DIR / "components.json"
BUILDS_FILE = DATA_DIR / "builds.json"


def load_all_components() -> Dict:
    """Load all components from single JSON file"""
    if not COMPONENTS_FILE.exists():
        return {
            "motors": [],
            "propellers": [],
            "escs": [],
            "flight_controllers": [],
            "frames": [],
            "batteries": [],
            "receivers": []
        }
    
    with open(COMPONENTS_FILE, 'r') as f:
        return json.load(f)


def get_all_motors() -> List[Motor]:
    """Get all available motors"""
    data = load_all_components()
    return [Motor(**item) for item in data.get("motors", [])]


def get_all_propellers() -> List[Propeller]:
    """Get all available propellers"""
    data = load_all_components()
    return [Propeller(**item) for item in data.get("propellers", [])]


def get_all_escs() -> List[ESC]:
    """Get all available ESCs"""
    data = load_all_components()
    return [ESC(**item) for item in data.get("escs", [])]


def get_all_flight_controllers() -> List[FlightController]:
    """Get all available flight controllers"""
    data = load_all_components()
    return [FlightController(**item) for item in data.get("flight_controllers", [])]


def get_all_frames() -> List[Frame]:
    """Get all available frames"""
    data = load_all_components()
    return [Frame(**item) for item in data.get("frames", [])]


def get_all_batteries() -> List[Battery]:
    """Get all available batteries"""
    data = load_all_components()
    return [Battery(**item) for item in data.get("batteries", [])]


def get_all_receivers() -> List[Receiver]:
    """Get all available receivers"""
    data = load_all_components()
    return [Receiver(**item) for item in data.get("receivers", [])]


def get_all_components_db() -> ComponentDatabase:
    """Get all components in a structured format"""
    return ComponentDatabase(
        motors=get_all_motors(),
        propellers=get_all_propellers(),
        escs=get_all_escs(),
        flight_controllers=get_all_flight_controllers(),
        frames=get_all_frames(),
        batteries=get_all_batteries(),
        receivers=get_all_receivers()
    )


def get_component_by_id(component_type: str, component_id: str):
    """Get a specific component by type and ID"""
    component_getters = {
        "motor": get_all_motors,
        "propeller": get_all_propellers,
        "esc": get_all_escs,
        "flight_controller": get_all_flight_controllers,
        "frame": get_all_frames,
        "battery": get_all_batteries,
        "receiver": get_all_receivers
    }
    
    getter = component_getters.get(component_type)
    if not getter:
        return None
    
    components = getter()
    for component in components:
        if component.id == component_id:
            return component
    
    return None


def get_all_saved_builds() -> List[DroneBuildConfig]:
    """Get all saved build configurations"""
    if not BUILDS_FILE.exists():
        return []
    
    with open(BUILDS_FILE, 'r') as f:
        builds_data = json.load(f)
    
    return [DroneBuildConfig(**build) for build in builds_data]


def hydrate_build(build_config: DroneBuildConfig) -> Optional[DroneBuild]:
    """
    Convert a build configuration (with component IDs) into a full build
    (with complete component objects) for analysis
    """
    components = DroneComponents()
    
    # Load frame
    if build_config.component_ids.frame_id:
        components.frame = get_component_by_id("frame", build_config.component_ids.frame_id)
    
    # Load motor
    if build_config.component_ids.motor_id:
        components.motors = get_component_by_id("motor", build_config.component_ids.motor_id)
    
    # Load propeller
    if build_config.component_ids.propeller_id:
        components.propellers = get_component_by_id("propeller", build_config.component_ids.propeller_id)
    
    # Load ESC
    if build_config.component_ids.esc_id:
        components.esc = get_component_by_id("esc", build_config.component_ids.esc_id)
    
    # Load flight controller
    if build_config.component_ids.flight_controller_id:
        components.flight_controller = get_component_by_id("flight_controller", build_config.component_ids.flight_controller_id)
    
    # Load battery
    if build_config.component_ids.battery_id:
        components.battery = get_component_by_id("battery", build_config.component_ids.battery_id)
    
    # Load receiver
    if build_config.component_ids.receiver_id:
        components.receiver = get_component_by_id("receiver", build_config.component_ids.receiver_id)
    
    return DroneBuild(
        id=build_config.id,
        name=build_config.name,
        description=build_config.description,
        components=components,
        created_at=build_config.created_at,
        updated_at=build_config.updated_at
    )


def save_build(build_config: DroneBuildConfig) -> bool:
    """Save a build configuration to file"""
    # Load existing builds
    builds = []
    if BUILDS_FILE.exists():
        with open(BUILDS_FILE, 'r') as f:
            builds = json.load(f)
    
    # Check if build already exists
    existing_index = None
    for i, b in enumerate(builds):
        if b.get("id") == build_config.id:
            existing_index = i
            break
    
    # Convert to dict
    build_dict = build_config.model_dump(by_alias=True)
    # Convert datetime to string
    build_dict["createdAt"] = build_config.created_at.isoformat()
    build_dict["updatedAt"] = build_config.updated_at.isoformat()
    
    # Update or append
    if existing_index is not None:
        builds[existing_index] = build_dict
    else:
        builds.append(build_dict)
    
    # Save to file
    with open(BUILDS_FILE, 'w') as f:
        json.dump(builds, f, indent=2)
    
    return True


def delete_build(build_id: str) -> bool:
    """Delete a build configuration"""
    if not BUILDS_FILE.exists():
        return False
    
    # Load existing builds
    with open(BUILDS_FILE, 'r') as f:
        builds = json.load(f)
    
    # Filter out the build to delete
    new_builds = [b for b in builds if b.get("id") != build_id]
    
    if len(new_builds) == len(builds):
        return False  # Build not found
    
    # Save updated list
    with open(BUILDS_FILE, 'w') as f:
        json.dump(new_builds, f, indent=2)
    
    return True
