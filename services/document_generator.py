from fpdf import FPDF
from datetime import datetime
import os

class DocumentGenerator:
    def __init__(self):
        self.output_dir = os.path.join(os.path.dirname(__file__), "output_docs")
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_minutes_pdf(self, title: str, date: str, attendees: list, content: str) -> str:
        """
        Generates a formal PDF for meeting minutes (Acta).
        """
        pdf = FPDF()
        pdf.add_page()
        
        # Header
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, "ACTA DE ASAMBLEA GENERAL", ln=True, align="C")
        pdf.ln(10)
        
        # Metadata
        pdf.set_font("Arial", "", 12)
        pdf.cell(0, 10, f"Comunidad de Montes Vecinales en Mano Común", ln=True)
        pdf.cell(0, 10, f"Fecha: {date}", ln=True)
        pdf.cell(0, 10, f"Asunto: {title}", ln=True)
        pdf.ln(5)
        
        # Attendees
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, "Asistentes:", ln=True)
        pdf.set_font("Arial", "", 12)
        for attendee in attendees:
            pdf.cell(0, 8, f"- {attendee}", ln=True)
        pdf.ln(10)
        
        # Content (Body)
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, "Desarrollo de la Sesión:", ln=True)
        pdf.set_font("Arial", "", 12)
        pdf.multi_cell(0, 8, content)
        pdf.ln(20)
        
        # Signatures
        pdf.cell(0, 10, "_" * 30 + " " * 40 + "_" * 30, ln=True)
        pdf.cell(0, 10, "El Presidente" + " " * 55 + "El Secretario", ln=True)
        
        # Save
        filename = f"Acta_{date.replace('-', '')}_{datetime.now().strftime('%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        pdf.output(filepath)
        
        return filepath

    def generate_request_pdf(self, name: str, dni: str, request_text: str) -> str:
        """
        Generates a generic request PDF (Solicitud).
        """
        pdf = FPDF()
        pdf.add_page()
        
        # Header
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "SOLICITUD A LA JUNTA RECTORA", ln=True, align="C")
        pdf.ln(10)
        
        # User Info
        pdf.set_font("Arial", "", 12)
        pdf.cell(0, 10, f"D./Dña: {name}", ln=True)
        pdf.cell(0, 10, f"DNI: {dni}", ln=True)
        pdf.ln(10)
        
        # Request Body
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, "EXPONE / SOLICITA:", ln=True)
        pdf.set_font("Arial", "", 12)
        pdf.multi_cell(0, 8, request_text)
        pdf.ln(20)
        
        # Footer
        pdf.cell(0, 10, f"En _______________, a {datetime.now().strftime('%d/%m/%Y')}", ln=True)
        pdf.ln(15)
        pdf.cell(0, 10, "Firma:", ln=True)
        
        # Save
        filename = f"Solicitud_{dni}_{datetime.now().strftime('%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        pdf.output(filepath)
        
        return filepath

if __name__ == "__main__":
    # Test
    gen = DocumentGenerator()
    path = gen.generate_minutes_pdf(
        "Aprobación de Cuentas 2024",
        "2024-12-15",
        ["Juan Pérez (Presidente)", "María López (Secretaria)", "50 Comuneros más"],
        "Se abre la sesión a las 18:00. El Presidente expone las cuentas anuales con un saldo positivo de 250.000€. Tras el debate, se aprueban por unanimidad. Se levanta la sesión a las 19:30."
    )
    print(f"Generated: {path}")
