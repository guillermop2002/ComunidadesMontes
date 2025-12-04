'use client';

import { useState } from 'react';

export default function EnergyAuditPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [formData, setFormData] = useState({
        type: 'wind',
        lat: '42.5',
        lon: '-7.8',
        turbine_model: 'Vestas V90 3MW',
        num_turbines: '10',
        start_date: '2024-01-01',
        end_date: '2024-03-31',
        company_payment: '250000',
        peak_power_kwp: '1000', // For solar
        year: '2023' // For solar
    });

    // Removed auditMode state, defaulting to Deep Research behavior

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        // Always enforce deep_audit
        const action = 'deep_audit';

        try {
            const response = await fetch('/api/py-bridge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: action,
                    data: formData
                })
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error:', error);
            alert('Error running audit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">
                    Auditoría Energética
                    <span className="ml-3 text-sm font-medium bg-purple-100 text-purple-800 py-1 px-3 rounded-full border border-purple-200">
                        🔬 Deep Research
                    </span>
                </h1>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg text-sm text-purple-800">
                <strong>Modo Científico Activado:</strong> Se utilizan modelos físicos avanzados (Perez, Faiman, Hellman, Jensen) y datos horarios de alta fidelidad (ERA5, PVGIS SARAH). El cálculo puede tardar unos segundos.
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Configuración del Parque</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Energía</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="wind">Eólica (Viento)</option>
                                <option value="solar">Fotovoltaica (Sol)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.lat}
                                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.lon}
                                    onChange={(e) => setFormData({ ...formData, lon: e.target.value })}
                                />
                            </div>
                        </div>

                        {formData.type === 'wind' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo Turbina</label>
                                    <select
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.turbine_model}
                                        onChange={(e) => setFormData({ ...formData, turbine_model: e.target.value })}
                                    >
                                        <option value="Vestas V90 3MW">Vestas V90 3MW</option>
                                        <option value="Vestas V162 6MW">Vestas V162 6MW</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nº Aerogeneradores</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.num_turbines}
                                        onChange={(e) => setFormData({ ...formData, num_turbines: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded-lg"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded-lg"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Potencia Pico (kWp)</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.peak_power_kwp}
                                        onChange={(e) => setFormData({ ...formData, peak_power_kwp: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Año a Auditar</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pago Realizado por Empresa (€)</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded-lg bg-yellow-50"
                                value={formData.company_payment}
                                onChange={(e) => setFormData({ ...formData, company_payment: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Calculando...' : 'Ejecutar Auditoría Científica'}
                        </button>
                    </form>
                </div>

                {/* Results Display */}
                <div className="space-y-6">
                    {result && !result.error && (
                        <>
                            {/* Main Alert Card */}
                            <div className={`p-6 rounded-xl shadow-md border-l-8 ${(result.financial_analysis?.discrepancy_pct > 15 || (result.revenue_eur && result.revenue_eur > formData.company_payment * 1.15)) ? 'bg-red-50 border-red-500' :
                                    (result.financial_analysis?.discrepancy_pct > 5 || (result.revenue_eur && result.revenue_eur > formData.company_payment * 1.05)) ? 'bg-yellow-50 border-yellow-500' :
                                        'bg-green-50 border-green-500'
                                }`}>
                                <h3 className="text-lg font-bold mb-2">Resultado de la Auditoría</h3>
                                <p className="text-2xl font-bold mb-1">
                                    {result.assessment || (result.revenue_eur > formData.company_payment ? "🚨 ALERTA: Posible Infra-pago" : "✅ PAGO CORRECTO")}
                                </p>
                                <p className="text-gray-600">
                                    Diferencia detectada: <span className="font-bold">{(result.financial_analysis?.discrepancy_eur || (result.revenue_eur - formData.company_payment)).toLocaleString()} €</span>
                                </p>
                            </div>

                            {/* Detailed Stats */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold mb-4 text-gray-800">Detalle Financiero</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Producción Estimada</span>
                                        <span className="font-bold">{(result.production_summary?.total_mwh || result.production_mwh).toLocaleString()} MWh</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Precio Medio Mercado</span>
                                        <span className="font-bold">{(result.price_analysis?.avg_market_price_eur_mwh || result.avg_market_price)} €/MWh</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <span className="text-blue-800 font-medium">Valor Real Estimado</span>
                                        <span className="text-blue-800 font-bold text-xl">{(result.financial_analysis?.estimated_revenue_eur || result.revenue_eur).toLocaleString()} €</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                        <span className="text-yellow-800 font-medium">Pago Empresa</span>
                                        <span className="text-yellow-800 font-bold text-xl">{(result.financial_analysis?.company_payment_eur || formData.company_payment).toLocaleString()} €</span>
                                    </div>
                                    {result.cannibalization_factor && (
                                        <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                                            <span className="text-purple-800">Factor Canibalización</span>
                                            <span className="font-bold text-purple-800">{result.cannibalization_factor}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Hourly Data Preview */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold mb-4 text-gray-800">Muestra Horaria (Primeras 5h)</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="p-2 text-left">Hora</th>
                                                <th className="p-2 text-right">Prod (kWh)</th>
                                                <th className="p-2 text-right">Precio (€/MWh)</th>
                                                <th className="p-2 text-right">Ingreso (€)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(result.hourly_detail_sample || result.hourly_sample).slice(0, 5).map((row: any, i: number) => (
                                                <tr key={i} className="border-t">
                                                    <td className="p-2">{new Date(row.datetime || row.time).toLocaleTimeString()}</td>
                                                    <td className="p-2 text-right">{row.production_mwh ? (row.production_mwh * 1000).toFixed(1) : (row.production_kwh || row.prod_kwh)}</td>
                                                    <td className="p-2 text-right">{row.price_eur_mwh || row.price}</td>
                                                    <td className="p-2 text-right font-medium">{row.revenue_eur || row.rev}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
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
