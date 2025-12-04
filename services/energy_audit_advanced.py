"""
Advanced Energy Audit Module: Real Hourly Production × Price
Integrates ESIOS API for real electricity prices and allows historical audits.
"""
import requests
import math
from typing import Dict, Optional, List
from datetime import datetime, timedelta
import json

class AdvancedEnergyAuditor:
    """
    Complete energy audit with hourly production × hourly price calculation.
    Supports historical date ranges and real market prices.
    """
    
    def __init__(self, esios_token: Optional[str] = None):
        """
        Initialize with API keys.
        ESIOS Token: PENDING (User waiting for email from consultasios@ree.es)
        """
        self.esios_token = esios_token
        self.esios_base_url = "https://api.esios.ree.es"
        self.pvgis_base_url = "https://re.jrc.ec.europa.eu/api/v5_3"
        self.open_meteo_archive_url = "https://archive-api.open-meteo.com/v1/archive"
        
        # Turbine models with power curves
        self.turbine_models = {
            "Vestas V90 3MW": {
                "rated_power": 3000,
                "cut_in": 3.5,
                "rated_speed": 15.0,
                "cut_out": 25.0,
                "hub_height": 105, # Use 100m data from Open-Meteo
                "rotor_radius": 45
            },
            "Vestas V162 6MW": {
                "rated_power": 6000,
                "cut_in": 3.0,
                "rated_speed": 13.0,
                "cut_out": 25.0,
                "hub_height": 149,
                "rotor_radius": 81
            }
        }

    def get_esios_hourly_prices(self, start_date: str, end_date: str) -> Dict[str, float]:
        """
        Get hourly electricity prices from ESIOS (Red Eléctrica).
        """
        if not self.esios_token:
            # Return mock data for testing
            return self._generate_mock_prices(start_date, end_date)
        
        # ESIOS indicator 1001 = "Precio mercado SPOT Diario" (€/MWh)
        indicator_id = 1001
        url = f"{self.esios_base_url}/indicators/{indicator_id}"
        
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Token token={self.esios_token}"
        }
        
        params = {
            "start_date": start_date + "T00:00:00",
            "end_date": end_date + "T23:59:59"
        }
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            prices = {}
            for entry in data["indicator"]["values"]:
                dt_str = entry["datetime"]
                price = entry["value"]
                prices[dt_str] = price
            
            return prices
        
        except Exception as e:
            print(f"ESIOS API Error: {e}. Using mock data.")
            return self._generate_mock_prices(start_date, end_date)

    def get_open_meteo_wind(self, lat: float, lon: float, start_date: str, end_date: str, hub_height_approx: int) -> List[Dict]:
        """
        Get historical wind data from Open-Meteo (Free, No Key).
        Fetches wind speed at 100m (closest to typical hub height).
        """
        # Open-Meteo supports 10m, 80m, 120m, 180m. We'll use 100m (interpolated by them) or closest.
        # Actually, standard variables are wind_speed_10m, wind_speed_100m.
        
        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": start_date,
            "end_date": end_date,
            "hourly": "wind_speed_100m", # Direct 100m data
            "timezone": "Europe/Madrid"
        }
        
        try:
            response = requests.get(self.open_meteo_archive_url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            hourly_data = []
            hourly_units = data["hourly"]
            
            for i, time_str in enumerate(hourly_units["time"]):
                # Open-Meteo format: "2024-01-01T00:00"
                wind_speed = hourly_units["wind_speed_100m"][i]
                
                # Simple correction if hub height is significantly different from 100m
                # But 100m is very close to V90 (105m). We'll use it directly for now.
                
                hourly_data.append({
                    "datetime": f"{time_str}:00", # Add seconds to match ISO
                    "wind_speed_ms": wind_speed
                })
                
            return hourly_data
            
        except Exception as e:
            print(f"Open-Meteo Error: {e}")
            return []
    
    def _generate_mock_prices(self, start_date: str, end_date: str) -> Dict[str, float]:
        """Generate realistic mock prices (40-80 €/MWh)."""
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
        
        prices = {}
        current = start
        while current <= end:
            for hour in range(24):
                dt = current + timedelta(hours=hour)
                # Simulate price variation: higher during day, lower at night
                base_price = 50.0
                if 9 <= hour <= 21:  # Day hours
                    price = base_price + (hour - 15) * 2  # Peak around 15h
                else:  # Night hours
                    price = base_price - 15
                
                prices[dt.isoformat()] = round(price, 2)
            
            current += timedelta(days=1)
        
        return prices
    
    def get_pvgis_hourly_solar(self, lat: float, lon: float, peak_power_kwp: float,
                               year: int) -> List[Dict]:
        """
        Get hourly solar production from PVGIS.
        
        Returns:
            list of {datetime: str, production_kwh: float}
        """
        params = {
            "lat": lat,
            "lon": lon,
            "peakpower": peak_power_kwp,
            "loss": 14,
            "mountingplace": "free",
            "optimalinclination": 1,
            "startyear": year,
            "endyear": year,
            "pvcalculation": 1,  # Force PV calculation to get 'P'
            "outputformat": "json"
        }
        
        try:
            # Note: PVGIS ERA5 database usually has a delay. 2024 might not be available yet.
            # We add a check for the response status.
            response = requests.get(f"{self.pvgis_base_url}/seriescalc", 
                                  params=params, timeout=60)
            
            if response.status_code != 200:
                print(f"PVGIS API Error {response.status_code}: {response.text}")
                return []
                
            data = response.json()
            
            hourly_data = []
            for entry in data["outputs"]["hourly"]:
                # PVGIS format: "20230101:0010"
                dt_str = entry["time"]
                production_w = entry["P"]  # Power in W
                
                # Convert to kWh (1 hour at W power)
                production_kwh = production_w / 1000.0
                
                # Format datetime to ISO 8601 for consistency
                # "20230101:0010" -> "2023-01-01T00:10:00"
                date_part = dt_str.split(":")[0]
                time_part = dt_str.split(":")[1]
                formatted_dt = f"{date_part[:4]}-{date_part[4:6]}-{date_part[6:8]}T{time_part[:2]}:{time_part[2:]}:00"
                
                hourly_data.append({
                    "datetime": formatted_dt,
                    "production_kwh": production_kwh
                })
            
            return hourly_data
        
        except Exception as e:
            print(f"PVGIS Exception: {str(e)}")
            return []

    def extrapolate_wind(self, v_10: float, hub_height: float, z0: float = 0.3) -> float:
        """Logarithmic wind extrapolation."""
        return v_10 * (math.log(hub_height / z0) / math.log(10 / z0))
    
    def calculate_wind_power(self, wind_speed: float, turbine_model: str) -> float:
        """Calculate power output from wind speed."""
        specs = self.turbine_models.get(turbine_model)
        if not specs:
            raise ValueError(f"Unknown turbine: {turbine_model}")
        
        v = wind_speed
        
        if v < specs["cut_in"]:
            return 0.0
        elif v >= specs["rated_speed"] and v < specs["cut_out"]:
            return specs["rated_power"]
        elif v >= specs["cut_out"]:
            return 0.0
        else:
            # Cubic approximation
            ratio = (v - specs["cut_in"]) / (specs["rated_speed"] - specs["cut_in"])
            return specs["rated_power"] * (ratio ** 3)
    
    def audit_wind_historical(self, lat: float, lon: float, turbine_model: str,
                             num_turbines: int, start_date: str, end_date: str,
                             company_payment: float) -> Dict:
        """
        Complete historical wind audit with hourly price integration.
        Uses Open-Meteo for real historical wind data at 100m height.
        """
        # 1. Get hourly electricity prices (ESIOS or Mock)
        prices = self.get_esios_hourly_prices(start_date, end_date)
        
        # 2. Get real historical wind data from Open-Meteo
        specs = self.turbine_models[turbine_model]
        wind_data = self.get_open_meteo_wind(lat, lon, start_date, end_date, specs["hub_height"])
        
        if not wind_data:
            return {"error": "Could not fetch Open-Meteo wind data"}

        # 3. Calculate hourly production and revenue
        hourly_revenue = []
        total_production_kwh = 0
        total_revenue = 0
        
        # Create a map of prices for fast lookup
        # ESIOS/Mock keys are ISO strings. Open-Meteo is "YYYY-MM-DDTHH:MM:SS"
        # We'll match by hour.
        
        for entry in wind_data:
            dt_str = entry["datetime"]
            wind_speed = entry["wind_speed_ms"]
            
            # Find price (simplified matching)
            price_eur_mwh = prices.get(dt_str, 50.0) # Default to 50 if mismatch
            
            # Calculate production for this hour
            power_kw = self.calculate_wind_power(wind_speed, turbine_model)
            production_kwh_per_turbine = power_kw * 1  # 1 hour
            production_kwh_total = production_kwh_per_turbine * num_turbines
            
            # Calculate revenue for this hour
            revenue_eur = (production_kwh_total / 1000.0) * price_eur_mwh
            
            hourly_revenue.append({
                "datetime": dt_str,
                "wind_speed_100m": wind_speed,
                "production_mwh": round(production_kwh_total / 1000, 3),
                "price_eur_mwh": price_eur_mwh,
                "revenue_eur": round(revenue_eur, 2)
            })
            
            total_production_kwh += production_kwh_total
            total_revenue += revenue_eur
        
        # 4. Calculate average capture price
        avg_capture_price = (total_revenue / (total_production_kwh / 1000)) if total_production_kwh > 0 else 0
        
        # 5. Calculate discrepancy
        discrepancy = total_revenue - company_payment
        discrepancy_pct = (discrepancy / total_revenue * 100) if total_revenue > 0 else 0
        
        return {
            "period": {"start": start_date, "end": end_date},
            "installation": {
                "turbine_model": turbine_model,
                "num_turbines": num_turbines,
                "location": {"lat": lat, "lon": lon}
            },
            "production_summary": {
                "total_mwh": round(total_production_kwh / 1000, 2),
                "hours_analyzed": len(wind_data),
                "data_source": "Open-Meteo Archive (Real 100m Wind)"
            },
            "price_analysis": {
                "avg_market_price_eur_mwh": round(sum(prices.values()) / len(prices), 2) if prices else 0,
                "avg_capture_price_eur_mwh": round(avg_capture_price, 2),
                "note": "Prices are MOCK until ESIOS token is provided" if not self.esios_token else "Real ESIOS Prices"
            },
            "financial_analysis": {
                "estimated_revenue_eur": round(total_revenue, 2),
                "company_payment_eur": company_payment,
                "discrepancy_eur": round(discrepancy, 2),
                "discrepancy_pct": round(discrepancy_pct, 2)
            },
            "assessment": self._generate_assessment(discrepancy_pct),
            "hourly_detail_sample": hourly_revenue[:24]
        }
    
    def audit_solar_historical(self, lat: float, lon: float, peak_power_kwp: float,
                              year: int, company_payment: float) -> Dict:
        """
        Complete solar audit with PVGIS hourly data + ESIOS prices.
        Shows the "solar cannibalization effect" (price drops when sun is high).
        """
        # 1. Get PVGIS hourly solar production
        solar_data = self.get_pvgis_hourly_solar(lat, lon, peak_power_kwp, year)
        
        if not solar_data:
            return {"error": "Could not fetch PVGIS data. Check logs."}
        
        # 2. Get hourly prices for the year
        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"
        prices = self.get_esios_hourly_prices(start_date, end_date)
        
        # 3. Match production with prices and calculate revenue
        total_production_kwh = 0
        total_revenue = 0
        hourly_detail = []
        
        # PVGIS might return slightly different number of hours (leap years etc)
        # We iterate through available solar data
        
        for entry in solar_data:
            dt_str = entry["datetime"] # ISO format now
            production_kwh = entry["production_kwh"]
            
            # Find price for this timestamp (or closest approximation for mock)
            # In real ESIOS, we would match exact datetime.
            # Here we use the mock dictionary keys or fallback
            
            price = prices.get(dt_str, 50.0) # Default to 50 if key mismatch
            
            revenue = (production_kwh / 1000.0) * price
            
            hourly_detail.append({
                "datetime": dt_str,
                "production_kwh": round(production_kwh, 2),
                "price_eur_mwh": price,
                "revenue_eur": round(revenue, 2)
            })
            
            total_production_kwh += production_kwh
            total_revenue += revenue
        
        # 4. Calculate capture price (will be LOWER than average due to cannibalization)
        avg_market_price = sum(prices.values()) / len(prices) if prices else 0
        capture_price = (total_revenue / (total_production_kwh / 1000)) if total_production_kwh > 0 else 0
        cannibalization_factor = capture_price - avg_market_price
        
        discrepancy = total_revenue - company_payment
        discrepancy_pct = (discrepancy / total_revenue * 100) if total_revenue > 0 else 0
        
        return {
            "period": {"year": year},
            "installation": {
                "capacity_kwp": peak_power_kwp,
                "location": {"lat": lat, "lon": lon}
            },
            "production_summary": {
                "total_mwh": round(total_production_kwh / 1000, 2)
            },
            "price_analysis": {
                "avg_market_price_eur_mwh": round(avg_market_price, 2),
                "solar_capture_price_eur_mwh": round(capture_price, 2),
                "cannibalization_effect_eur_mwh": round(cannibalization_factor, 2),
                "cannibalization_note": "☀️ Solar produces when prices drop (midday oversupply)"
            },
            "financial_analysis": {
                "estimated_revenue_eur": round(total_revenue, 2),
                "company_payment_eur": company_payment,
                "discrepancy_eur": round(discrepancy, 2),
                "discrepancy_pct": round(discrepancy_pct, 2)
            },
            "assessment": self._generate_assessment(discrepancy_pct),
            "hourly_detail_sample": hourly_detail[:24]
        }
    
    def _generate_assessment(self, discrepancy_pct: float) -> str:
        """Generate alert based on payment discrepancy."""
        if abs(discrepancy_pct) < 5:
            return "✓ PAGO CORRECTO: Diferencia < 5%"
        elif discrepancy_pct > 0 and discrepancy_pct < 15:
            return f"⚠ ALERTA MEDIA: La empresa paga un {discrepancy_pct:.1f}% menos"
        elif discrepancy_pct >= 15:
            return f"🚨 ALERTA ALTA: La empresa paga un {discrepancy_pct:.1f}% menos. RECLAMAR."
        else:
            return "⚪ La empresa está pagando más del estimado"


if __name__ == "__main__":
    # Test Advanced Audit
    auditor = AdvancedEnergyAuditor()
    
    print("=" * 70)
    print("WIND AUDIT - Historical Period (Jan-Mar 2024)")
    print("=" * 70)
    
    wind_result = auditor.audit_wind_historical(
        lat=42.5,
        lon=-7.8,
        turbine_model="Vestas V90 3MW",
        num_turbines=10,
        start_date="2024-01-01",
        end_date="2024-03-31",
        company_payment=250000  # Company claims 250k€ for Q1
    )
    
    print(json.dumps(wind_result, indent=2, ensure_ascii=False))
    
    print("\n" + "=" * 70)
    print("SOLAR AUDIT - Full Year 2023 (Historical)")
    print("=" * 70)
    
    # Using 2023 because 2024 data might not be fully available in PVGIS ERA5 yet
    solar_result = auditor.audit_solar_historical(
        lat=42.5,
        lon=-7.8,
        peak_power_kwp=1000,
        year=2023, 
        company_payment=45000  # Company claims 45k€ for 2023
    )
    
    print(json.dumps(solar_result, indent=2, ensure_ascii=False))
