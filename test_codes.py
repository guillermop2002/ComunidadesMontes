import requests
import json

def test_code(code):
    url = f"https://servicios.ine.es/wstempus/js/es/DATOS_SERIE/{code}?tip=AM"
    print(f"Testing {url}")
    try:
        r = requests.get(url)
        if r.status_code == 200:
            print("SUCCESS!")
            data = r.json()
            print(data.keys())
        else:
            print(f"Failed: {r.status_code}")
    except Exception as e:
        print(f"Error: {e}")

# Try common codes
test_code("IPC206449")
test_code("IPC251852")
test_code("IPC31156") # Another common one
