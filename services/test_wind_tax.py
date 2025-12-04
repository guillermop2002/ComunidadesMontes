"""
Test Wind Tax Calculator
"""
import sys
sys.path.append('.')

from wind_tax import WindTaxCalculator2025
import json

print("=" * 60)
print("TESTING WIND TAX CALCULATOR 2025")
print("=" * 60)

calc = WindTaxCalculator2025()

# Test 1: Small turbine (Vestas V90)
print("\n[TEST 1] Vestas V90 - 80m Hub, 45m Rotor Radius")
result1 = calc.calculate_park_tax(num_turbines=10, hub_height=80.0, rotor_radius=45.0)
print(json.dumps(result1, indent=2, ensure_ascii=False))

# Test 2: Giant repowered turbine (Vestas V162)
print("\n[TEST 2] Vestas V162 - 149m Hub, 81m Rotor Radius (Repowering)")
result2 = calc.calculate_park_tax(num_turbines=3, hub_height=149.0, rotor_radius=81.0)
print(json.dumps(result2, indent=2, ensure_ascii=False))

# Test 3: Partial year operation
print("\n[TEST 3] New Installation - 180 days operation")
result3 = calc.calculate_park_tax(num_turbines=5, hub_height=100.0, rotor_radius=50.0, days_operation=180)
print(json.dumps(result3, indent=2, ensure_ascii=False))

print("\n" + "=" * 60)
print("TESTS COMPLETED SUCCESSFULLY")
print("=" * 60)
