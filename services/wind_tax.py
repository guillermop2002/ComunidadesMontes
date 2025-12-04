class WindTaxCalculator2025:
    """
    Calculates the 'Canon Eólico' for Galicia based on the 2025 regulations.
    Reference: Ley 7/2012 de Montes de Galicia (modified) & Atriga 2025.
    """

    def __init__(self):
        # Tax Brackets (Placeholder values based on standard regulations)
        # These should be updated with the exact values from the annual order.
        self.TAX_PER_UNIT = {
            "low": 1000.0,   # < 100m total height
            "medium": 2500.0, # 100m - 150m
            "high": 5000.0    # > 150m
        }

    def calculate_turbine_height(self, hub_height: float, rotor_radius: float) -> float:
        """
        Total Height = Hub Height + Rotor Radius (Tip Height)
        """
        return hub_height + rotor_radius

    def get_tax_bracket(self, total_height: float) -> float:
        if total_height < 100.0:
            return self.TAX_PER_UNIT["low"]
        elif total_height < 150.0:
            return self.TAX_PER_UNIT["medium"]
        else:
            return self.TAX_PER_UNIT["high"]

    def calculate_park_tax(self, num_turbines: int, hub_height: float, rotor_radius: float, days_operation: int = 365) -> dict:
        """
        Calculates the total tax for a wind park.
        """
        total_height = self.calculate_turbine_height(hub_height, rotor_radius)
        tax_per_unit = self.get_tax_bracket(total_height)
        
        # Proration for partial years
        proration_factor = days_operation / 365.0
        
        base_tax = tax_per_unit * num_turbines
        final_tax = base_tax * proration_factor

        return {
            "num_turbines": num_turbines,
            "turbine_specs": {
                "hub_height": hub_height,
                "rotor_radius": rotor_radius,
                "total_height": total_height
            },
            "tax_calculation": {
                "tax_per_unit": tax_per_unit,
                "days_operation": days_operation,
                "proration_factor": round(proration_factor, 4),
                "base_tax": base_tax,
                "final_tax": round(final_tax, 2)
            }
        }

if __name__ == "__main__":
    # Example Usage
    calc = WindTaxCalculator2025()
    
    # Scenario: Repowered Park with 5 giant turbines (Vestas V162 EnVentus)
    # Hub: 149m, Rotor Radius: 81m -> Total: 230m
    result = calc.calculate_park_tax(num_turbines=5, hub_height=149.0, rotor_radius=81.0)
    
    import json
    print(json.dumps(result, indent=2))
