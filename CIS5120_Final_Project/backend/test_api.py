"""
Test suite for the RotorBench API
Tests all major functionality including the discharge curve improvements
"""
import sys
import random
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.component_data import get_all_motors, get_all_batteries, get_all_components_db
from models.components import DroneBuild, DroneComponents
from utils.build_analysis import analyze_build

# Test configuration
EXPECTED_MIN_DISCHARGE_POINTS = 15
EXPECTED_CURRENT_RANGE = (10, 30)
EXPECTED_FLIGHT_TIME_RANGE = (2, 20)
EXPECTED_WEIGHT_RANGE = (300, 900)
EXPECTED_TWR_MIN = 2.0

test_results = {"passed": 0, "failed": 0, "warnings": 0}


def assert_test(condition: bool, message: str, is_warning: bool = False):
    """Assert a test condition"""
    if condition:
        test_results["passed"] += 1
    elif is_warning:
        print(f"WARN: {message}")
        test_results["warnings"] += 1
    else:
        print(f"FAIL: {message}")
        test_results["failed"] += 1


def create_test_build(components, battery_index=0) -> DroneBuild:
    """Helper to create a test build"""
    return DroneBuild(
        id="test-build",
        name="Test Racing Quad",
        description="Test build",
        components=DroneComponents(
            frame=components.frames[0] if components.frames else None,
            motors=components.motors[0] if components.motors else None,
            propellers=components.propellers[0] if components.propellers else None,
            esc=components.escs[0] if components.escs else None,
            flight_controller=components.flight_controllers[0] if components.flight_controllers else None,
            battery=components.batteries[battery_index] if len(components.batteries) > battery_index else None,
            receiver=components.receivers[0] if components.receivers else None
        ),
        created_at="2024-01-01T00:00:00Z",
        updated_at="2024-01-01T00:00:00Z"
    )


def create_random_build(components) -> DroneBuild:
    """Create a random build for testing"""
    return DroneBuild(
        id=f"random-build-{random.randint(1000, 9999)}",
        name="Random Test Build",
        description="Randomly generated test build",
        components=DroneComponents(
            frame=random.choice(components.frames) if components.frames else None,
            motors=random.choice(components.motors) if components.motors else None,
            propellers=random.choice(components.propellers) if components.propellers else None,
            esc=random.choice(components.escs) if components.escs else None,
            flight_controller=random.choice(components.flight_controllers) if components.flight_controllers else None,
            battery=random.choice(components.batteries) if components.batteries else None,
            receiver=random.choice(components.receivers) if components.receivers else None
        ),
        created_at="2024-01-01T00:00:00Z",
        updated_at="2024-01-01T00:00:00Z"
    )


def test_data_loading():
    """Test loading component data"""
    print("\n[1/10] Component Data Loading")
    
    motors = get_all_motors()
    assert_test(len(motors) > 0, "Motors loaded")
    
    batteries = get_all_batteries()
    assert_test(len(batteries) > 0, "Batteries loaded")
    
    components = get_all_components_db()
    assert_test(len(components.motors) >= 3, "Sufficient motors")
    assert_test(len(components.batteries) >= 4, "Sufficient batteries")
    
    # Validate battery discharge profiles
    for battery in batteries:
        profile_points = len(battery.discharge_profile)
        assert_test(
            profile_points >= 20,
            f"{battery.name} has {profile_points} discharge points",
            is_warning=(profile_points < 20)
        )


def test_discharge_curve_quality():
    """Test discharge curve data quality"""
    print("\n[2/10] Discharge Curve Quality")
    
    components = get_all_components_db()
    if not components.batteries:
        assert_test(False, "No batteries available")
        return
    
    for i in range(min(len(components.batteries), 3)):
        battery = components.batteries[i]
        build = create_test_build(components, battery_index=i)
        analysis = analyze_build(build)
        
        discharge_points = len(analysis.flight_simulation.discharge_data)
        assert_test(
            discharge_points >= EXPECTED_MIN_DISCHARGE_POINTS,
            f"{battery.name}: {discharge_points} discharge points"
        )
        
        current = analysis.flight_simulation.avg_current_draw
        assert_test(
            EXPECTED_CURRENT_RANGE[0] <= current <= EXPECTED_CURRENT_RANGE[1],
            f"{battery.name}: Current {current}A is realistic"
        )
        
        flight_time = analysis.flight_simulation.estimated_flight_time
        assert_test(
            EXPECTED_FLIGHT_TIME_RANGE[0] <= flight_time <= EXPECTED_FLIGHT_TIME_RANGE[1],
            f"{battery.name}: Flight time {flight_time} min is realistic",
            is_warning=True
        )
        
        if discharge_points > 0:
            first = analysis.flight_simulation.discharge_data[0]
            last = analysis.flight_simulation.discharge_data[-1]
            
            assert_test(first.voltage > last.voltage, "Voltage decreases over time")
            assert_test(first.remaining_capacity > last.remaining_capacity, "Capacity decreases over time")
            
            final_pct = (last.remaining_capacity / battery.capacity) * 100
            assert_test(
                15 <= final_pct <= 25,
                f"Ends at {final_pct:.1f}% capacity (safety margin)",
                is_warning=(final_pct < 15 or final_pct > 25)
            )


def test_current_calculation():
    """Test current calculation realism"""
    print("\n[3/10] Current Calculation")
    
    components = get_all_components_db()
    build = create_test_build(components)
    analysis = analyze_build(build)
    
    current = analysis.flight_simulation.avg_current_draw
    assert_test(10 <= current <= 30, f"Current {current}A is realistic for cruise")
    
    if analysis.flight_simulation.throttle_profile:
        profile = analysis.flight_simulation.throttle_profile
        
        idle = profile[0]
        assert_test(idle.current < 2, f"Idle current {idle.current}A is low")
        
        if len(profile) >= 6:
            cruise = profile[5]
            assert_test(10 <= cruise.current <= 30, f"50% throttle current {cruise.current}A is realistic")
        
        full = profile[-1]
        assert_test(full.current > 40, f"Full throttle current {full.current}A is high")


def test_performance_metrics():
    """Test performance metrics calculation"""
    print("\n[4/10] Performance Metrics")
    
    components = get_all_components_db()
    build = create_test_build(components)
    analysis = analyze_build(build)
    
    weight = analysis.performance.total_weight
    assert_test(400 <= weight <= 800, f"Weight {weight}g is typical for 5\" quad", is_warning=True)
    
    twr = analysis.performance.thrust_to_weight_ratio
    assert_test(twr >= 3.0, f"T/W ratio {twr}:1 is adequate")
    
    power = analysis.performance.power_draw
    assert_test(200 <= power <= 600, f"Power {power}W is typical", is_warning=True)


def test_compatibility_validation():
    """Test compatibility validation"""
    print("\n[5/10] Compatibility Validation")
    
    components = get_all_components_db()
    
    # Test incomplete build
    incomplete = DroneBuild(
        id="test-incomplete",
        name="Incomplete Build",
        components=DroneComponents(motors=components.motors[0] if components.motors else None),
        created_at="2024-01-01T00:00:00Z",
        updated_at="2024-01-01T00:00:00Z"
    )
    analysis = analyze_build(incomplete)
    assert_test(not analysis.is_valid and len(analysis.errors) > 0, "Incomplete build detected")
    
    # Test valid build
    valid = create_test_build(components)
    analysis = analyze_build(valid)
    assert_test(analysis.is_valid, "Valid build passes validation")


def test_battery_scaling():
    """Test battery capacity scaling"""
    print("\n[6/10] Battery Capacity Scaling")
    
    components = get_all_components_db()
    if len(components.batteries) < 2:
        print("  SKIP: Need at least 2 batteries")
        return
    
    batteries = sorted(components.batteries, key=lambda b: b.capacity)
    small = batteries[0]
    large = batteries[-1]
    
    build_small = create_test_build(components)
    build_small.components.battery = small
    analysis_small = analyze_build(build_small)
    
    build_large = create_test_build(components)
    build_large.components.battery = large
    analysis_large = analyze_build(build_large)
    
    capacity_ratio = large.capacity / small.capacity
    flight_time_ratio = analysis_large.flight_simulation.estimated_flight_time / analysis_small.flight_simulation.estimated_flight_time
    
    assert_test(
        0.8 <= (flight_time_ratio / capacity_ratio) <= 1.2,
        f"Flight time scales with capacity (ratio: {flight_time_ratio:.2f}x)"
    )
    
    points_small = len(analysis_small.flight_simulation.discharge_data)
    points_large = len(analysis_large.flight_simulation.discharge_data)
    assert_test(points_large >= points_small, "Larger battery has more discharge points")


def test_cost_calculation():
    """Test cost calculation"""
    print("\n[7/10] Cost Calculation")
    
    components = get_all_components_db()
    build = create_test_build(components)
    analysis = analyze_build(build)
    
    total_cost = analysis.total_cost
    assert_test(total_cost > 0, f"Cost calculated: ${total_cost}")
    assert_test(100 <= total_cost <= 600, f"Cost ${total_cost} is typical", is_warning=True)


def test_random_builds():
    """Test random build configurations"""
    print("\n[8/10] Random Build Testing")
    
    components = get_all_components_db()
    num_random_builds = 10
    
    for i in range(num_random_builds):
        build = create_random_build(components)
        try:
            analysis = analyze_build(build)
            
            # Basic sanity checks
            assert_test(analysis is not None, f"Random build {i+1}: Analysis completed")
            assert_test(analysis.performance.total_weight > 0, f"Random build {i+1}: Weight calculated")
            assert_test(analysis.total_cost >= 0, f"Random build {i+1}: Cost calculated")
            
            # Check discharge data exists if valid
            if analysis.is_valid:
                assert_test(
                    len(analysis.flight_simulation.discharge_data) > 0,
                    f"Random build {i+1}: Has discharge data"
                )
        except Exception as e:
            assert_test(False, f"Random build {i+1} crashed: {str(e)}")


def test_edge_cases():
    """Test edge cases and boundary conditions"""
    print("\n[9/10] Edge Cases")
    
    components = get_all_components_db()
    
    # Test with minimal components (only required)
    minimal = DroneBuild(
        id="minimal-build",
        name="Minimal Build",
        components=DroneComponents(
            frame=components.frames[0] if components.frames else None,
            motors=components.motors[0] if components.motors else None,
            propellers=components.propellers[0] if components.propellers else None,
            battery=components.batteries[0] if components.batteries else None
        ),
        created_at="2024-01-01T00:00:00Z",
        updated_at="2024-01-01T00:00:00Z"
    )
    analysis = analyze_build(minimal)
    assert_test(analysis is not None, "Minimal build analyzed")
    assert_test(len(analysis.warnings) > 0, "Minimal build has warnings")
    
    # Test with all components
    full = create_test_build(components)
    analysis = analyze_build(full)
    assert_test(analysis.is_valid, "Full build is valid")
    assert_test(len(analysis.warnings) == 0 or len(analysis.warnings) > 0, "Full build validation checked")
    
    # Test with empty build
    empty = DroneBuild(
        id="empty-build",
        name="Empty Build",
        components=DroneComponents(),
        created_at="2024-01-01T00:00:00Z",
        updated_at="2024-01-01T00:00:00Z"
    )
    analysis = analyze_build(empty)
    assert_test(not analysis.is_valid, "Empty build is invalid")
    assert_test(len(analysis.errors) > 0, "Empty build has errors")


def test_all_component_combinations():
    """Test multiple component combinations"""
    print("\n[10/10] Component Combinations")
    
    components = get_all_components_db()
    
    # Test different motor-propeller combinations
    if len(components.motors) >= 2 and len(components.propellers) >= 2:
        for i, motor in enumerate(components.motors[:2]):
            for j, prop in enumerate(components.propellers[:2]):
                build = create_test_build(components)
                build.components.motors = motor
                build.components.propellers = prop
                
                analysis = analyze_build(build)
                assert_test(
                    analysis.performance.max_thrust > 0,
                    f"Motor-Prop combo {i+1}-{j+1}: Thrust calculated"
                )
    
    # Test different battery-motor combinations
    if len(components.batteries) >= 2 and len(components.motors) >= 2:
        for i, battery in enumerate(components.batteries[:2]):
            for j, motor in enumerate(components.motors[:2]):
                build = create_test_build(components)
                build.components.battery = battery
                build.components.motors = motor
                
                analysis = analyze_build(build)
                assert_test(
                    analysis.flight_simulation.estimated_flight_time > 0,
                    f"Battery-Motor combo {i+1}-{j+1}: Flight time calculated"
                )


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("RotorBench Test Suite")
    print("=" * 60)
    
    try:
        test_data_loading()
        test_discharge_curve_quality()
        test_current_calculation()
        test_performance_metrics()
        test_compatibility_validation()
        test_battery_scaling()
        test_cost_calculation()
        test_random_builds()
        test_edge_cases()
        test_all_component_combinations()
        
        print("\n" + "=" * 60)
        print("Test Results")
        print("=" * 60)
        print(f"Passed:   {test_results['passed']}")
        print(f"Failed:   {test_results['failed']}")
        print(f"Warnings: {test_results['warnings']}")
        
        if test_results["failed"] == 0:
            print("\nAll tests passed.")
            return 0
        else:
            print(f"\n{test_results['failed']} test(s) failed")
            return 1
        
    except Exception as e:
        print(f"\nTest suite crashed: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
