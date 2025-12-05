from services.canon_indexer import CanonIndexer
import json

try:
    print("Initializing CanonIndexer...")
    indexer = CanonIndexer()
    print("Calculating update...")
    result = indexer.calculate_update(1000, "2023-01-01", "2024-01-01")
    print("Result:")
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
