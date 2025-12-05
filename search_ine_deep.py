import requests
import json

def search_ine_tables():
    # Get tables for IPC (Operation 25)
    url = "https://servicios.ine.es/wstempus/js/es/TABLAS_OPERACION/25"
    try:
        r = requests.get(url)
        data = r.json()
        print(f"Tables found: {len(data)}")
        for table in data:
            if "General" in table["Nombre"] and "Nacional" in table["Nombre"]:
                print(f"Table: {table['Nombre']} - ID: {table['Id']}")
                # Get series for this table
                url_series = f"https://servicios.ine.es/wstempus/js/es/SERIES_TABLA/{table['Id']}"
                r_series = requests.get(url_series)
                series_data = r_series.json()
                for s in series_data:
                     if "General" in s["Nombre"] and "Índice" in s["Nombre"] and "variación" not in s["Nombre"]:
                        print(f"  -> Series: {s['Nombre']} - Code: {s['COD']}")
    except Exception as e:
        print(f"Error: {e}")

search_ine_tables()
