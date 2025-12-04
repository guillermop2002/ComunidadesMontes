import os
import requests
import json
from typing import List, Optional
import time

class GroqClient:
    """
    Groq API Client with automatic key rotation to handle rate limits.
    """
    
    def __init__(self):
        # Load all API keys from environment
        self.api_keys = self._load_api_keys()
        self.current_key_index = 0
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        
        if not self.api_keys:
            raise ValueError("No Groq API keys found in environment!")
    
    def _load_api_keys(self) -> List[str]:
        """Load all Groq API keys from environment variables."""
        keys = []
        # Load primary keys
        for i in range(1, 5):
            key = os.getenv(f"GROQ_API_KEY_{i}")
            if key:
                keys.append(key)
        
        # Load historical keys
        for i in range(1, 5):
            key = os.getenv(f"GROQ_API_KEY_HISTORICAL_{i}")
            if key:
                keys.append(key)
        
        return keys
    
    def _get_next_key(self) -> str:
        """Get the next API key in rotation."""
        key = self.api_keys[self.current_key_index]
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        return key
    
    def generate_minutes(self, raw_notes: str, language: str = "gallego") -> dict:
        """
        Generate formal Assembly Minutes from raw notes.
        
        Args:
            raw_notes: Informal notes from the assembly
            language: "gallego" or "castellano"
        
        Returns:
            dict with 'success', 'content', and 'error' keys
        """
        system_prompt = """Actúa como un Secretario Jurídico experto en Derecho Civil de Galicia y Ley de Montes 7/2012.
Tu tarea es redactar un Acta de Asamblea General formal basada en las notas en bruto proporcionadas.

REGLAS IMPERATIVAS:
1. Estructura: Encabezado (Lugar, Fecha, Hora, Convocatoria), Asistentes (Cuórum), Orden del Día, Deliberaciones, Acuerdos Adoptados, Cierre.
2. Tono: Formal, objetivo, jurídico y neutro.
3. Referencias Legales: Si se menciona venta de madera o reparto de beneficios, debes citar explícitamente el cumplimiento del Artículo 125 de la Ley de Montes sobre reinversiones mínimas (40%).
4. Idioma: Gallego normativo.
5. No inventes datos. Si falta información, indica "...".
"""
        
        if language.lower() == "castellano":
            system_prompt = system_prompt.replace("Gallego normativo", "Castellano")
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": raw_notes}
        ]
        
        return self._call_api(messages, max_retries=3)
    
    def analyze_notification(self, notification_text: str) -> dict:
        """
        Analyze a legal notification and extract key information.
        
        Returns:
            dict with summary, deadline, action required, and risk level
        """
        system_prompt = """Analiza el siguiente texto jurídico proveniente de una notificación administrativa.

Devuelve un JSON con:
- "resumen": Una frase simple: ¿Qué nos piden?
- "plazo_fatal": Fecha límite exacta (formato DD/MM/YYYY) o "No especificado"
- "accion_requerida": Pagar, presentar alegaciones, subsanar errores, etc.
- "nivel_riesgo": BAJO, MEDIO, ALTO
"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": notification_text}
        ]
        
        return self._call_api(messages, max_retries=3)
    
    def _call_api(self, messages: List[dict], max_retries: int = 3) -> dict:
        """
        Call Groq API with automatic key rotation on rate limit errors.
        """
        attempts = 0
        keys_tried = 0
        
        while attempts < max_retries and keys_tried < len(self.api_keys):
            api_key = self._get_next_key()
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "llama-3.3-70b-versatile",  # Updated to active model
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 2048
            }
            
            try:
                response = requests.post(self.base_url, headers=headers, json=payload, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "content": data["choices"][0]["message"]["content"],
                        "error": None
                    }
                elif response.status_code == 429:
                    # Rate limit hit, rotate to next key
                    print(f"Rate limit hit on key #{self.current_key_index}. Rotating...")
                    keys_tried += 1
                    time.sleep(1)  # Brief pause before retry
                    continue
                else:
                    return {
                        "success": False,
                        "content": None,
                        "error": f"API Error {response.status_code}: {response.text}"
                    }
            
            except Exception as e:
                attempts += 1
                if attempts >= max_retries:
                    return {
                        "success": False,
                        "content": None,
                        "error": f"Exception after {max_retries} attempts: {str(e)}"
                    }
                time.sleep(2)
        
        return {
            "success": False,
            "content": None,
            "error": f"All {len(self.api_keys)} API keys exhausted or max retries reached."
        }

if __name__ == "__main__":
    # Example usage
    from dotenv import load_dotenv
    load_dotenv()
    
    client = GroqClient()
    print(f"Loaded {len(client.api_keys)} API keys.")
    
    # Test with a simple prompt
    raw_notes = """Reunión 15 octubre 2024, centro cultural. 
    Asisten 40 vecinos. 
    Tema 1: Eólica. La empresa ofrece 1000 euros por MW. Pepe dice que es poco. 
    Se vota: 35 a favor, 5 en contra. 
    Tema 2: Arreglar pistas. Presupuesto 5000€. Aprobado por unanimidad."""
    
    result = client.generate_minutes(raw_notes)
    
    if result["success"]:
        print("\n=== ACTA GENERADA ===")
        print(result["content"])
    else:
        print(f"Error: {result['error']}")
