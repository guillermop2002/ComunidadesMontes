import requests
import json

def search_ine_series_by_table():
    # Table 50904 was found earlier. Let's check it.
    # Or Table 251852 if it exists as a table ID.
    
    # Let's try to get series for operation 25 again, but print ALL names to find the pattern.
    url = "https://servicios.ine.es/wstempus/js/es/SERIES_OPERACION/25?page=1"
    try:
        r = requests.get(url)
        data = r.json()
        print(f"Total series: {len(data)}")
        for i, s in enumerate(data):
            if "General" in s["Nombre"] and "Nacional" in s["Nombre"]:
                print(f"MATCH: {s['Nombre']} - Code: {s['COD']}")
                if i > 100: break # Stop after finding some matches
    except Exception as e:
        print(f"Error: {e}")

search_ine_series_by_table()
