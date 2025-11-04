## Analysis Results

### Performance Metrics

```typescript
{
  totalWeight: number;              // grams (all components)
  maxThrust: number;                // grams (all motors at full throttle)
  thrustToWeightRatio: number;      // ratio
  powerDraw: number;                // watts (average at 50% throttle)
  rating: {
    weight: "light" | "medium" | "heavy";
    thrustToWeight: "poor" | "adequate" | "good" | "excellent";
  };
}
```

**Ratings:**
- **Weight (5-inch quad):** Light < 500g, Medium 500-700g, Heavy > 700g
- **Thrust-to-Weight:** Poor < 3.0, Adequate 3.0-5.0, Good 5.0-8.0, Excellent > 8.0

### Flight Simulation

```typescript
{
  batteryCapacity: number;          // mAh
  avgCurrentDraw: number;           // amps at cruise (50% throttle)
  estimatedFlightTime: number;      // minutes at cruise
  estimatedRange: number;           // km
  avgSpeed: number;                 // km/h (default 45)
  hoverTime: number;                // minutes at hover throttle
  maxSpeed: number;                 // km/h at full throttle
  efficiency: number;               // mAh per km 
  dischargeData: {
    time: number;                   // minutes
    voltage: number;                // volts
    remainingCapacity: number;      // mAh
    currentDraw: number;            // amps 
  }[];
  throttleProfile: {                // 
    throttle: number;               // 0-1 (0-100%)
    thrust: number;                 // grams
    current: number;                // amps
    power: number;                  // watts
  }[];
}
```

### Build Analysis

```typescript
{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  performance: PerformanceMetrics;
  flightSimulation: FlightSimulation;
  totalCost: number;                // USD
}
```

## Thrust Calculation Logic

### How It Works

1. **Propeller defines thrust** for specific motor KV values
2. **Backend interpolates** if exact KV not found in thrust data
3. **Calculation** happens only when both motor AND propeller are selected

### Example 1: Exact Match

**Motor:** 2207 1850KV  
**Propeller:** 5143 Tri-Blade with thrust data:
```json
[
  { "kv": 1700, "thrust": 1380 },
  { "kv": 1850, "thrust": 1480 },  // match
  { "kv": 2400, "thrust": 1750 }
]
```

**Result:** 1480g per motor × 4 motors = **5920g total thrust**

### Example 2: Interpolation

**Motor:** 2306 2000KV (not in thrust data)  
**Propeller data has:** 1850KV and 2400KV

**Interpolation:**
```
thrust = thrust_1850 + (kv_motor - kv_1850) / (kv_2400 - kv_1850) × (thrust_2400 - thrust_1850)
       = 1480 + (2000 - 1850) / (2400 - 1850) × (1750 - 1480)
       = 1480 + 150 / 550 × 270
       = 1480 + 0.273 × 270
       = 1554g per motor
```

**Result:** 1554g per motor × 4 motors = **6216g total thrust**

### Example 3: Extrapolation

If motor KV is outside the thrust data range, linear extrapolation is used:
```
thrust = thrust_closest × (kv_motor / kv_closest)
```

## Enhanced Flight Simulation Details

### 1. Hover Time Calculation
Calculates minimum throttle to maintain altitude (thrust = weight):
```
hover_throttle = sqrt(total_weight / max_thrust)
hover_time = (battery_capacity × 0.8) / (hover_current × 1000) × 60
```

### 2. Max Speed Estimation
Based on thrust-to-weight ratio:
```
max_speed = 60 × sqrt(TWR / 5.0) km/h
```
Empirical formula for typical 5-inch racing quads.

### 3. Efficiency
```
efficiency = (battery_capacity × 0.8) / range  mAh/km
```
Lower is better. Typical values: 300-600 mAh/km.

### 4. Throttle Profile
Shows performance at 0%, 10%, 20%, ..., 100% throttle:
- **Thrust:** scales with throttle²
- **Current:** scales with throttle^1.8
- **Power:** voltage × current

### 5. Current Draw Calculation
Non-linear relationship (prop loading):
```
current_per_motor = max_current × (throttle^1.8)
```