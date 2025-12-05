from services.ipc_rent_update import IPCRentUpdater
import json

try:
    updater = IPCRentUpdater()
    result = updater.calculate_update(1000, "2023-01-01", "2024-01-01")
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f"Error: {e}")
