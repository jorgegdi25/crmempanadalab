"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Send, Phone, Mail, Calendar, User, Clock, Loader2, Edit, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Lead, Interaction } from "@/types";
import { cn } from "@/lib/utils";

interface LeadDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    onEdit: (lead: Lead) => void;
    onUpdate?: () => void;
}

export default function LeadDetailsModal({ isOpen, onClose, lead, onEdit, onUpdate }: LeadDetailsModalProps) {
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState("");
    const [savingNote, setSavingNote] = useState(false);

    const fetchInteractions = useCallback(async () => {
        if (!lead) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('interactions')
            .select('*')
            .eq('lead_id', lead.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setInteractions(data as Interaction[]);
        }
        setLoading(false);
    }, [lead]);

    useEffect(() => {
        if (isOpen && lead) {
            fetchInteractions();
        }
    }, [isOpen, lead, fetchInteractions]);

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim() || !lead) return;

        setSavingNote(true);
        const { error } = await supabase
            .from('interactions')
            .insert([{
                lead_id: lead.id,
                type: 'note',
                content: note
            }]);

        if (!error) {
            setNote("");
            fetchInteractions();
            if (onUpdate) onUpdate();
        }
        setSavingNote(false);
    };

    if (!isOpen || !lead) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

            {/* Slide-over Panel */}
            <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{lead.name}</h2>
                        <p className="text-sm text-slate-500">Agregado el {new Date(lead.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onEdit(lead)}
                            className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                            title="Editar Lead"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Lead Info */}
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Estado</span>
                                <span className={cn(
                                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                    lead.status === 'Nuevo' ? "bg-blue-100 text-blue-700" :
                                        lead.status === 'Contactado' ? "bg-yellow-100 text-yellow-700" :
                                            "bg-slate-100 text-slate-700"
                                )}>
                                    {lead.status}
                                </span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Origen</span>
                                <span className="text-sm font-medium text-slate-700">{lead.source}</span>
                            </div>
                        </div>

                        {lead.next_follow_up && (
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-tight">Próximo Seguimiento</p>
                                        <p className="text-sm font-bold text-orange-900">
                                            {new Date(lead.next_follow_up).toLocaleString('es-ES', {
                                                day: '2-digit',
                                                month: 'long',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-2 py-1 bg-white border border-orange-200 rounded-md text-[10px] font-bold text-orange-600">
                                    {lead.follow_up_method || 'WhatsApp'}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <a href={`mailto:${lead.email}`} className="hover:text-orange-600 hover:underline">{lead.email || 'No email registered'}</a>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Phone className="h-4 w-4 text-slate-400" />
                                <a href={`tel:${lead.phone}`} className="hover:text-orange-600 hover:underline">{lead.phone || 'No phone registered'}</a>
                            </div>
                        </div>

                        {lead.notes && (
                            <div className="mt-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Notas Generales</span>
                                <p className="text-sm text-slate-600 italic">"{lead.notes}"</p>
                            </div>
                        )}
                    </div>

                    <div className="h-2 bg-slate-50 border-y border-slate-100" />

                    {/* Timeline / Interactions */}
                    <div className="p-6">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" /> Historial
                        </h3>

                        {/* Add Note Input */}
                        <form onSubmit={handleAddNote} className="mb-6">
                            <div className="relative">
                                <textarea
                                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                                    placeholder="Agregar una nota..."
                                    rows={2}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={savingNote || !note.trim()}
                                    className="absolute bottom-2 right-2 p-1 text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                                >
                                    {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </button>
                            </div>
                        </form>

                        {/* List */}
                        <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 before:border-l before:border-slate-200 before:content-['']">
                            {loading ? (
                                <div className="text-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-orange-500 mx-auto" />
                                </div>
                            ) : interactions.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center pl-8">No hay interacciones registradas.</p>
                            ) : (
                                interactions.map((interaction) => (
                                    <div key={interaction.id} className="relative pl-8 group">
                                        <div className="absolute left-[10px] top-1 h-1.5 w-1.5 rounded-full bg-slate-300 ring-4 ring-white group-hover:bg-orange-500 transition-colors" />
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-slate-500">
                                                    {interaction.type === 'note' ? 'Nota' : 'Interacción'}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(interaction.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                {interaction.content}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
