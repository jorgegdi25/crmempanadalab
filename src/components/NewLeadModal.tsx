"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Calendar, MessageSquare, User, Tag, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Lead } from "@/types";

interface NewLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    leadToEdit?: Lead | null;
}

export default function NewLeadModal({ isOpen, onClose, onSuccess, leadToEdit }: NewLeadModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        source: "Empanadas Paisanas",
        status: "Nuevo",
        notes: "",
        country: "",
        city: "",
        tags: [] as string[],
        product_interest: "",
        next_follow_up: "",
        follow_up_method: "WhatsApp"
    });

    useEffect(() => {
        if (isOpen) {
            if (leadToEdit) {
                console.log('Initializing form with lead:', leadToEdit.id);
                const tagsRaw = leadToEdit.tags;
                const tagsArray = Array.isArray(tagsRaw) ? tagsRaw : (typeof tagsRaw === 'string' ? (tagsRaw as string).split(',').map(s => s.trim()) : []);

                setFormData({
                    name: leadToEdit.name || "",
                    email: leadToEdit.email || "",
                    phone: leadToEdit.phone || "",
                    source: leadToEdit.source || "Empanadas Paisanas",
                    status: leadToEdit.status || "Nuevo",
                    notes: leadToEdit.notes || "",
                    country: leadToEdit.country || "",
                    city: leadToEdit.city || "",
                    tags: tagsArray,
                    product_interest: leadToEdit.product_interest || "",
                    next_follow_up: leadToEdit.next_follow_up ? leadToEdit.next_follow_up.replace(" ", "T").slice(0, 16) : "",
                    follow_up_method: leadToEdit.follow_up_method || "WhatsApp"
                });
            } else {
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    source: "Empanadas Paisanas",
                    status: "Nuevo",
                    notes: "",
                    country: "",
                    city: "",
                    tags: [],
                    product_interest: "",
                    next_follow_up: "",
                    follow_up_method: "WhatsApp"
                });
            }
        }
    }, [isOpen, leadToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (!session) {
                alert('No hay sesión activa. Por favor inicia sesión nuevamente.');
                setLoading(false);
                return;
            }

            console.log('Saving Lead Data:', formData);

            if (leadToEdit) {
                const dataToUpdate = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    source: formData.source,
                    status: formData.status,
                    notes: formData.notes,
                    country: formData.country,
                    city: formData.city,
                    tags: formData.tags,
                    product_interest: formData.product_interest,
                    next_follow_up: formData.next_follow_up || null,
                    follow_up_method: formData.follow_up_method
                };
                const { error } = await supabase
                    .from('leads')
                    .update(dataToUpdate)
                    .eq('id', leadToEdit.id);

                if (error) throw error;
            } else {
                const dataToInsert = {
                    ...formData,
                    next_follow_up: formData.next_follow_up || null,
                    tags: formData.tags || []
                };
                const { error } = await supabase
                    .from('leads')
                    .insert([dataToInsert]);

                if (error) throw error;
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error saving lead:', error);
            alert(`Error al guardar: ${error.message || 'Revisa la consola'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {leadToEdit ? 'Editar Lead' : 'Nuevo Lead'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <div className="pb-2 border-b border-slate-100 flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Información Básica</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">País</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    placeholder="Ej. Colombia"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Ej. Bogotá"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Origen</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                >
                                    <option value="Empanadas Paisanas">Empanadas Paisanas</option>
                                    <option value="Colbrew">Colbrew</option>
                                    <option value="Chococol">Chococol</option>
                                    <option value="Manual">Manual</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Nuevo">Nuevo</option>
                                    <option value="Contactado">Contactado</option>
                                    <option value="Interesado">Interesado</option>
                                    <option value="Cerrado">Cerrado</option>
                                    <option value="Descartado">Descartado</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Producto Interés</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                value={formData.product_interest}
                                onChange={(e) => setFormData({ ...formData, product_interest: e.target.value })}
                            >
                                <option value="">Ninguno</option>
                                <option value="Empanadas Paisanas">Empanadas Paisanas</option>
                                <option value="Colbrew">Colbrew Café</option>
                                <option value="Chococol">Chococol</option>
                                <option value="Lab">Lab (Varios)</option>
                            </select>
                        </div>
                    </div>

                    {/* Follow-up Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="pb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest">Plan de Seguimiento</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Próximo Seguimiento</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={formData.next_follow_up}
                                    onChange={(e) => setFormData({ ...formData, next_follow_up: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Método de Contacto</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                    value={formData.follow_up_method}
                                    onChange={(e) => setFormData({ ...formData, follow_up_method: e.target.value })}
                                >
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="Llamada">Llamada Telefónica</option>
                                    <option value="Email">Correo Electrónico</option>
                                    <option value="Presencial">Reunión Presencial</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tags & General Notes Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="pb-2 flex items-center gap-2">
                            <Tag className="h-4 w-4 text-blue-500" />
                            <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest">Observaciones y Etiquetas</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Etiquetas (separadas por comas)</label>
                            <input
                                type="text"
                                placeholder="Ej: VIP, Mayorista, Urgente"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.tags.join(", ")}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                                })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notas Generales (Observaciones)</label>
                            <textarea
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Datos importantes que no cambian (ej. ubicación exacta, requerimientos especiales)"
                            />
                        </div>
                    </div>

                    {/* Footer / Buttons */}
                    <div className="pt-6 pb-2 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {leadToEdit ? 'Guardar Cambios' : 'Crear Lead'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
