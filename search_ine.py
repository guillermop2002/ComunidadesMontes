import requests
import json

def search_ine_series():
    # Search for "Índice General" in INE API
    url = "https://servicios.ine.es/wstempus/js/es/SERIES_OPERACION/25?page=1" # 25 is IPC operation ID usually
    try:
        r = requests.get(url)
        data = r.json()
        for serie in data:
            if "General" in serie["Nombre"] and "Nacional" in serie["Nombre"]:
                print(f"Found: {serie['Nombre']} - Code: {serie['COD']}")
    except Exception as e:
        print(f"Error: {e}")

search_ine_series()
