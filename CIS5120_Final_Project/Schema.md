# RotorBench Data Schema Documentation

Reference for RotorBench data schema between frontend and backend
## File Structure

```
CIS5120_Final_Project/rotorbench/src/data/
├── components.json    # All component data (motors, props, ESCs, FCs, frames, batteries, receivers)
└── builds.json        # Saved builds with component IDs only
```

## Component Schemas

### Motor
```typescript
{
  id: string;              // e.g., "motor-2207-1850kv"
  name: string;            // e.g., "2207 1850KV"
  kv: number;              // RPM per volt
  weight: number;          // grams
  maxCurrent: number;      // amps
  voltage: {
    min: number;           // minimum voltage (e.g., 11.1V for 3S)
    max: number;           // maximum voltage (e.g., 25.2V for 6S)
  };
  size: string;            // e.g., "2207", "2306"
  price: number;           // USD
}
```

**Example:**
```json
{
  "id": "motor-2207-1850kv",
  "name": "2207 1850KV",
  "kv": 1850,
  "weight": 33,
  "maxCurrent": 39,
  "voltage": { "min": 11.1, "max": 25.2 },
  "size": "2207",
  "price": 19.99
}
```

### Propeller
```typescript
{
  id: string;              // e.g., "prop-5143-tri"
  name: string;            // e.g., "5143 Tri-Blade"
  size: number;            // inches (e.g., 5.1)
  pitch: number;           // inches (e.g., 4.3)
  bladeCount: number;      // typically 3 or 4
  weight: number;          // grams per propeller
  material: string;        // e.g., "Polycarbonate", "Carbon Fiber"
  price: number;           // USD
  thrustData: {            // Thrust for different motor KVs
    kv: number;            // Motor KV this applies to
    thrust: number;        // Grams of thrust at full throttle
  }[];
}
```

**Example:**
```json
{
  "id": "prop-5143-tri",
  "name": "5143 Tri-Blade",
  "size": 5.1,
  "pitch": 4.3,
  "bladeCount": 3,
  "weight": 4.5,
  "material": "Polycarbonate",
  "price": 2.79,
  "thrustData": [
    { "kv": 1700, "thrust": 1380 },
    { "kv": 1850, "thrust": 1480 },
    { "kv": 2400, "thrust": 1750 },
    { "kv": 2750, "thrust": 1920 }
  ]
}
```

### ESC (Electronic Speed Controller)
```typescript
{
  id: string;
  name: string;
  manufacturer: string;     // KEPT for ESCs
  currentRating: number;    // continuous amps
  burstCurrent: number;     // peak amps
  weight: number;           // grams
  voltage: {
    min: number;
    max: number;
  };
  protocol: string[];       // e.g., ["DShot600", "DShot300"]
  price: number;
}
```

**Example:**
```json
{
  "id": "esc-iflight-succex-45a",
  "name": "SucceX-E 45A 4in1",
  "manufacturer": "iFlight",
  "currentRating": 45,
  "burstCurrent": 55,
  "weight": 7.2,
  "voltage": { "min": 11.1, "max": 25.2 },
  "protocol": ["DShot600", "DShot300"],
  "price": 39.99
}
```

### Flight Controller
```typescript
{
  id: string;
  name: string;
  manufacturer: string;     // KEPT for FCs
  processor: string;        // e.g., "STM32F405"
  weight: number;           // grams
  firmware: string[];       // e.g., ["Betaflight", "INAV"]
  imu: string;              // e.g., "ICM42688P"
  maxVoltage: number;       // maximum input voltage
  features: string[];       // e.g., ["OSD", "Blackbox", "Bluetooth"]
  price: number;
}
```

**Example:**
```json
{
  "id": "fc-speedybee-f405-v3",
  "name": "SpeedyBee F405 V3",
  "manufacturer": "SpeedyBee",
  "processor": "STM32F405",
  "weight": 6.2,
  "firmware": ["Betaflight", "INAV"],
  "imu": "ICM42688P",
  "maxVoltage": 25.2,
  "features": ["OSD", "Blackbox", "Barometer", "Bluetooth"],
  "price": 39.99
}
```

### Frame
```typescript
{
  id: string;
  name: string;            // e.g., "5\" Frame 225mm"
  size: number;            // wheelbase in mm
  weight: number;          // grams
  material: string;        // e.g., "Carbon Fiber"
  motorCount: number;      // typically 4
  maxPropSize: number;     // inches
  stackHeight: number;     // mm (mounting hole spacing)
  price: number;
}
```

**Example:**
```json
{
  "id": "frame-5inch-225mm",
  "name": "5\" Frame 225mm",
  "size": 225,
  "weight": 112,
  "material": "Carbon Fiber",
  "motorCount": 4,
  "maxPropSize": 5.1,
  "stackHeight": 30,
  "price": 39.99
}
```

### Battery
```typescript
{
  id: string;
  name: string;            // e.g., "4S 1550mAh 95C"
  capacity: number;        // mAh
  voltage: number;         // nominal voltage (cells × 3.7V)
  cells: number;           // S count (e.g., 4 for 4S)
  cRating: number;         // discharge C rating
  weight: number;          // grams
  dischargeProfile: {
    percentage: number;    // 0-100 (remaining capacity)
    voltage: number;       // voltage at this percentage
  }[];
  price: number;
}
```

**Example:**
```json
{
  "id": "battery-4s-1550mah-95c",
  "name": "4S 1550mAh 95C",
  "capacity": 1550,
  "voltage": 14.8,
  "cells": 4,
  "cRating": 95,
  "weight": 185,
  "dischargeProfile": [
    { "percentage": 100, "voltage": 16.8 },
    { "percentage": 90, "voltage": 16.5 },
    { "percentage": 80, "voltage": 16.1 },
    { "percentage": 50, "voltage": 14.9 },
    { "percentage": 20, "voltage": 13.7 },
    { "percentage": 0, "voltage": 12.0 }
  ],
  "price": 32.99
}
```

### Receiver
```typescript
{
  id: string;
  name: string;            // e.g., "ELRS 2.4G RX"
  protocol: string;        // e.g., "CRSF", "SBUS"
  weight: number;          // grams
  currentDraw: number;     // mA
  channels: number;        // number of channels
  price: number;
}
```

**Example:**
```json
{
  "id": "rx-elrs-24g",
  "name": "ELRS 2.4G RX",
  "protocol": "CRSF",
  "weight": 1.2,
  "currentDraw": 45,
  "channels": 8,
  "price": 15.99
}
```

## Build Storage

### DroneBuildConfig (Storage Format)
Stores only component IDs for now...

```typescript
{
  id: string;
  name: string;
  description?: string;
  componentIds: {
    frameId: string | null;
    motorId: string | null;
    propellerId: string | null;
    escId: string | null;
    flightControllerId: string | null;
    batteryId: string | null;
    receiverId?: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Example:**
```json
{
  "id": "build-racing-5inch",
  "name": "Racing 5-inch Build",
  "description": "Balanced freestyle/racing quad",
  "componentIds": {
    "frameId": "frame-5inch-225mm",
    "motorId": "motor-2207-1850kv",
    "propellerId": "prop-5143-tri",
    "escId": "esc-iflight-succex-45a",
    "flightControllerId": "fc-speedybee-f405-v3",
    "batteryId": "battery-4s-1550mah-95c",
    "receiverId": "rx-elrs-24g"
  },
  "createdAt": "2025-11-04T10:00:00.000Z",
  "updatedAt": "2025-11-04T10:00:00.000Z"
}
```

### DroneBuild (Analysis Format)
Full component objects for analysis.

```typescript
{
  id: string;
  name: string;
  description?: string;
  components: {
    frame: Frame | null;
    motors: Motor | null;
    propellers: Propeller | null;
    esc: ESC | null;
    flightController: FlightController | null;
    battery: Battery | null;
    receiver?: Receiver | null;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

