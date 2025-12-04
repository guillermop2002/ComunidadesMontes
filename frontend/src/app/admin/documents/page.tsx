'use client';

import { useState } from 'react';

export default function DocumentsPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [docType, setDocType] = useState('minutes');

    // Form States
    const [minutesData, setMinutesData] = useState({
        title: 'Acta Asamblea General Ordinaria',
        date: new Date().toISOString().split('T')[0],
        attendees: 'Juan Pérez, María López, Pedro Rodríguez',
        content: 'Se abre la sesión a las 18:00. Se aprueban las cuentas anuales por unanimidad. Se levanta la sesión a las 19:30.'
    });

    const [requestData, setRequestData] = useState({
        name: 'Juan Pérez',
        dni: '12345678Z',
        request_text: 'Solicito permiso para la limpieza de la finca catastral 34567, colindante con el monte vecinal.'
    });

    const handleGenerate = async () => {
        setLoading(true);
        setResult(null);

        const payload = docType === 'minutes' ? {
            type: 'minutes',
            title: minutesData.title,
            date: minutesData.date,
            attendees: minutesData.attendees.split(',').map(s => s.trim()),
            content: minutesData.content
        } : {
            type: 'request',
            name: requestData.name,
            dni: requestData.dni,
            request_text: requestData.request_text
        };

        try {
            const response = await fetch('/api/py-bridge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_document',
                    data: payload
                })
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating document');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Generador de Documentos</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Generator Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex space-x-4 mb-6">
                        <button
                            onClick={() => setDocType('minutes')}
                            className={`flex-1 py-2 rounded-lg font-medium transition ${docType === 'minutes' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                            📜 Acta de Asamblea
                        </button>
                        <button
                            onClick={() => setDocType('request')}
                            className={`flex-1 py-2 rounded-lg font-medium transition ${docType === 'request' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                            📝 Solicitud Genérica
                        </button>
                    </div>

                    <div className="space-y-4">
                        {docType === 'minutes' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título / Asunto</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-lg"
                                        value={minutesData.title}
                                        onChange={(e) => setMinutesData({ ...minutesData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded-lg"
                                        value={minutesData.date}
                                        onChange={(e) => setMinutesData({ ...minutesData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Asistentes (separados por coma)</label>
                                    <textarea
                                        className="w-full p-2 border rounded-lg h-20"
                                        value={minutesData.attendees}
                                        onChange={(e) => setMinutesData({ ...minutesData, attendees: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contenido del Acta</label>
                                    <textarea
                                        className="w-full p-2 border rounded-lg h-40"
                                        value={minutesData.content}
                                        onChange={(e) => setMinutesData({ ...minutesData, content: e.target.value })}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Solicitante</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-lg"
                                        value={requestData.name}
                                        onChange={(e) => setRequestData({ ...requestData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI / NIF</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-lg"
                                        value={requestData.dni}
                                        onChange={(e) => setRequestData({ ...requestData, dni: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto de la Solicitud</label>
                                    <textarea
                                        className="w-full p-2 border rounded-lg h-40"
                                        value={requestData.request_text}
                                        onChange={(e) => setRequestData({ ...requestData, request_text: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Generando PDF...' : '📄 Generar Documento'}
                        </button>
                    </div>
                </div>

                {/* Results Display */}
                <div className="space-y-6">
                    {result && result.status === 'success' && (
                        <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-200 text-center">
                            <div className="text-5xl mb-4">✅</div>
                            <h3 className="text-xl font-bold text-green-800 mb-2">Documento Generado</h3>
                            <p className="text-green-700 mb-6">El archivo PDF ha sido creado correctamente en el servidor.</p>

                            <div className="bg-white p-4 rounded-lg border border-green-100 text-left text-sm text-gray-600 break-all">
                                <span className="font-bold">Ruta Local:</span> {result.file_path}
                            </div>

                            <p className="mt-4 text-xs text-gray-500">
                                (En producción, aquí aparecería un botón de descarga directa)
                            </p>
                        </div>
                    )}

                    {result && result.error && (
                        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                            Error: {result.error}
                        </div>
                    )}

                    {/* Info Card */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="font-bold text-blue-800 mb-2">ℹ️ Flujo de Trabajo</h3>
                        <ul className="list-disc list-inside text-sm text-blue-700 space-y-2">
                            <li>Este generador crea PDFs válidos para la administración.</li>
                            <li>El documento se guarda en la carpeta <code>services/output_docs</code>.</li>
                            <li>El usuario debe descargar el PDF, firmarlo digitalmente (AutoFirma) y subirlo a la Sede Electrónica.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
