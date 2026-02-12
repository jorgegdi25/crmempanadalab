"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    User,
    Phone,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ChevronRight,
    Search,
    Check,
    Edit2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Lead } from "@/types";
import { cn } from "@/lib/utils";
import LeadDetailsModal from "@/components/LeadDetailsModal";
import NewLeadModal from "@/components/NewLeadModal";

export default function TasksPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'today' | 'overdue'>('all');
    const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .not('next_follow_up', 'is', null)
                .order('next_follow_up', { ascending: true });

            if (error) throw error;
            setLeads(data || []);
        } catch (err: any) {
            console.error('Error in fetchTasks:', err);
            setError(err.message || 'Error desconocido al cargar tareas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleLeadClick = (lead: Lead) => {
        setSelectedLead(lead);
        setIsDetailsOpen(true);
    };

    const handleEditFromTasks = (lead: Lead) => {
        setLeadToEdit(lead);
        setIsEditOpen(true);
        setIsDetailsOpen(false);
    };

    const handleCompleteTask = async (e: React.MouseEvent, lead: Lead) => {
        e.stopPropagation();
        try {
            const { error } = await supabase
                .from('leads')
                .update({ next_follow_up: null })
                .eq('id', lead.id);

            if (error) throw error;
            fetchTasks();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const isOverdue = (date: string) => new Date(date) < new Date();

    const isToday = (date: string) => {
        const d = new Date(date);
        const today = new Date();
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase());
        const followUp = lead.next_follow_up;
        if (!followUp) return false;

        if (filter === 'today') return matchesSearch && isToday(followUp);
        if (filter === 'overdue') return matchesSearch && isOverdue(followUp);
        return matchesSearch;
    });

    const overdueCount = leads.filter(l => l.next_follow_up && isOverdue(l.next_follow_up)).length;
    const todayCount = leads.filter(l => l.next_follow_up && isToday(l.next_follow_up)).length;

    const getMethodIcon = (method: string | null | undefined) => {
        switch (method) {
            case 'WhatsApp': return <MessageSquare className="h-4 w-4" />;
            case 'Llamada': return <Phone className="h-4 w-4" />;
            case 'Email': return <AlertCircle className="h-4 w-4" />;
            case 'Presencial': return <User className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tareas y Seguimientos</h1>
                    <p className="text-slate-500">Gestiona tus próximos contactos y no pierdas ninguna venta.</p>
                </div>
                {/* Summary badges */}
                <div className="flex items-center gap-3">
                    {overdueCount > 0 && (
                        <span className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-100">
                            {overdueCount} vencida{overdueCount > 1 ? 's' : ''}
                        </span>
                    )}
                    {todayCount > 0 && (
                        <span className="px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-bold rounded-full border border-orange-100">
                            {todayCount} para hoy
                        </span>
                    )}
                    <span className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
                        {leads.length} total
                    </span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </span>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={cn(
                            "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                            filter === 'all' ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilter('today')}
                        className={cn(
                            "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                            filter === 'today' ? "bg-orange-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Hoy
                    </button>
                    <button
                        onClick={() => setFilter('overdue')}
                        className={cn(
                            "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                            filter === 'overdue' ? "bg-red-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Vencidas
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
                        <p>Cargando tus tareas...</p>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center">
                        <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-red-900 font-semibold text-lg">Error al cargar tareas</h3>
                        <p className="text-slate-500 mt-1">{error}</p>
                        <button onClick={fetchTasks} className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold">
                            Reintentar
                        </button>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-6 w-6 text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-semibold text-lg">¡Todo al día!</h3>
                        <p className="text-slate-500 mt-1">No tienes tareas pendientes que coincidan con tu filtro.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredLeads.map((lead) => (
                            <div
                                key={lead.id}
                                onClick={() => handleLeadClick(lead)}
                                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Complete button */}
                                    <button
                                        onClick={(e) => handleCompleteTask(e, lead)}
                                        className={cn(
                                            "h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:scale-110",
                                            isOverdue(lead.next_follow_up!) ? "border-red-300 text-red-400 hover:bg-red-50 hover:text-red-600" :
                                                isToday(lead.next_follow_up!) ? "border-orange-300 text-orange-400 hover:bg-orange-50 hover:text-orange-600" :
                                                    "border-slate-200 text-slate-300 hover:bg-slate-50 hover:text-slate-500"
                                        )}
                                        title="Marcar como completada"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>

                                    {/* Method icon */}
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                        isOverdue(lead.next_follow_up!) ? "bg-red-50 text-red-600" :
                                            isToday(lead.next_follow_up!) ? "bg-orange-50 text-orange-600" :
                                                "bg-blue-50 text-blue-600"
                                    )} title={lead.follow_up_method || 'WhatsApp'}>
                                        {getMethodIcon(lead.follow_up_method)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-slate-900 truncate uppercase tracking-tight">
                                                {lead.name}
                                            </h3>
                                            <div className={cn(
                                                "flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full",
                                                isOverdue(lead.next_follow_up!) ? "bg-red-100 text-red-700" :
                                                    isToday(lead.next_follow_up!) ? "bg-orange-100 text-orange-700" :
                                                        "bg-slate-100 text-slate-700"
                                            )}>
                                                <Clock className="h-3.5 w-3.5" />
                                                {new Date(lead.next_follow_up!).toLocaleString('es-ES', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                            Interés: <span className="text-slate-700 font-medium">{lead.product_interest || 'General'}</span>
                                            {lead.tags && lead.tags.length > 0 && (
                                                <span className="ml-2">• Tags: {lead.tags.join(', ')}</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Edit button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEditFromTasks(lead); }}
                                        className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Editar"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>

                                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedLead && (
                <LeadDetailsModal
                    lead={selectedLead}
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    onEdit={handleEditFromTasks}
                    onUpdate={fetchTasks}
                />
            )}

            <NewLeadModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSuccess={() => { setIsEditOpen(false); fetchTasks(); }}
                leadToEdit={leadToEdit}
            />
        </div>
    );
}
