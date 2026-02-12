"use client";

import { useState, useEffect } from "react";
import { BarChart3, Loader2, PieChart, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface LeadData {
    status: string;
    source: string;
    product_interest: string;
    created_at: string;
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [leads, setLeads] = useState<LeadData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('leads')
                    .select('status, source, product_interest, created_at');
                setLeads((data as LeadData[]) || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const total = leads.length;

    // Status distribution
    const statusGroups: Record<string, { count: number; color: string }> = {
        'Nuevo': { count: 0, color: 'from-blue-500 to-blue-400' },
        'Contactado': { count: 0, color: 'from-yellow-500 to-yellow-400' },
        'Interesado': { count: 0, color: 'from-purple-500 to-purple-400' },
        'Cerrado': { count: 0, color: 'from-green-500 to-green-400' },
        'Descartado': { count: 0, color: 'from-slate-400 to-slate-300' },
    };
    leads.forEach(l => {
        if (statusGroups[l.status]) statusGroups[l.status].count++;
    });

    // Source distribution
    const sourceMap: Record<string, number> = {};
    leads.forEach(l => {
        const s = l.source || 'Desconocido';
        sourceMap[s] = (sourceMap[s] || 0) + 1;
    });
    const sourceData = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]);
    const sourceColors = ['from-orange-500 to-orange-400', 'from-blue-500 to-blue-400', 'from-purple-500 to-purple-400', 'from-green-500 to-green-400', 'from-slate-400 to-slate-300'];

    // Product distribution
    const productMap: Record<string, number> = {};
    leads.forEach(l => {
        const p = l.product_interest || 'Sin especificar';
        productMap[p] = (productMap[p] || 0) + 1;
    });
    const productData = Object.entries(productMap).sort((a, b) => b[1] - a[1]);
    const productColors = ['from-pink-500 to-pink-400', 'from-cyan-500 to-cyan-400', 'from-amber-500 to-amber-400', 'from-indigo-500 to-indigo-400', 'from-slate-400 to-slate-300'];

    // Conversion by product
    const conversionByProduct = Object.entries(productMap).map(([product]) => {
        const productLeads = leads.filter(l => (l.product_interest || 'Sin especificar') === product);
        const closed = productLeads.filter(l => l.status === 'Cerrado').length;
        const rate = productLeads.length > 0 ? ((closed / productLeads.length) * 100).toFixed(1) : "0";
        return { product, total: productLeads.length, closed, rate: parseFloat(rate) };
    }).sort((a, b) => b.rate - a.rate);

    const maxBarCount = Math.max(...sourceData.map(s => s[1]), 1);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
                <p className="text-slate-500">Análisis detallado del rendimiento de tu CRM.</p>
            </div>

            {loading ? (
                <div className="p-12 text-center text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
                    <p>Cargando reportes...</p>
                </div>
            ) : (
                <>
                    {/* Status Distribution */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-purple-600" />
                            <h2 className="font-bold text-slate-900">Distribución por Estado</h2>
                        </div>
                        <div className="p-6">
                            {/* Visual bar */}
                            <div className="h-8 rounded-full overflow-hidden flex mb-6">
                                {Object.entries(statusGroups).map(([status, info]) => (
                                    info.count > 0 && (
                                        <div
                                            key={status}
                                            className={cn("bg-gradient-to-r h-full transition-all", info.color)}
                                            style={{ width: `${(info.count / total) * 100}%` }}
                                            title={`${status}: ${info.count}`}
                                        />
                                    )
                                ))}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                {Object.entries(statusGroups).map(([status, info]) => (
                                    <div key={status} className="text-center">
                                        <p className="text-2xl font-bold text-slate-900">{info.count}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status}</p>
                                        <p className="text-xs text-slate-500">{total > 0 ? ((info.count / total) * 100).toFixed(0) : 0}%</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* By Source */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-orange-600" />
                                <h2 className="font-bold text-slate-900">Leads por Origen</h2>
                            </div>
                            <div className="p-6">
                                <div className="flex items-end justify-between gap-4 h-48">
                                    {sourceData.map(([source, count], i) => (
                                        <div key={source} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                            <span className="text-sm font-bold text-slate-700">{count}</span>
                                            <div
                                                className={cn("w-full rounded-t-lg bg-gradient-to-t transition-all duration-500", sourceColors[i % sourceColors.length])}
                                                style={{ height: `${Math.max((count / maxBarCount) * 100, 8)}%` }}
                                            />
                                            <span className="text-[10px] text-slate-500 font-medium text-center leading-tight">{source}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* By Product */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-pink-600" />
                                <h2 className="font-bold text-slate-900">Leads por Producto</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {productData.map(([product, count], i) => (
                                    <div key={product}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-medium text-slate-700">{product}</span>
                                            <span className="font-bold text-slate-900">{count} <span className="text-slate-400 font-normal">({total > 0 ? ((count / total) * 100).toFixed(0) : 0}%)</span></span>
                                        </div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-500", productColors[i % productColors.length])}
                                                style={{ width: `${(count / total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Conversion by Product */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <h2 className="font-bold text-slate-900">Tasa de Conversión por Producto</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                                        <th className="px-6 py-3">Producto</th>
                                        <th className="px-6 py-3 text-center">Total Leads</th>
                                        <th className="px-6 py-3 text-center">Cerrados</th>
                                        <th className="px-6 py-3 text-center">Conversión</th>
                                        <th className="px-6 py-3">Progreso</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {conversionByProduct.map(item => (
                                        <tr key={item.product} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{item.product}</td>
                                            <td className="px-6 py-4 text-center text-slate-600">{item.total}</td>
                                            <td className="px-6 py-4 text-center font-bold text-green-600">{item.closed}</td>
                                            <td className="px-6 py-4 text-center font-bold text-slate-900">{item.rate}%</td>
                                            <td className="px-6 py-4">
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-32">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                                                        style={{ width: `${item.rate}%` }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
