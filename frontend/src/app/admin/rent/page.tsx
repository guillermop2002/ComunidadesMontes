'use client';

import { useState } from 'react';

export default function CanonUpdatePage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [formData, setFormData] = useState({
        current_canon: '1000',
        old_date: '2023-01-01',
        new_date: '2024-01-01'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/py-bridge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'canon_update',
                    data: formData
                })
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error:', error);
            alert('Error calculating update');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">
                    Actualización de Canon (IPC)
                </h1>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800">
                <strong>Auditoría de Contratos:</strong> Calcula la actualización del canon de terrenos (eólicos/forestales) aplicando la variación del IPC real (INE).
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Datos del Contrato</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Canon Actual (€)</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded-lg"
                                value={formData.current_canon}
                                onChange={(e) => setFormData({ ...formData, current_canon: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Base / Última Actualización</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.old_date}
                                    onChange={(e) => setFormData({ ...formData, old_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Nueva Actualización</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.new_date}
                                    onChange={(e) => setFormData({ ...formData, new_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Consultando INE...' : 'Calcular Actualización'}
                        </button>
                    </form>

                    {/* Scan & Discard Placeholder */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <div className="mx-auto h-12 w-12 text-gray-400 mb-2">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900">Escanear Contrato (Scan & Discard)</h3>
                            <p className="text-xs text-gray-500 mt-1">Sube tu contrato para extraer las cláusulas de actualización automáticamente.</p>
                            <button disabled className="mt-3 px-4 py-2 bg-gray-200 text-gray-500 text-sm rounded cursor-not-allowed">
                                Próximamente
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Display */}
                <div className="space-y-6">
                    {result && !result.error && (
                        <>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold mb-4 text-gray-800">Resultado de la Actualización</h3>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500">Canon Anterior</p>
                                        <p className="text-2xl font-bold text-gray-700">{result.old_canon} €</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                        <p className="text-sm text-green-600 font-bold">Nuevo Canon</p>
                                        <p className="text-3xl font-bold text-green-800">{result.new_canon} €</p>
                                        <p className="text-xs text-green-600">+{result.variation_real}% variación IPC</p>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 space-y-1 border-t pt-4">
                                    <p><strong>Periodo Referencia:</strong> {result.reference_period.old} a {result.reference_period.new}</p>
                                    <p><strong>Índice Base:</strong> {result.indices.old}</p>
                                    <p><strong>Índice Nuevo:</strong> {result.indices.new}</p>
                                    <p><strong>Fuente:</strong> INE (Instituto Nacional de Estadística)</p>
                                </div>
                            </div>
                        </>
                    )}

                    {result && result.error && (
                        <div className="bg-red-100 text-red-800 p-4 rounded-lg border border-red-200">
                            <strong>Error:</strong> {result.error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
