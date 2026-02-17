"use client";

import { useState, useEffect } from "react";
import {
    Building2, Users, LogOut, BarChart3, Loader2, TrendingUp,
    MessageSquare, Copy, Code, Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState("");
    const [copied, setCopied] = useState(false);
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
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
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
                                {stats.bySource.length > 0 ? stats.bySource.map(item => (
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
                                )) : <p className="text-sm text-slate-400 text-center py-4">No hay datos suficientes</p>}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                <h2 className="font-bold text-slate-900">Por Producto</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {stats.byProduct.length > 0 ? stats.byProduct.map(item => (
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
                                )) : <p className="text-sm text-slate-400 text-center py-4">No hay datos suficientes</p>}
                            </div>
                        </div>
                    </div>

                    {/* Chat Widget Section */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-orange-600" />
                                <h2 className="font-bold text-slate-900">Widget de Captura (Chat)</h2>
                            </div>
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Activo</span>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Code className="h-4 w-4" /> Código de Inserción
                                    </h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Copia y pega este código en cualquier sitio web para empezar a capturar leads con la interfaz de chat de <span className="text-orange-600 font-bold underline">Empanadas CRM</span>.
                                    </p>
                                    <div className="relative group">
                                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                            <pre className="text-slate-300 text-[11px] overflow-x-auto font-mono leading-relaxed">
                                                {`<iframe 
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget/chat" 
  width="100%" 
  height="500px" 
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
></iframe>`}
                                            </pre>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const code = `<iframe src="${window.location.origin}/widget/chat" width="100%" height="500px" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`;
                                                navigator.clipboard.writeText(code);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-all border border-slate-700"
                                        >
                                            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100 uppercase tracking-tight">
                                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                        Ideal para: Landings, Secciones de contacto y Blogs.
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-700">Previsualización Interactiva</h3>
                                    <div className="border border-slate-200 rounded-xl overflow-hidden h-[340px] shadow-inner bg-slate-100 flex items-center justify-center relative group">
                                        <iframe
                                            src="/widget/chat"
                                            className="w-full h-full opacity-100"
                                            title="Preview"
                                        />
                                        <div className="absolute inset-x-0 top-0 h-8 bg-black/5 flex items-center justify-center pointer-events-none">
                                            <div className="h-1 w-12 bg-slate-300 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
