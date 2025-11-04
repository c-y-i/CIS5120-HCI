"""
Quick test script for the RotorBench API
Run this after starting the server to verify everything works
we can probably delete this file after we get the API working :)
"""
import json
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.utils.component_data import (
    get_all_motors,
    get_all_batteries,
    get_all_components
)
from backend.models.components import DroneBuild, DroneComponents
from backend.utils.build_analysis import analyze_build


def test_data_loading():
    """Test loading component data"""
    print("=" * 50)
    print("TEST 1: Loading Component Data")
    print("=" * 50)
    
    motors = get_all_motors()
    print(f"✓ Loaded {len(motors)} motors")
    if motors:
        print(f"  Example: {motors[0].name} - {motors[0].kv}KV - ${motors[0].price}")
    
    batteries = get_all_batteries()
    print(f"✓ Loaded {len(batteries)} batteries")
    if batteries:
        print(f"  Example: {batteries[0].name} - {batteries[0].capacity}mAh - ${batteries[0].price}")
    
    all_components = get_all_components()
    print(f"\n✓ Total components in database:")
    print(f"  Motors: {len(all_components.motors)}")
    print(f"  Propellers: {len(all_components.propellers)}")
    print(f"  ESCs: {len(all_components.escs)}")
    print(f"  Flight Controllers: {len(all_components.flight_controllers)}")
    print(f"  Frames: {len(all_components.frames)}")
    print(f"  Batteries: {len(all_components.batteries)}")
    print(f"  VTXs: {len(all_components.vtxs)}")
    print(f"  Receivers: {len(all_components.receivers)}")
    print()


def test_build_analysis():
    """Test build analysis with sample build"""
    print("=" * 50)
    print("TEST 2: Build Analysis")
    print("=" * 50)
    
    # Load sample build
    sample_build_path = Path(__file__).parent.parent / "rotorbench" / "src" / "data" / "sample-build.json"
    
    if not sample_build_path.exists():
        print("✗ Sample build file not found!")
        return
    
    with open(sample_build_path, 'r') as f:
        build_data = json.load(f)
    
    # Convert to DroneBuild object
    build = DroneBuild(**build_data)
    print(f"✓ Loaded build: {build.name}")
    
    # Analyze the build
    analysis = analyze_build(build)
    
    print("\n📊 ANALYSIS RESULTS:")
    print("-" * 50)
    
    # Validation
    if analysis.is_valid:
        print("✓ Build is valid!")
    else:
        print("✗ Build has errors:")
        for error in analysis.errors:
            print(f"  - {error}")
    
    if analysis.warnings:
        print("\n⚠️  Warnings:")
        for warning in analysis.warnings:
            print(f"  - {warning}")
    
    # Performance Metrics
    print("\n🏎️  PERFORMANCE METRICS:")
    print(f"  Total Weight: {analysis.performance.total_weight}g")
    print(f"  Max Thrust: {analysis.performance.max_thrust}g")
    print(f"  Thrust-to-Weight Ratio: {analysis.performance.thrust_to_weight_ratio}:1")
    print(f"  Rating: {analysis.performance.rating.thrust_to_weight.value.upper()}")
    print(f"  Power Draw: {analysis.performance.power_draw}W")
    
    # Flight Simulation
    print("\n✈️  FLIGHT SIMULATION:")
    print(f"  Battery Capacity: {analysis.flight_simulation.battery_capacity}mAh")
    print(f"  Avg Current Draw: {analysis.flight_simulation.avg_current_draw}A")
    print(f"  Estimated Flight Time: {analysis.flight_simulation.estimated_flight_time} min")
    print(f"  Estimated Range: {analysis.flight_simulation.estimated_range} km")
    print(f"  Discharge Data Points: {len(analysis.flight_simulation.discharge_data)}")
    
    # Cost
    print("\n💰 COST:")
    print(f"  Total Build Cost: ${analysis.total_cost}")
    
    # Sample discharge data
    if analysis.flight_simulation.discharge_data:
        print("\n🔋 DISCHARGE CURVE (First 5 points):")
        for i, point in enumerate(analysis.flight_simulation.discharge_data[:5]):
            print(f"  {point.time}min: {point.voltage}V, {point.remaining_capacity}mAh remaining")
    
    print("\n✓ Analysis completed successfully!")
    print()


def test_compatibility_validation():
    """Test compatibility validation with mismatched components"""
    print("=" * 50)
    print("TEST 3: Compatibility Validation")
    print("=" * 50)
    
    # Get sample components
    all_components = get_all_components()
    
    if not all_components.motors or not all_components.batteries:
        print("✗ Not enough components to test validation")
        return
    
    # Create a build with voltage mismatch
    # Use 4S battery (14.8V) with 6S motor (expecting 22.2V)
    motor_6s = None
    battery_4s = None
    
    for motor in all_components.motors:
        if motor.voltage.min > 20:  # Likely a 6S motor
            motor_6s = motor
            break
    
    for battery in all_components.batteries:
        if battery.cells == 4:
            battery_4s = battery
            break
    
    if not motor_6s or not battery_4s:
        print("⚠️  Couldn't find suitable components for voltage mismatch test")
        # Create test with incomplete build instead
        incomplete_build = DroneBuild(
            id="test-incomplete",
            name="Incomplete Build",
            components=DroneComponents(
                motors=all_components.motors[0] if all_components.motors else None
            ),
            created_at="2025-11-04T10:00:00.000Z",
            updated_at="2025-11-04T10:00:00.000Z"
        )
        
        analysis = analyze_build(incomplete_build)
        
        print(f"\n✓ Testing incomplete build...")
        print(f"  Validation Status: {'PASS' if analysis.is_valid else 'FAIL (expected)'}")
        print(f"  Errors found: {len(analysis.errors)}")
        for error in analysis.errors:
            print(f"    - {error}")
    else:
        # Test voltage mismatch
        test_build = DroneBuild(
            id="test-mismatch",
            name="Voltage Mismatch Test",
            components=DroneComponents(
                frame=all_components.frames[0] if all_components.frames else None,
                motors=motor_6s,
                battery=battery_4s,
                propellers=all_components.propellers[0] if all_components.propellers else None,
                esc=all_components.escs[0] if all_components.escs else None,
                flight_controller=all_components.flight_controllers[0] if all_components.flight_controllers else None
            ),
            created_at="2025-11-04T10:00:00.000Z",
            updated_at="2025-11-04T10:00:00.000Z"
        )
        
        analysis = analyze_build(test_build)
        
        print(f"\n✓ Testing voltage mismatch...")
        print(f"  Motor: {motor_6s.name} ({motor_6s.voltage.min}-{motor_6s.voltage.max}V)")
        print(f"  Battery: {battery_4s.name} ({battery_4s.voltage}V)")
        print(f"  Validation Status: {'PASS' if analysis.is_valid else 'FAIL (expected)'}")
        print(f"  Errors found: {len(analysis.errors)}")
        for error in analysis.errors:
            print(f"    - {error}")
    
    print("\n✓ Validation test completed!")
    print()


def main():
    """Run all tests"""
    print("\n" + "=" * 50)
    print("RotorBench API Test Suite")
    print("=" * 50 + "\n")
    
    try:
        test_data_loading()
        test_build_analysis()
        test_compatibility_validation()
        
        print("=" * 50)
        print("✅ All tests completed successfully!")
        print("=" * 50)
        print("\nYou can now:")
        print("1. Start the API server: python backend/main.py")
        print("2. Test endpoints: curl http://localhost:8000/api/components")
        print("3. Build the frontend analysis page")
        print()
        
    except Exception as e:
        print(f"\n❌ Test failed with error:")
        print(f"   {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())

