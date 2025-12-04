import pandas as pd
from spanish_dni import validate
from supabase import create_client, Client
import os
import json

# Placeholder for Supabase Credentials (to be loaded from .env)
url: str = os.environ.get("SUPABASE_URL", "https://your-project.supabase.co")
key: str = os.environ.get("SUPABASE_KEY", "your-anon-key")
supabase: Client = create_client(url, key)

def normalize_address(raw_address):
    """
    Uses libpostal (or simple heuristic if libpostal not installed) to normalize address.
    """
    try:
        from postal.parser import parse_address
        parsed = parse_address(raw_address)
        # Convert list of tuples to dict
        return {k: v for v, k in parsed}
    except ImportError:
        # Fallback if libpostal is not available in this environment
        return {"raw": raw_address}

def validate_dni(dni):
    """
    Validates DNI using spanish-dni library.
    """
    try:
        return validate(dni)
    except Exception:
        return False

def import_census(file_path):
    print(f"Reading file: {file_path}")
    try:
        df = pd.read_excel(file_path)
    except Exception as e:
        return {"error": f"Failed to read Excel: {str(e)}"}

    valid_records = []
    invalid_records = []

    # Expected columns: Name, DNI, Address, Phone
    # Normalize columns to lowercase
    df.columns = [c.lower().strip() for c in df.columns]

    for index, row in df.iterrows():
        dni = str(row.get('dni', '')).strip().upper()
        name = str(row.get('name', '')).strip()
        address = str(row.get('address', '')).strip()
        phone = str(row.get('phone', '')).strip()

        is_valid_dni = validate_dni(dni)
        
        record = {
            "dni": dni,
            "name": name,
            "address": address,
            "phone": phone,
            "row_index": index + 2 # Excel row number
        }

        if is_valid_dni and name and address:
            # Normalize address
            norm_addr = normalize_address(address)
            record['normalized_address'] = norm_addr
            valid_records.append(record)
        else:
            reason = []
            if not is_valid_dni: reason.append("Invalid DNI")
            if not name: reason.append("Missing Name")
            if not address: reason.append("Missing Address")
            record['error'] = ", ".join(reason)
            invalid_records.append(record)

    # Bulk Insert Valid Records to Supabase
    if valid_records:
        print(f"Inserting {len(valid_records)} valid records...")
        # Map to DB schema
        db_rows = []
        for r in valid_records:
            db_rows.append({
                "dni": r['dni'],
                "name": r['name'],
                "phone_number": r['phone'],
                "role": "neighbor" # Default role
                # Note: House linking logic would go here in a full implementation
            })
        
        try:
            data, count = supabase.table('people').upsert(db_rows, on_conflict='dni').execute()
            print("Insert successful.")
        except Exception as e:
            print(f"Supabase Error: {str(e)}")
            return {"status": "partial_error", "details": str(e)}

    return {
        "status": "success",
        "processed": len(df),
        "valid": len(valid_records),
        "invalid": len(invalid_records),
        "invalid_details": invalid_records
    }

if __name__ == "__main__":
    # Example usage
    # result = import_census("census_data.xlsx")
    # print(json.dumps(result, indent=2))
    print("Census Import Script Ready.")
