import sys
import json
import math

# Haversine distance calculation
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km

    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)

    a = (math.sin(dLat/2) ** 2 +
         math.cos(math.radians(lat1)) *
         math.cos(math.radians(lat2)) *
         math.sin(dLon/2) ** 2)

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

# Read input from Node
data = json.loads(sys.stdin.read())

pickup = data["pickup"]
drop = data["drop"]
fuelType = data["fuelType"]
efficiency = data["fuelEfficiency"]  # km per liter

distance = haversine(
    pickup["lat"], pickup["lng"],
    drop["lat"], drop["lng"]
)

# Fuel consumption
fuel_used = distance / efficiency if efficiency > 0 else 0

# CO2 emission factors (kg per liter)
emission_factors = {
    "diesel": 2.68,
    "petrol": 2.31,
    "electric": 0.5  # simulated grid emission
}

co2 = fuel_used * emission_factors.get(fuelType, 2.5)

# GreenScore (100 - normalized emission)
greenscore = max(0, 100 - (co2 * 2))

result = {
    "distance_km": round(distance, 2),
    "fuel_used_liters": round(fuel_used, 2),
    "co2_emission_kg": round(co2, 2),
    "greenScore": round(greenscore, 2)
}

print(json.dumps(result))
