"use client";

import { useState, useEffect } from "react";
import { Building2, Users, LogOut, BarChart3, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        closed: 0,
        new: 0,
        contacted: 0,
        interested: 0,
        discarded: 0,
        bySource: [] as { source: string; count: number }[],
        byProduct: [] as { product: string; count: number }[]
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Get user
                const { data: { session } } = await supabase.auth.getSession();
                setUserEmail(session?.user?.email || '');

                // Get all leads for stats
                const { data: leads } = await supabase.from('leads').select('*');
                if (leads) {
                    const total = leads.length;
                    const closed = leads.filter(l => l.status === 'Cerrado').length;
                    const newCount = leads.filter(l => l.status === 'Nuevo').length;
                    const contacted = leads.filter(l => l.status === 'Contactado').length;
                    const interested = leads.filter(l => l.status === 'Interesado').length;
                    const discarded = leads.filter(l => l.status === 'Descartado').length;

                    // By source
                    const sourceMap: Record<string, number> = {};
                    leads.forEach(l => {
                        const s = l.source || 'Desconocido';
                        sourceMap[s] = (sourceMap[s] || 0) + 1;
                    });
                    const bySource = Object.entries(sourceMap).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);

                    // By product
                    const productMap: Record<string, number> = {};
                    leads.forEach(l => {
                        const p = l.product_interest || 'Sin especificar';
                        productMap[p] = (productMap[p] || 0) + 1;
                    });
                    const byProduct = Object.entries(productMap).map(([product, count]) => ({ product, count })).sort((a, b) => b.count - a.count);

                    setStats({ total, closed, new: newCount, contacted, interested, discarded, bySource, byProduct });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const conversionRate = stats.total > 0 ? ((stats.closed / stats.total) * 100).toFixed(1) : "0";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
                <p className="text-slate-500">Información de tu cuenta y estadísticas generales.</p>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-orange-600" />
                    <h2 className="font-bold text-slate-900">Cuenta</h2>
                </div>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-lg font-bold">
                            {userEmail ? userEmail[0].toUpperCase() : 'A'}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">Administrador</p>
                            <p className="text-sm text-slate-500">{userEmail || '...'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors border border-red-100"
                    >
                        <LogOut className="h-4 w-4" /> Cerrar Sesión
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
                    <p>Cargando estadísticas...</p>
                </div>
            ) : (
                <>
                    {/* General Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { label: 'Total', value: stats.total, color: 'text-slate-900' },
                            { label: 'Nuevos', value: stats.new, color: 'text-blue-600' },
                            { label: 'Contactados', value: stats.contacted, color: 'text-yellow-600' },
                            { label: 'Interesados', value: stats.interested, color: 'text-purple-600' },
                            { label: 'Cerrados', value: stats.closed, color: 'text-green-600' },
                            { label: 'Descartados', value: stats.discarded, color: 'text-slate-400' },
                        ].map(s => (
                            <div key={s.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Conversion Rate */}
                    <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="h-6 w-6" />
                            <h3 className="font-bold text-lg">Tasa de Conversión</h3>
                        </div>
                        <p className="text-4xl font-bold">{conversionRate}%</p>
                        <p className="text-orange-100 text-sm mt-1">{stats.closed} cerrados de {stats.total} leads totales</p>
                    </div>

                    {/* By Source & Product */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                <h2 className="font-bold text-slate-900">Por Origen</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {stats.bySource.map(item => (
                                    <div key={item.source}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-700">{item.source}</span>
                                            <span className="font-bold text-slate-900">{item.count}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                                                style={{ width: `${(item.count / stats.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                <h2 className="font-bold text-slate-900">Por Producto</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {stats.byProduct.map(item => (
                                    <div key={item.product}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-700">{item.product}</span>
                                            <span className="font-bold text-slate-900">{item.count}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                                                style={{ width: `${(item.count / stats.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
