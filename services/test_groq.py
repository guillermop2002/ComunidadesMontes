"""
Test Groq API Client
"""
from groq_client import GroqClient
from dotenv import load_dotenv

load_dotenv()

print("=" * 60)
print("TESTING GROQ API CLIENT")
print("=" * 60)

client = GroqClient()
print(f"\n✓ Loaded {len(client.api_keys)} API keys for rotation")

# Test 1: Generate Minutes
print("\n[TEST 1] Generating Assembly Minutes (Acta)")
print("-" * 60)

raw_notes = """Reunión 15 octubre 2024, centro cultural. 
Asisten 40 vecinos de 60 totales. 
Tema 1: Propuesta eólica. La empresa ofrece 3000 euros por MW al año. 
Pepe dice que es poco, María propone pedir 5000. 
Se vota la contraoferta: 35 a favor, 5 en contra. 
Tema 2: Arreglar pistas forestales. Presupuesto 5000€ para desbroce. 
Aprobado por unanimidad."""

result = client.generate_minutes(raw_notes, language="gallego")

if result["success"]:
    print("\n✓ SUCCESS - Minutes Generated:")
    print("-" * 60)
    print(result["content"][:500] + "...")  # Print first 500 chars
else:
    print(f"\n✗ ERROR: {result['error']}")

# Test 2: Analyze Notification
print("\n\n[TEST 2] Analyzing Legal Notification")
print("-" * 60)

notification = """NOTIFICACIÓN XUNTA DE GALICIA
Expediente: MR-2024-12345
Se requiere a la Comunidad de Montes de Santa María a subsanar la documentación 
del Libro de Registro de Comuneros (modelo MR652D) presentando los siguientes documentos:
- Acta de la última asamblea
- Certificado bancario actualizado

PLAZO: 10 días hábiles desde la recepción de esta notificación.
Fecha de notificación: 01/12/2024

La falta de subsanación implicará el archivo del expediente."""

result2 = client.analyze_notification(notification)

if result2["success"]:
    print("\n✓ SUCCESS - Notification Analysis:")
    print("-" * 60)
    print(result2["content"])
else:
    print(f"\n✗ ERROR: {result2['error']}")

print("\n" + "=" * 60)
print("TESTS COMPLETED")
print("=" * 60)
