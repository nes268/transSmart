import sys
import json
import math

# Read input from Node
input_data = json.loads(sys.stdin.read())

job = input_data["job"]
transporters = input_data["transporters"]

def calculate_score(job, transporter):
    score = 0

    # Capacity match (prefer closest capacity)
    capacity_diff = abs(transporter["capacity"] - job["requiredCapacity"])
    score += capacity_diff * 2

    # Distance weight (simulate distance)
    distance = math.sqrt(
        (transporter["lat"] - job["pickupLat"])**2 +
        (transporter["lng"] - job["pickupLng"])**2
    )
    score += distance * 5

    # Fuel preference
    if transporter["fuelType"] == "electric":
        score -= 5  # reward eco-friendly

    return score


best_option = None
best_score = float("inf")

for transporter in transporters:
    score = calculate_score(job, transporter)

    if score < best_score:
        best_score = score
        best_option = transporter

print(json.dumps(best_option))
