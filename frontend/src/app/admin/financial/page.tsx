'use client';

import { useState, useEffect } from 'react';

export default function FinancialHealthPage() {
    const [incomes, setIncomes] = useState([
        { id: 1, source: 'Parque Eólico (Canon Fijo)', amount: 250000, date: '2024-01-15' },
        { id: 2, source: 'Venta Madera (Eucalipto)', amount: 45000, date: '2024-02-10' },
    ]);

    const [expenses, setExpenses] = useState([
        { id: 1, concept: 'Desbroces Preventivos', amount: 15000, type: 'reinvestment' },
        { id: 2, concept: 'Reparación Pistas', amount: 8000, type: 'reinvestment' },
        { id: 3, concept: 'Fiesta Patronal', amount: 5000, type: 'social' },
        { id: 4, concept: 'Abogado (Pleito Lindes)', amount: 2500, type: 'reinvestment' },
    ]);

    const [newExpense, setNewExpense] = useState({ concept: '', amount: '', type: 'reinvestment' });

    const totalIncome = incomes.reduce((acc, item) => acc + item.amount, 0);
    const totalReinvestment = expenses.filter(e => e.type === 'reinvestment').reduce((acc, item) => acc + item.amount, 0);
    const totalSocial = expenses.filter(e => e.type === 'social').reduce((acc, item) => acc + item.amount, 0);

    const reinvestmentPct = (totalReinvestment / totalIncome) * 100;
    const requiredReinvestment = totalIncome * 0.40;
    const deficit = requiredReinvestment - totalReinvestment;

    const addExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExpense.concept || !newExpense.amount) return;

        setExpenses([
            ...expenses,
            {
                id: Date.now(),
                concept: newExpense.concept,
                amount: parseFloat(newExpense.amount),
                type: newExpense.type
            }
        ]);
        setNewExpense({ concept: '', amount: '', type: 'reinvestment' });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Salud Financiera (Art. 125)</h1>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Ingresos Totales 2024</p>
                    <p className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString()} €</p>
                </div>
            </div>

            {/* Main Visualizer Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-6 text-gray-700">Cumplimiento Fondo de Mejoras (40%)</h2>

                {/* Progress Bar */}
                <div className="relative h-12 bg-gray-100 rounded-full overflow-hidden mb-4">
                    {/* 40% Marker Line */}
                    <div className="absolute top-0 bottom-0 left-[40%] w-1 bg-gray-400 z-10 border-r border-dashed border-gray-600"></div>
                    <div className="absolute top-2 left-[40%] -ml-3 text-xs font-bold text-gray-500">OBJETIVO 40%</div>

                    {/* Actual Progress */}
                    <div
                        className={`h-full transition-all duration-1000 flex items-center justify-end pr-4 text-white font-bold ${reinvestmentPct >= 40 ? 'bg-green-500' : 'bg-orange-500'
                            }`}
                        style={{ width: `${Math.min(reinvestmentPct, 100)}%` }}
                    >
                        {reinvestmentPct.toFixed(1)}%
                    </div>
                </div>

                {/* Status Text */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-600">Reinversión Actual</p>
                        <p className="text-2xl font-bold text-gray-800">{totalReinvestment.toLocaleString()} €</p>
                    </div>

                    <div className="text-right">
                        {reinvestmentPct >= 40 ? (
                            <div className="text-green-600">
                                <p className="font-bold text-lg">✅ CUMPLIMIENTO OK</p>
                                <p className="text-sm">Superado el mínimo legal.</p>
                            </div>
                        ) : (
                            <div className="text-orange-600">
                                <p className="font-bold text-lg">⚠ DÉFICIT DE REINVERSIÓN</p>
                                <p className="text-sm">Faltan <span className="font-bold">{deficit.toLocaleString()} €</span> para cumplir.</p>
                                <p className="text-xs mt-1">No se pueden repartir dividendos.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Expense Input */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Registrar Gasto</h3>
                    <form onSubmit={addExpense} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Concepto</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                placeholder="Ej. Desbroce Monte Vecinal"
                                value={newExpense.concept}
                                onChange={(e) => setNewExpense({ ...newExpense, concept: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Importe (€)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-lg"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={newExpense.type}
                                    onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
                                >
                                    <option value="reinvestment">🌲 Reinversión (Mejora)</option>
                                    <option value="social">🎉 Gasto Social / Reparto</option>
                                    <option value="admin">📁 Administrativo</option>
                                </select>
                            </div>
                        </div>
                        <button className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700">
                            Añadir Gasto
                        </button>
                    </form>
                </div>

                {/* Expense List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Últimos Movimientos</h3>
                    <div className="space-y-3">
                        {expenses.map((expense) => (
                            <div key={expense.id} className="flex justify-between items-center p-3 border-b last:border-0">
                                <div>
                                    <p className="font-medium text-gray-800">{expense.concept}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${expense.type === 'reinvestment' ? 'bg-green-100 text-green-800' :
                                            expense.type === 'social' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {expense.type === 'reinvestment' ? 'Reinversión' : expense.type === 'social' ? 'Social' : 'Admin'}
                                    </span>
                                </div>
                                <span className="font-bold text-gray-700">-{expense.amount.toLocaleString()} €</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
