import requests
import json

def search_ine_series():
    # Search for "IPC" in INE API
    url = "https://servicios.ine.es/wstempus/js/es/SERIES_OPERACION/25?page=1" 
    try:
        r = requests.get(url)
        data = r.json()
        print(f"Total series found: {len(data)}")
        for i, serie in enumerate(data):
            if i < 20: # Print first 20
                print(f"Name: {serie['Nombre']} - Code: {serie['COD']}")
    except Exception as e:
        print(f"Error: {e}")

search_ine_series()
