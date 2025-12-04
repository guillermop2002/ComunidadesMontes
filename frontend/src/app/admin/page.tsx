'use client'

import { useState } from 'react'

export default function AdminDashboard() {
    const [stats] = useState({
        totalNeighbors: 60,
        activeNeighbors: 45,
        pendingCensus: 5,
        nextAssembly: '15/12/2024',
        totalFunds: 125000,
        reinvestmentCompliance: 42 // percentage
    })

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel de Control</h1>
                <p className="text-gray-600">Comunidade de Montes de Santa María</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <div className="text-sm text-gray-600 mb-1">Comuneros Totales</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.totalNeighbors}</div>
                    <div className="text-xs text-green-600 mt-2">↗ {stats.activeNeighbors} activos</div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                    <div className="text-sm text-gray-600 mb-1">Censo Pendiente</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.pendingCensus}</div>
                    <div className="text-xs text-gray-500 mt-2">Revisar expedientes</div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <div className="text-sm text-gray-600 mb-1">Fondos Totales</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.totalFunds.toLocaleString()}€</div>
                    <div className="text-xs text-gray-500 mt-2">Balance actualizado</div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                    <div className="text-sm text-gray-600 mb-1">Art. 125 Compliance</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.reinvestmentCompliance}%</div>
                    <div className="text-xs text-green-600 mt-2">✓ Cumplimiento OK</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
                    <div className="space-y-3">
                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition flex items-center justify-between">
                            <span>Convocar Asamblea</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition flex items-center justify-between">
                            <span>Importar Censo (Excel)</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </button>
                        <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition flex items-center justify-between">
                            <span>Generar Acta (IA)</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Próximas Tareas</h2>
                    <div className="space-y-3">
                        <div className="border-l-4 border-red-500 pl-4 py-2">
                            <div className="font-medium text-gray-800">Asamblea General</div>
                            <div className="text-sm text-gray-600">{stats.nextAssembly} - Centro Cultural</div>
                        </div>
                        <div className="border-l-4 border-yellow-500 pl-4 py-2">
                            <div className="font-medium text-gray-800">Renovar Seguro</div>
                            <div className="text-sm text-gray-600">Plazo: 31/12/2024</div>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-4 py-2">
                            <div className="font-medium text-gray-800">Actualizar Censo MR652D</div>
                            <div className="text-sm text-gray-600">Pendiente: 5 expedientes</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
