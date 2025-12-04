'use client';

import { useState } from 'react';

export default function CensusPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [filePath, setFilePath] = useState('C:\\Users\\Guillermo\\Documents\\Herramienta comunidades\\services\\census_mock.xlsx');

    const handleImport = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/py-bridge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'import_census',
                    data: { file_path: filePath }
                })
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error:', error);
            alert('Error importing census');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Censo Digital (Casa Aberta)</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Import Tool */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Importar Excel</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Selecciona el archivo Excel con el censo actual para validarlo y migrarlo a la base de datos segura.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ruta del Archivo (Servidor)</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg bg-gray-50"
                                value={filePath}
                                onChange={(e) => setFilePath(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleImport}
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Procesando...' : 'Validar e Importar'}
                        </button>
                    </div>
                </div>

                {/* Results Display */}
                <div className="space-y-6">
                    {result && result.status === 'success' && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4 text-green-700">Importación Completada</h3>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 text-xs">Total</p>
                                    <p className="text-xl font-bold">{result.summary.total_rows}</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <p className="text-green-600 text-xs">Válidos</p>
                                    <p className="text-xl font-bold text-green-700">{result.summary.valid_rows}</p>
                                </div>
                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                    <p className="text-red-600 text-xs">Errores</p>
                                    <p className="text-xl font-bold text-red-700">{result.summary.invalid_rows}</p>
                                </div>
                            </div>

                            {result.summary.invalid_rows > 0 && (
                                <div>
                                    <h4 className="font-bold text-sm text-red-700 mb-2">Errores Detectados (Muestra)</h4>
                                    <div className="bg-red-50 p-3 rounded-lg text-xs space-y-2">
                                        {result.preview_invalid.map((err: any, i: number) => (
                                            <div key={i} className="border-b border-red-100 last:border-0 pb-1">
                                                <span className="font-bold">{err.Nombre} {err.Apellidos}:</span> {err.error_detail}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {result && result.error && (
                        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                            Error: {result.error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
