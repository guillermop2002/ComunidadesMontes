import requests
import xml.etree.ElementTree as ET

class CadastreLookup:
    def __init__(self):
        self.base_url = "http://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/Consulta_RCCOOR"

    def get_coordinates(self, rc):
        """
        Resolves a Cadastral Reference (RC) to WGS84 Coordinates (Lat, Lon).
        """
        try:
            # SRS=EPSG:4326 requests WGS84 coordinates directly
            url = f"{self.base_url}?SRS=EPSG:4326&RC={rc}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            # Parse XML response
            root = ET.fromstring(response.content)
            
            # Namespace handling might be needed, but usually OVC returns simple XML
            # Structure:
            # <consulta_coordenadas>
            #   <coordenadas>
            #     <coord>
            #       <pc>
            #         <x>LONGITUDE</x>
            #         <y>LATITUDE</y>
            #       </pc>
            #       <geo>
            #         <xcen>LONGITUDE</xcen>
            #         <ycen>LATITUDE</ycen>
            #       </geo>
            #       <ldt>ADDRESS</ldt>
            #     </coord>
            #   </coordenadas>
            # </consulta_coordenadas>

            # Check for errors
            err = root.find(".//lerr/err/des")
            if err is not None:
                return {"error": f"Catastro Error: {err.text}"}

            # Try to find coordinates
            # Note: In EPSG:4326, X is Longitude, Y is Latitude
            x_node = root.find(".//coordenadas/coord/geo/xcen")
            y_node = root.find(".//coordenadas/coord/geo/ycen")
            
            if x_node is None or y_node is None:
                # Fallback to 'pc' node if 'geo' is missing
                x_node = root.find(".//coordenadas/coord/pc/x")
                y_node = root.find(".//coordenadas/coord/pc/y")

            if x_node is not None and y_node is not None:
                return {
                    "lat": float(y_node.text),
                    "lon": float(x_node.text),
                    "source": "Sede Electrónica del Catastro"
                }
            else:
                return {"error": "Coordenadas no encontradas para esta referencia."}

        except Exception as e:
            return {"error": f"Error de conexión con Catastro: {str(e)}"}
