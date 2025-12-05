'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Definición de tipos basada en tu schema.sql
type Person = {
    id: string;
    dni: string;
    name: string;
    phone_number: string | null;
    role: string;
    residency_years: number;
};

export default function CensusPage() {
    // Estados para la importación
    const [importLoading, setImportLoading] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);
    const [filePath, setFilePath] = useState('C:\\Ruta\\al\\archivo\\censo.xlsx');

    // Estados para la gestión de datos
    const [people, setPeople] = useState<Person[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Person>>({});

    // 1. Cargar datos al iniciar
    useEffect(() => {
        fetchCensus();
    }, []);

    const fetchCensus = async () => {
        setLoadingData(true);
        const { data, error } = await supabase
            .from('people')
            .select('*')
            .order('name');

        if (error) console.error('Error cargando censo:', error);
        else setPeople(data || []);
        setLoadingData(false);
    };

    // 2. Lógica de Importación (Python Bridge)
    const handleImport = async () => {
        setImportLoading(true);
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
            setImportResult(data);
            if (data.status === 'success') {
                fetchCensus(); // Recargar la tabla si salió bien
            }
        } catch (error) {
            alert('Error importando censo');
        } finally {
            setImportLoading(false);
        }
    };

    // 3. Lógica de Edición
    const startEditing = (person: Person) => {
        setEditingId(person.id);
        setEditForm(person);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveChanges = async () => {
        if (!editingId) return;

        const { error } = await supabase
            .from('people')
            .update({
                name: editForm.name,
                dni: editForm.dni,
                phone_number: editForm.phone_number,
                residency_years: editForm.residency_years
            })
            .eq('id', editingId);

        if (error) {
            alert('Error al guardar: ' + error.message);
        } else {
            setEditingId(null);
            fetchCensus(); // Refrescar datos
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Censo Digital (Casa Aberta)</h1>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {people.length} Comuneros Registrados
                </span>
            </div>

            {/* SECCIÓN 1: HERRAMIENTA DE IMPORTACIÓN */}
            <details className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 group">
                <summary className="text-xl font-semibold text-gray-700 cursor-pointer list-none flex justify-between items-center">
                    <span>📥 Importar Excel Masivo</span>
                    <span className="text-sm text-gray-500 group-open:rotate-180 transition">▼</span>
                </summary>

                <div className="mt-4 space-y-4 border-t pt-4">
                    <p className="text-sm text-gray-500">
                        Ruta local del archivo Excel (Servidor):
                    </p>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            className="flex-1 p-2 border rounded-lg bg-gray-50"
                            value={filePath}
                            onChange={(e) => setFilePath(e.target.value)}
                        />
                        <button
                            onClick={handleImport}
                            disabled={importLoading}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {importLoading ? 'Procesando...' : 'Importar'}
                        </button>
                    </div>
                    {importResult && (
                        <div className={`p-4 rounded-lg text-sm ${importResult.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {JSON.stringify(importResult.summary || importResult)}
                        </div>
                    )}
                </div>
            </details>

            {/* SECCIÓN 2: TABLA DE DATOS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono (Auth)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Antigüedad</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loadingData ? (
                                <tr><td colSpan={5} className="text-center py-8">Cargando datos...</td></tr>
                            ) : people.map((person) => (
                                <tr key={person.id} className="hover:bg-gray-50 transition">
                                    {editingId === person.id ? (
                                        // MODO EDICIÓN
                                        <>
                                            <td className="px-6 py-4">
                                                <input
                                                    className="w-full border p-1 rounded"
                                                    value={editForm.name}
                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    className="w-full border p-1 rounded uppercase"
                                                    value={editForm.dni}
                                                    onChange={e => setEditForm({ ...editForm, dni: e.target.value })}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    className="w-full border p-1 rounded bg-yellow-50 border-yellow-300"
                                                    value={editForm.phone_number || ''}
                                                    placeholder="+34 600..."
                                                    onChange={e => setEditForm({ ...editForm, phone_number: e.target.value })}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    className="w-20 border p-1 rounded"
                                                    value={editForm.residency_years}
                                                    onChange={e => setEditForm({ ...editForm, residency_years: parseInt(e.target.value) })}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button onClick={saveChanges} className="text-green-600 font-bold hover:underline">Guardar</button>
                                                <button onClick={cancelEditing} className="text-gray-500 hover:underline">Cancelar</button>
                                            </td>
                                        </>
                                    ) : (
                                        // MODO LECTURA
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{person.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{person.dni}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {person.phone_number ? (
                                                    <span className="text-gray-700">{person.phone_number}</span>
                                                ) : (
                                                    <span className="text-red-400 text-xs italic">Sin teléfono</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{person.residency_years} años</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => startEditing(person)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Editar
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
