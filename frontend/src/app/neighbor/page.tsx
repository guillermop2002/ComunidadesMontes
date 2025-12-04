export default function NeighborHomePage() {
    return (
        <div className="pb-20">
            {/* Welcome Header */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Benvido/a</h2>
                <p className="text-gray-600">Comunidade de Montes de Santa María</p>
            </div>

            {/* Big Action Cards */}
            <div className="space-y-4 mb-6">
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg active:scale-95 transition">
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <div className="text-sm opacity-90 mb-1">Próxima Asamblea</div>
                            <div className="text-2xl font-bold">15 Decembro</div>
                            <div className="text-sm opacity-75">Centro Cultural - 18:00h</div>
                        </div>
                        <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </button>

                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg active:scale-95 transition">
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <div className="text-sm opacity-90 mb-1">Os Teus Dividendos</div>
                            <div className="text-3xl font-bold">300€</div>
                            <div className="text-sm opacity-75">Pendente de cobro</div>
                        </div>
                        <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </button>
            </div>

            {/* Notices Section */}
            <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Últimos Avisos</h3>
                <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="font-medium text-gray-800">Limpieza de pistas forestales</div>
                        <div className="text-sm text-gray-600">Sábado 20 de decembro - Voluntarios</div>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-4 py-2">
                        <div className="font-medium text-gray-800">Renovación del seguro</div>
                        <div className="text-sm text-gray-600">Plazo hasta el 31 de decembro</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
