"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Search,
    Filter,
    Download,
    Plus,
    Mail,
    Phone,
    MessageSquare,
    Loader2,
    Eye,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import NewLeadModal from "@/components/NewLeadModal";
import LeadDetailsModal from "@/components/LeadDetailsModal";
import { Lead } from "@/types";

const PAGE_SIZE = 15;

const statusStyles: Record<string, string> = {
    "Nuevo": "bg-blue-100 text-blue-700",
    "Contactado": "bg-yellow-100 text-yellow-700",
    "Interesado": "bg-purple-100 text-purple-700",
    "Cerrado": "bg-green-100 text-green-700",
    "Descartado": "bg-slate-100 text-slate-700",
};

export default function LeadsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sourceFilter, setSourceFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [countryFilter, setCountryFilter] = useState("all");
    const [cityFilter, setCityFilter] = useState("all");
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // Modals state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching leads:', error);
            } else {
                setLeads(data as Lead[] || []);
            }
        } catch (error) {
            console.error('Unexpected error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleCreateNew = () => {
        setLeadToEdit(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (lead: Lead) => {
        setLeadToEdit(lead);
        setIsFormModalOpen(true);
        setIsDetailsModalOpen(false);
    };

    const handleViewDetails = (lead: Lead) => {
        setSelectedLead(lead);
        setIsDetailsModalOpen(true);
    };

    const handleRowClick = (lead: Lead) => {
        handleViewDetails(lead);
    };

    const handleFormSuccess = () => {
        fetchLeads();
        if (selectedLead && leadToEdit && selectedLead.id === leadToEdit.id) {
            setIsDetailsModalOpen(false);
        }
    };

    const handleDelete = async (lead: Lead) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este lead? Esta acción no se puede deshacer.')) {
            setLoading(true);
            try {
                const { error, count } = await supabase
                    .from('leads')
                    .delete({ count: 'exact' })
                    .eq('id', lead.id);

                if (error) {
                    alert(`Error al eliminar: ${error.message || 'Revisa la consola'}`);
                } else if (count === 0) {
                    alert('No se pudo eliminar el lead.');
                } else {
                    fetchLeads();
                    if (selectedLead && selectedLead.id === lead.id) {
                        setIsDetailsModalOpen(false);
                    }
                }
            } catch (error: any) {
                alert(`Error inesperado: ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleWhatsApp = (phone: string | null) => {
        if (!phone) {
            alert('Este lead no tiene número de teléfono registrado.');
            return;
        }
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 7) {
            alert('El número de teléfono no parece válido para WhatsApp.');
            return;
        }
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    // CSV Export
    const handleExport = () => {
        const dataToExport = filteredLeads;
        if (dataToExport.length === 0) {
            alert('No hay leads para exportar.');
            return;
        }

        const headers = ['Nombre', 'Email', 'Teléfono', 'País', 'Ciudad', 'Origen', 'Estado', 'Producto Interés', 'Próximo Seguimiento', 'Método', 'Etiquetas', 'Notas', 'Fecha Creación'];
        const rows = dataToExport.map(lead => [
            lead.name,
            lead.email || '',
            lead.phone || '',
            lead.country || '',
            lead.city || '',
            lead.source || '',
            lead.status || '',
            lead.product_interest || '',
            lead.next_follow_up ? new Date(lead.next_follow_up).toLocaleString() : '',
            lead.follow_up_method || '',
            lead.tags?.join('; ') || '',
            lead.notes || '',
            new Date(lead.created_at).toLocaleString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Filtering
    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        const matchesCountry = countryFilter === 'all' || lead.country === countryFilter;
        const matchesCity = cityFilter === 'all' || lead.city === cityFilter;
        return matchesSearch && matchesSource && matchesStatus && matchesCountry && matchesCity;
    });

    // Pagination
    const totalPages = Math.ceil(filteredLeads.length / PAGE_SIZE);
    const paginatedLeads = filteredLeads.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sourceFilter, statusFilter, countryFilter, cityFilter]);

    // Get unique values for filter dropdowns
    const uniqueSources = Array.from(new Set(leads.map(l => l.source).filter(Boolean))).sort();
    const uniqueStatuses = Array.from(new Set(leads.map(l => l.status).filter(Boolean))).sort();
    const uniqueCountries = Array.from(new Set(leads.map(l => l.country).filter(Boolean))).sort();
    const uniqueCities = Array.from(new Set(leads.filter(l => countryFilter === 'all' || l.country === countryFilter).map(l => l.city).filter(Boolean))).sort();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Leads</h1>
                    <p className="text-slate-500 text-sm">Administra y haz seguimiento a todos tus prospectos.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                        <Download className="h-4 w-4" /> Exportar
                    </button>
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors shadow-sm shadow-orange-200"
                    >
                        <Plus className="h-4 w-4" /> Nuevo Lead
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:max-w-xs">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-slate-400" />
                            </span>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50"
                                placeholder="Buscar por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium transition-colors hover:bg-slate-50",
                                    (sourceFilter !== 'all' || statusFilter !== 'all' || countryFilter !== 'all' || cityFilter !== 'all') ? "bg-orange-50 text-orange-600 border-orange-200" : "text-slate-600"
                                )}
                            >
                                <Filter className="h-4 w-4" />
                                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                                {(sourceFilter !== 'all' || statusFilter !== 'all' || countryFilter !== 'all' || cityFilter !== 'all') && (
                                    <span className="h-2 w-2 rounded-full bg-orange-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                                    <Globe className="h-3 w-3" /> Origen
                                </label>
                                <select
                                    value={sourceFilter}
                                    onChange={(e) => setSourceFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="all">Todos los orígenes</option>
                                    {uniqueSources.map(source => (
                                        <option key={source} value={source!}>{source}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                                    <Loader2 className="h-3 w-3" /> Estado
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="all">Todos los estados</option>
                                    {uniqueStatuses.map(status => (
                                        <option key={status} value={status!}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                                    <Globe className="h-3 w-3" /> País
                                </label>
                                <select
                                    value={countryFilter}
                                    onChange={(e) => {
                                        setCountryFilter(e.target.value);
                                        setCityFilter('all');
                                    }}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="all">Todos los países</option>
                                    {uniqueCountries.map(country => (
                                        <option key={country} value={country!}>{country}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Ciudad
                                </label>
                                <select
                                    value={cityFilter}
                                    onChange={(e) => setCityFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="all">Todas las ciudades</option>
                                    {uniqueCities.map(city => (
                                        <option key={city} value={city!}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                                <th className="px-6 py-4">Lead</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Interés / Tags</th>
                                <th className="px-6 py-4">Origen</th>
                                <th className="px-6 py-4">Seguimiento</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                                            Cargando leads...
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        <p className="font-medium text-lg text-slate-400 mb-2">No se encontraron leads</p>
                                        <p className="text-sm">Intenta ajustar los filtros para encontrar lo que buscas.</p>
                                        {(searchTerm !== '' || sourceFilter !== 'all' || statusFilter !== 'all' || countryFilter !== 'all' || cityFilter !== 'all') && (
                                            <button
                                                onClick={() => {
                                                    setSearchTerm("");
                                                    setSourceFilter("all");
                                                    setStatusFilter("all");
                                                    setCountryFilter("all");
                                                    setCityFilter("all");
                                                }}
                                                className="mt-4 text-orange-600 font-bold text-sm hover:underline"
                                            >
                                                Limpiar todos los filtros
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginatedLeads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                        onClick={() => handleRowClick(lead)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{lead.name}</div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-bold mt-0.5">
                                                <MapPin className="h-3 w-3" />
                                                {lead.country && lead.city ? `${lead.city.toUpperCase()}, ${lead.country.toUpperCase()}` : lead.country?.toUpperCase() || lead.city?.toUpperCase() || 'Sin ubicación'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {lead.email && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Mail className="h-3 w-3 text-slate-400" /> {lead.email}
                                                    </div>
                                                )}
                                                {lead.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Phone className="h-3 w-3 text-slate-400" /> {lead.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                {lead.product_interest && (
                                                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 w-fit font-bold uppercase tracking-tight">
                                                        {lead.product_interest}
                                                    </span>
                                                )}
                                                <div className="flex flex-wrap gap-1">
                                                    {lead.tags?.map((tag, i) => (
                                                        <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider",
                                                lead.source === 'Colbrew' ? 'bg-blue-100 text-blue-700' :
                                                    lead.source === 'Chococol' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-orange-100 text-orange-700'
                                            )}>
                                                {lead.source || 'Desconocido'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.next_follow_up ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-orange-600 uppercase">
                                                        {new Date(lead.next_follow_up).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold">
                                                        {lead.follow_up_method || 'WhatsApp'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 font-bold uppercase">Pendiente</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter",
                                                statusStyles[lead.status as string] || "bg-slate-100 text-slate-700"
                                            )}>
                                                {lead.status || 'Nuevo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => handleViewDetails(lead)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Ver Detalles">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleEdit(lead)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(lead)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleWhatsApp(lead.phone)}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-colors shadow-sm bg-white border border-slate-100",
                                                        lead.phone ? "text-green-600 hover:bg-green-50" : "text-slate-300 cursor-not-allowed"
                                                    )}
                                                    title="WhatsApp"
                                                    disabled={!lead.phone}
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <p className="font-medium">
                        Mostrando <span className="text-slate-900">{paginatedLeads.length > 0 ? ((currentPage - 1) * PAGE_SIZE + 1) : 0}</span>–<span className="text-slate-900">{Math.min(currentPage * PAGE_SIZE, filteredLeads.length)}</span> de <span className="text-slate-900">{filteredLeads.length}</span> leads
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-bold transition-all"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" /> Anterior
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={cn(
                                            "h-8 w-8 rounded-lg text-xs font-bold transition-all",
                                            currentPage === pageNum ? "bg-orange-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-bold transition-all"
                        >
                            Siguiente <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            <NewLeadModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSuccess={handleFormSuccess}
                leadToEdit={leadToEdit}
            />

            <LeadDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                lead={selectedLead}
                onEdit={handleEdit}
            />
        </div>
    );
}
