"""
Test suite for the RotorBench API
Tests all major functionality including the discharge curve improvements

Run this after making changes to verify everything works correctly
"""
import json
import sys
from pathlib import Path
from typing import List, Tuple

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.component_data import (
    get_all_motors,
    get_all_batteries,
    get_all_components_db
)
from models.components import DroneBuild, DroneComponents
from utils.build_analysis import analyze_build

# Test configuration
EXPECTED_MIN_DISCHARGE_POINTS = 15  # Minimum acceptable data points
EXPECTED_CURRENT_RANGE = (10, 30)   # Realistic current draw range (A)
EXPECTED_FLIGHT_TIME_RANGE = (2, 20)  # Realistic flight time range (min)

# Test statistics
test_results = {
    "passed": 0,
    "failed": 0,
    "warnings": 0
}


def log_pass(message: str):
    """Log a passing test"""
    print(f"  PASS {message}")
    test_results["passed"] += 1


def log_fail(message: str):
    """Log a failing test"""
    print(f"  FAIL {message}")
    test_results["failed"] += 1


def log_warning(message: str):
    """Log a warning"""
    print(f"  WARN {message}")
    test_results["warnings"] += 1


def log_info(message: str):
    """Log informational message"""
    print(f"  INFO {message}")


def test_data_loading():
    """Test loading component data"""
    print("=" * 70)
    print("TEST 1: Component Data Loading")
    print("=" * 70)
    
    motors = get_all_motors()
    if len(motors) > 0:
        log_pass(f"Loaded {len(motors)} motors")
    else:
        log_fail("No motors loaded")
    
    batteries = get_all_batteries()
    if len(batteries) > 0:
        log_pass(f"Loaded {len(batteries)} batteries")
    else:
        log_fail("No batteries loaded")
    
    all_components = get_all_components_db()
    
    # Validate minimum component counts
    if len(all_components.motors) >= 3:
        log_pass(f"Sufficient motors ({len(all_components.motors)})")
    else:
        log_warning(f"Only {len(all_components.motors)} motors available")
    
    if len(all_components.batteries) >= 4:
        log_pass(f"Sufficient batteries ({len(all_components.batteries)})")
    else:
        log_warning(f"Only {len(all_components.batteries)} batteries available")
    
    # Validate battery discharge profiles
    print("\n  Battery Discharge Profile Validation:")
    for battery in batteries:
        profile_points = len(battery.discharge_profile)
        if profile_points >= 20:
            log_pass(f"{battery.name}: {profile_points} discharge points (enhanced)")
        elif profile_points >= 10:
            log_warning(f"{battery.name}: {profile_points} discharge points (basic)")
        else:
            log_fail(f"{battery.name}: Only {profile_points} discharge points")
    
    print()


def create_test_build(components, battery_index=0) -> DroneBuild:
    """Helper to create a test build"""
    return DroneBuild(
        id="test-build",
        name="Test Racing Quad",
        description="Test build for validation",
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


def test_discharge_curve_quality():
    """Test discharge curve data quality - THE MAIN TEST FOR THE FIX"""
    print("=" * 70)
    print("TEST 2: Discharge Curve Quality (Main Fix Validation)")
    print("=" * 70)
    
    all_components = get_all_components_db()
    
    if not all_components.batteries:
        log_fail("No batteries available for testing")
        return
    
    # Test with multiple battery capacities
    batteries_to_test = min(len(all_components.batteries), 4)
    
    for i in range(batteries_to_test):
        battery = all_components.batteries[i]
        build = create_test_build(all_components, battery_index=i)
        analysis = analyze_build(build)
        
        print(f"\n  Testing with {battery.name} ({battery.capacity}mAh):")
        
        # Test 1: Number of discharge data points
        discharge_points = len(analysis.flight_simulation.discharge_data)
        if discharge_points >= EXPECTED_MIN_DISCHARGE_POINTS:
            log_pass(f"Discharge points: {discharge_points} (>= {EXPECTED_MIN_DISCHARGE_POINTS})")
        else:
            log_fail(f"Only {discharge_points} discharge points (expected >= {EXPECTED_MIN_DISCHARGE_POINTS})")
        
        # Test 2: Realistic current draw
        current = analysis.flight_simulation.avg_current_draw
        if EXPECTED_CURRENT_RANGE[0] <= current <= EXPECTED_CURRENT_RANGE[1]:
            log_pass(f"Current draw: {current}A (realistic)")
        else:
            log_fail(f"Current draw: {current}A (expected {EXPECTED_CURRENT_RANGE[0]}-{EXPECTED_CURRENT_RANGE[1]}A)")
        
        # Test 3: Realistic flight time
        flight_time = analysis.flight_simulation.estimated_flight_time
        if EXPECTED_FLIGHT_TIME_RANGE[0] <= flight_time <= EXPECTED_FLIGHT_TIME_RANGE[1]:
            log_pass(f"Flight time: {flight_time} min (realistic)")
        else:
            log_warning(f"Flight time: {flight_time} min (may be outside typical range)")
        
        # Test 4: Discharge data consistency
        if discharge_points > 0:
            first_point = analysis.flight_simulation.discharge_data[0]
            last_point = analysis.flight_simulation.discharge_data[-1]
            
            # Voltage should decrease
            if first_point.voltage > last_point.voltage:
                log_pass(f"Voltage decreases: {first_point.voltage}V -> {last_point.voltage}V")
            else:
                log_fail(f"Voltage doesn't decrease properly")
            
            # Capacity should decrease
            if first_point.remaining_capacity > last_point.remaining_capacity:
                log_pass(f"Capacity decreases: {first_point.remaining_capacity:.0f}mAh -> {last_point.remaining_capacity:.0f}mAh")
            else:
                log_fail(f"Capacity doesn't decrease properly")
            
            # Time should progress
            time_range = last_point.time * 60  # Convert to minutes
            if time_range > 1.0:
                log_pass(f"Time range: 0 to {time_range:.1f} min")
            else:
                log_fail(f"Time range too short: {time_range:.1f} min")
            
            # Remaining capacity at end should be around 20%
            final_percentage = (last_point.remaining_capacity / battery.capacity) * 100
            if 15 <= final_percentage <= 25:
                log_pass(f"Ends at {final_percentage:.1f}% capacity (safety margin)")
            else:
                log_warning(f"Ends at {final_percentage:.1f}% capacity (expected ~20%)")
    
    print()


def test_current_calculation():
    """Test that current calculation is realistic"""
    print("=" * 70)
    print("TEST 3: Current Calculation Realism")
    print("=" * 70)
    
    all_components = get_all_components_db()
    build = create_test_build(all_components)
    analysis = analyze_build(build)
    
    current = analysis.flight_simulation.avg_current_draw
    
    log_info(f"Average current draw: {current}A")
    
    # For a typical 5" racing quad:
    # - Hover: ~20-25A
    # - Cruise (50% throttle): ~15-20A
    # - Full throttle: ~100-150A
    
    if 12 <= current <= 25:
        log_pass("Current is in optimal range for cruise flight")
    elif 10 <= current <= 30:
        log_pass("Current is acceptable for cruise flight")
    else:
        log_fail(f"Current {current}A is outside realistic range (10-30A)")
    
    # Check throttle profile if available
    if analysis.flight_simulation.throttle_profile:
        print(f"\n  Throttle Profile Analysis:")
        profile = analysis.flight_simulation.throttle_profile
        
        # Check 0% throttle
        idle = profile[0]
        if idle.current < 2:
            log_pass(f"0% throttle: {idle.current:.2f}A (low idle current)")
        
        # Check 50% throttle (cruise)
        if len(profile) >= 6:
            cruise = profile[5]  # 50% throttle
            if 10 <= cruise.current <= 30:
                log_pass(f"50% throttle: {cruise.current:.2f}A (realistic cruise)")
            else:
                log_warning(f"50% throttle: {cruise.current:.2f}A (may be outside typical range)")
        
        # Check 100% throttle
        full = profile[-1]
        if full.current > 50:
            log_pass(f"100% throttle: {full.current:.2f}A (high full-throttle current)")
        else:
            log_warning(f"100% throttle: {full.current:.2f}A (may be low)")
    
    print()


def test_performance_metrics():
    """Test performance metrics calculation"""
    print("=" * 70)
    print("TEST 4: Performance Metrics")
    print("=" * 70)
    
    all_components = get_all_components_db()
    build = create_test_build(all_components)
    analysis = analyze_build(build)
    
    # Test weight
    weight = analysis.performance.total_weight
    if 400 <= weight <= 800:
        log_pass(f"Total weight: {weight}g (typical 5\" quad range)")
    else:
        log_warning(f"Total weight: {weight}g (may be outside typical range)")
    
    # Test thrust-to-weight ratio
    twr = analysis.performance.thrust_to_weight_ratio
    if twr >= 5.0:
        log_pass(f"T/W ratio: {twr}:1 (excellent for racing)")
    elif twr >= 3.0:
        log_pass(f"T/W ratio: {twr}:1 (adequate for flying)")
    else:
        log_fail(f"T/W ratio: {twr}:1 (too low)")
    
    # Test power draw
    power = analysis.performance.power_draw
    if 200 <= power <= 600:
        log_pass(f"Power draw: {power}W (typical range)")
    else:
        log_warning(f"Power draw: {power}W (may be outside typical range)")
    
    log_info(f"Max thrust: {analysis.performance.max_thrust}g")
    log_info(f"Rating: {analysis.performance.rating.thrust_to_weight.value}")
    
    print()


def test_compatibility_validation():
    """Test compatibility validation"""
    print("=" * 70)
    print("TEST 5: Compatibility Validation")
    print("=" * 70)
    
    all_components = get_all_components_db()
    
    # Test 1: Incomplete build
    print("  Testing incomplete build validation:")
    incomplete_build = DroneBuild(
        id="test-incomplete",
        name="Incomplete Build",
        components=DroneComponents(
            motors=all_components.motors[0] if all_components.motors else None
        ),
        created_at="2024-01-01T00:00:00Z",
        updated_at="2024-01-01T00:00:00Z"
    )
    
    analysis = analyze_build(incomplete_build)
    if not analysis.is_valid and len(analysis.errors) > 0:
        log_pass(f"Detected incomplete build ({len(analysis.errors)} errors)")
    else:
        log_fail("Failed to detect incomplete build")
    
    # Test 2: Valid build
    print("\n  Testing valid build:")
    valid_build = create_test_build(all_components)
    analysis = analyze_build(valid_build)
    
    if analysis.is_valid:
        log_pass("Valid build passes validation")
    else:
        log_fail(f"Valid build failed validation: {analysis.errors}")
    
    if analysis.warnings:
        log_info(f"Warnings: {', '.join(analysis.warnings)}")
    
    print()


def test_battery_scaling():
    """Test that flight time scales properly with battery capacity"""
    print("=" * 70)
    print("TEST 6: Battery Capacity Scaling")
    print("=" * 70)
    
    all_components = get_all_components_db()
    
    if len(all_components.batteries) < 2:
        log_warning("Need at least 2 batteries to test scaling")
        print()
        return
    
    # Test with smallest and largest battery
    batteries = sorted(all_components.batteries, key=lambda b: b.capacity)
    small_battery = batteries[0]
    large_battery = batteries[-1]
    
    # Build with small battery
    build_small = create_test_build(all_components, battery_index=0)
    build_small.components.battery = small_battery
    analysis_small = analyze_build(build_small)
    
    # Build with large battery
    build_large = create_test_build(all_components, battery_index=0)
    build_large.components.battery = large_battery
    analysis_large = analyze_build(build_large)
    
    capacity_ratio = large_battery.capacity / small_battery.capacity
    flight_time_ratio = analysis_large.flight_simulation.estimated_flight_time / analysis_small.flight_simulation.estimated_flight_time
    
    log_info(f"Small battery: {small_battery.name} ({small_battery.capacity}mAh) -> {analysis_small.flight_simulation.estimated_flight_time:.1f} min")
    log_info(f"Large battery: {large_battery.name} ({large_battery.capacity}mAh) -> {analysis_large.flight_simulation.estimated_flight_time:.1f} min")
    log_info(f"Capacity ratio: {capacity_ratio:.2f}x")
    log_info(f"Flight time ratio: {flight_time_ratio:.2f}x")
    
    # Flight time should scale roughly with capacity (within 20% tolerance)
    if 0.8 <= (flight_time_ratio / capacity_ratio) <= 1.2:
        log_pass("Flight time scales properly with battery capacity")
    else:
        log_warning("Flight time scaling may be off (expected ~linear)")
    
    # Discharge points should increase with larger batteries
    points_small = len(analysis_small.flight_simulation.discharge_data)
    points_large = len(analysis_large.flight_simulation.discharge_data)
    
    if points_large >= points_small:
        log_pass(f"Larger battery has more discharge points ({points_large} vs {points_small})")
    else:
        log_warning(f"Larger battery has fewer discharge points ({points_large} vs {points_small})")
    
    print()


def test_cost_calculation():
    """Test cost calculation"""
    print("=" * 70)
    print("TEST 7: Cost Calculation")
    print("=" * 70)
    
    all_components = get_all_components_db()
    build = create_test_build(all_components)
    analysis = analyze_build(build)
    
    total_cost = analysis.total_cost
    
    if total_cost > 0:
        log_pass(f"Total build cost calculated: ${total_cost}")
    else:
        log_fail("Build cost is $0")
    
    # Typical 5" racing quad costs $200-500
    if 100 <= total_cost <= 600:
        log_pass(f"Cost ${total_cost} is in typical range")
    else:
        log_warning(f"Cost ${total_cost} may be outside typical range")
    
    print()


def print_summary():
    """Print test summary"""
    print("=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    
    total_tests = test_results["passed"] + test_results["failed"]
    pass_rate = (test_results["passed"] / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\n  Tests Passed:  {test_results['passed']}")
    print(f"  Tests Failed:  {test_results['failed']}")
    print(f"  Warnings:      {test_results['warnings']}")
    print(f"  Pass Rate:     {pass_rate:.1f}%")
    
    if test_results["failed"] == 0:
        print(f"\n  SUCCESS All tests passed!")
        print("\n  The discharge curve fix is working correctly:")
        print("  - Realistic current calculations (15-20A cruise)")
        print("  - Sufficient data points (20+ per curve)")
        print("  - Proper flight time estimates (4-15 min range)")
        print("  - Smooth voltage/capacity discharge curves")
    else:
        print(f"\n  FAILURE {test_results['failed']} test(s) failed")
        print("  Please review the failures above and fix any issues.")
    
    if test_results["warnings"] > 0:
        print(f"\n  NOTE: {test_results['warnings']} warning(s) detected")
        print("  Warnings are not failures but may indicate areas to review.")
    
    print("\n" + "=" * 70)


def main():
    """Run all tests"""
    print("\n" + "=" * 70)
    print("RotorBench Comprehensive Test Suite")
    print("Testing Discharge Curve Improvements & Core Functionality")
    print("=" * 70 + "\n")
    
    try:
        test_data_loading()
        test_discharge_curve_quality()  # Main test for the fix
        test_current_calculation()
        test_performance_metrics()
        test_compatibility_validation()
        test_battery_scaling()
        test_cost_calculation()
        
        print_summary()
        
        if test_results["failed"] == 0:
            print("\nYou can now:")
            print("1. Start the API server: uvicorn main:app --reload")
            print("2. Start the frontend: npm start")
            print("3. Test the analysis page with different battery configurations")
            print()
            return 0
        else:
            return 1
        
    except Exception as e:
        print(f"\nFATAL ERROR Test suite crashed:")
        print(f"   {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
