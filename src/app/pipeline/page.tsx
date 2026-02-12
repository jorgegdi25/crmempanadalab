"use client";

import { useState, useEffect } from "react";
import { Loader2, MessageSquare, Phone, Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Lead } from "@/types";
import { cn } from "@/lib/utils";
import LeadDetailsModal from "@/components/LeadDetailsModal";
import NewLeadModal from "@/components/NewLeadModal";

const COLUMNS = [
    { key: "Nuevo", label: "Nuevo", color: "border-blue-400", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
    { key: "Contactado", label: "Contactado", color: "border-yellow-400", bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
    { key: "Interesado", label: "Interesado", color: "border-purple-400", bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
    { key: "Cerrado", label: "Cerrado", color: "border-green-400", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
    { key: "Descartado", label: "Descartado", color: "border-slate-300", bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-300" },
];

export default function PipelinePage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLeads(); }, []);

    const handleMoveStatus = async (lead: Lead, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: newStatus })
                .eq('id', lead.id);
            if (error) throw error;
            fetchLeads();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleEdit = (lead: Lead) => {
        setLeadToEdit(lead);
        setIsEditOpen(true);
        setIsDetailsOpen(false);
    };

    const getNextStatus = (current: string) => {
        const order = ['Nuevo', 'Contactado', 'Interesado', 'Cerrado'];
        const idx = order.indexOf(current);
        return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-full">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Pipeline de Ventas</h1>
                <p className="text-slate-500">Vista Kanban de todos tus leads por estado.</p>
            </div>

            {loading ? (
                <div className="p-12 text-center text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
                    <p>Cargando pipeline...</p>
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
                    {COLUMNS.map(col => {
                        const columnLeads = leads.filter(l => l.status === col.key);
                        return (
                            <div key={col.key} className="flex-1 min-w-[240px] max-w-[320px]">
                                {/* Column header */}
                                <div className={cn("rounded-t-xl px-4 py-3 border-t-4", col.color, col.bg)}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("h-2.5 w-2.5 rounded-full", col.dot)} />
                                            <h3 className={cn("text-sm font-bold", col.text)}>{col.label}</h3>
                                        </div>
                                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", col.bg, col.text)}>
                                            {columnLeads.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Cards */}
                                <div className="space-y-2 bg-slate-50/50 rounded-b-xl p-2 border border-t-0 border-slate-200 min-h-[200px]">
                                    {columnLeads.length === 0 ? (
                                        <div className="p-6 text-center text-xs text-slate-300">
                                            Sin leads
                                        </div>
                                    ) : columnLeads.map(lead => {
                                        const nextStatus = getNextStatus(lead.status || '');
                                        return (
                                            <div
                                                key={lead.id}
                                                onClick={() => { setSelectedLead(lead); setIsDetailsOpen(true); }}
                                                className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                            >
                                                <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                                                    {lead.name}
                                                </h4>
                                                {lead.product_interest && (
                                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                        {lead.product_interest}
                                                    </span>
                                                )}
                                                {lead.next_follow_up && (
                                                    <div className="flex items-center gap-1 mt-2 text-[10px] text-orange-600 font-medium">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(lead.next_follow_up).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                                                    <div className="flex items-center gap-1">
                                                        {lead.phone && <MessageSquare className="h-3 w-3 text-green-500" />}
                                                        {lead.email && <Phone className="h-3 w-3 text-blue-400" />}
                                                    </div>
                                                    {nextStatus && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleMoveStatus(lead, nextStatus); }}
                                                            className="flex items-center gap-0.5 text-[10px] font-bold text-orange-600 hover:text-orange-700 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            Mover <ChevronRight className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedLead && (
                <LeadDetailsModal
                    lead={selectedLead}
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    onEdit={handleEdit}
                    onUpdate={fetchLeads}
                />
            )}

            <NewLeadModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSuccess={() => { setIsEditOpen(false); fetchLeads(); }}
                leadToEdit={leadToEdit}
            />
        </div>
    );
}
