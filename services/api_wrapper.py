import sys
import json
import os

# Lazy imports are used inside functions to prevent "ModuleNotFoundError"
# from crashing the entire script if one dependency is missing.

def handle_energy_audit(data):
    from energy_audit_advanced import AdvancedEnergyAuditor
    # ESIOS Token should ideally come from env vars
    token = os.environ.get("ESIOS_TOKEN", None) 
    auditor = AdvancedEnergyAuditor(esios_token=token)
    
    if data.get("type") == "wind":
        return auditor.audit_wind_park(
            lat=float(data["lat"]),
            lon=float(data["lon"]),
            turbine_model=data["turbine_model"],
            num_turbines=int(data["num_turbines"]),
            start_date=data["start_date"],
            end_date=data["end_date"],
            company_payment=float(data["company_payment"])
        )
    else:
        return auditor.audit_solar_park(
            lat=float(data["lat"]),
            lon=float(data["lon"]),
            peak_power_kwp=float(data["peak_power_kwp"]),
            year=int(data["year"]),
            company_payment=float(data["company_payment"])
        )

def handle_census_import(data):
    # This module has heavy dependencies (spanish-dni, pandas, supabase)
    # that might not be installed in all environments.
    try:
        from import_census import import_census as run_import
    except ImportError as e:
        return {"error": f"Census module missing dependencies: {str(e)}"}

    file_path = data.get("file_path")
    if not file_path:
        return {"error": "Missing file_path"}
    
    return run_import(file_path)

def handle_document_generation(data):
    from document_generator import DocumentGenerator
    generator = DocumentGenerator()
    doc_type = data.get("type")
    
    try:
        if doc_type == "minutes":
            path = generator.generate_minutes_pdf(
                title=data["title"],
                date=data["date"],
                attendees=data["attendees"], 
                content=data["content"]
            )
        elif doc_type == "request":
            path = generator.generate_request_pdf(
                name=data["name"],
                dni=data["dni"],
                request_text=data["request_text"]
            )
        else:
            return {"error": "Invalid document type"}
            
        return {"status": "success", "file_path": path, "download_url": f"/api/download?path={path}"}
        
    except Exception as e:
        return {"error": f"Generation failed: {str(e)}"}

def handle_deep_audit(data):
    from energy_audit_deep_research import DeepResearchAuditor
    auditor = DeepResearchAuditor()
    return auditor.run_audit(data)

def main():
    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            return

        request = json.loads(input_data)
        action = request.get("action")
        data = request.get("data")

        result = {}
        
        if action == "energy_audit":
            result = handle_energy_audit(data)
        elif action == "import_census":
            result = handle_census_import(data)
        elif action == "generate_document":
            result = handle_document_generation(data)
        elif action == "deep_audit":
            result = handle_deep_audit(data)
        else:
            result = {"error": f"Unknown action: {action}"}

        # Print result to stdout
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
