"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  BarChart3
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Lead, Interaction } from "@/types";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    newToday: 0,
    conversion: "0%",
    closed: 0
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentActivity, setRecentActivity] = useState<(Interaction & { lead_name?: string })[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ label: string; count: number }[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Get Total Leads
        const { count: totalCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        // 2. Get New Leads Today
        const { count: newTodayCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString());

        // 3. Get Closed Leads
        const { count: closedCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Cerrado');

        // 4. Calculate Conversion Rate
        const conversionRate = totalCount ? ((closedCount || 0) / totalCount * 100).toFixed(1) + "%" : "0%";

        setStats({
          total: totalCount || 0,
          newToday: newTodayCount || 0,
          conversion: conversionRate,
          closed: closedCount || 0
        });

        // 5. Get Recent Leads
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (leadsData) setRecentLeads(leadsData as Lead[]);

        // 6. Get Recent Interactions
        const { data: interactionsData } = await supabase
          .from('interactions')
          .select(`*, leads (name)`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (interactionsData) {
          const mappedInteractions = interactionsData.map((interaction: any) => ({
            ...interaction,
            lead_name: interaction.leads?.name || 'Lead Eliminado'
          }));
          setRecentActivity(mappedInteractions);
        }

        // 7. Get Weekly Data for Chart (last 8 weeks)
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

        const { data: weeklyLeads } = await supabase
          .from('leads')
          .select('created_at')
          .gte('created_at', eightWeeksAgo.toISOString())
          .order('created_at', { ascending: true });

        if (weeklyLeads) {
          const weeks: { label: string; count: number }[] = [];
          for (let i = 7; i >= 0; i--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i * 7));
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            const count = weeklyLeads.filter(l => {
              const d = new Date(l.created_at);
              return d >= weekStart && d < weekEnd;
            }).length;

            const label = weekStart.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
            weeks.push({ label, count });
          }
          setWeeklyData(weeks);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const dashboardStats = [
    { name: "Leads Totales", value: stats.total.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Nuevos Hoy", value: stats.newToday.toString(), icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { name: "Conversión", value: stats.conversion, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Cerrados", value: stats.closed.toString(), icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  ];

  const maxWeeklyCount = Math.max(...weeklyData.map(w => w.count), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resumen General</h1>
        <p className="text-slate-500">Métricas clave y actividad reciente de tu CRM.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                {loading ? "..." : stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            <h2 className="font-bold text-slate-900">Leads por Semana</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Últimas 8 semanas</span>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="h-48 flex items-center justify-center text-slate-400">Cargando gráfica...</div>
          ) : weeklyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400">Sin datos suficientes</div>
          ) : (
            <div className="flex items-end justify-between gap-3 h-48">
              {weeklyData.map((week, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-xs font-bold text-slate-700">{week.count}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-orange-600 to-orange-400 transition-all duration-500 relative group"
                    style={{
                      height: `${Math.max((week.count / maxWeeklyCount) * 100, 4)}%`,
                      minHeight: '4px'
                    }}
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 rounded-t-lg transition-colors" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{week.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-bold text-slate-900">Leads Recientes</h2>
            <Link href="/leads" className="text-sm text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1 transition-colors">
              Ver todos <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Origen</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                      No hay leads recientes.
                    </td>
                  </tr>
                ) : (
                  recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{lead.name}</div>
                        <div className="text-xs text-slate-500">{lead.email || lead.phone || 'Sin contacto'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full inline-block ${lead.source === 'Colbrew' ? 'bg-blue-100 text-blue-700' :
                          lead.source === 'Chococol' ? 'bg-purple-100 text-purple-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                          {lead.source || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${lead.status === 'Cerrado' ? 'bg-green-100 text-green-700' :
                          lead.status === 'Descartado' ? 'bg-slate-100 text-slate-500' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 text-xs">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-900">Actividad Reciente</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse"></div>
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No hay actividad reciente.</p>
            ) : (
              <div className="space-y-6 relative">
                <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="relative pl-6">
                    <div className={`absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-white ${activity.type === 'note' ? 'bg-yellow-400' :
                      activity.type === 'call' ? 'bg-blue-400' :
                        activity.type === 'whatsapp' ? 'bg-green-400' :
                          'bg-slate-400'
                      }`}></div>
                    <p className="text-sm text-slate-900 leading-snug">
                      <span className="font-semibold">{activity.lead_name}</span>
                      <span className="text-slate-500"> - {activity.type === 'note' ? 'Nota' : activity.type === 'call' ? 'Llamada' : 'Interacción'}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 truncate" title={activity.content}>
                      {activity.content || 'Sin detalles'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
