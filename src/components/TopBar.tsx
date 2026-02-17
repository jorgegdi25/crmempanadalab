"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, Menu, Clock, User, MessageSquare, Phone, FileText, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Interaction } from "@/types";

interface TopBarProps {
    onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // Fetch interactions
            const { data: interactionsData, error: intError } = await supabase
                .from('interactions')
                .select(`
                    *,
                    leads (name)
                `)
                .order('created_at', { ascending: false })
                .limit(5);

            if (intError) throw intError;

            // Fetch upcoming follow-ups (today)
            const today = new Date();
            today.setHours(23, 59, 59, 999);

            const { data: followUpsData, error: fupError } = await supabase
                .from('leads')
                .select('id, name, next_follow_up, product_interest')
                .not('next_follow_up', 'is', null)
                .lte('next_follow_up', today.toISOString())
                .order('next_follow_up', { ascending: true })
                .limit(5);

            if (fupError) throw fupError;

            // Map and combine
            const interactionNotifs = (interactionsData || []).map((item: any) => ({
                id: item.id,
                type: item.type,
                content: item.content,
                created_at: item.created_at,
                lead_name: item.leads?.name || 'Lead desconocido',
                isFollowUp: false
            }));

            const followUpNotifs = (followUpsData || []).map((item: any) => ({
                id: `fup-${item.id}`,
                type: 'followup',
                content: `Seguimiento pendiente: ${item.product_interest || 'General'}`,
                created_at: item.next_follow_up,
                lead_name: item.name,
                isFollowUp: true
            }));

            // Combine and sort by date (most recent first)
            const combined = [...followUpNotifs, ...interactionNotifs].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setNotifications(combined.slice(0, 8) as any);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Handle clicks outside dropdown
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'call': return <Phone className="h-3 w-3" />;
            case 'whatsapp': return <MessageSquare className="h-3 w-3" />;
            case 'email': return <FileText className="h-3 w-3" />;
            case 'followup': return <Calendar className="h-3 w-3" />;
            default: return <FileText className="h-3 w-3" />;
        }
    };

    return (
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden text-slate-500 hover:text-slate-700"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="relative max-w-md w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </span>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-50"
                        placeholder="Buscar leads, contactos..."
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={cn(
                            "relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors",
                            isNotificationsOpen && "bg-slate-100 text-slate-600"
                        )}
                    >
                        <Bell className="h-5 w-5" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Centro de Avisos</h3>
                                <button
                                    onClick={() => fetchNotifications()}
                                    className="text-[10px] text-orange-600 font-bold hover:underline"
                                >
                                    Refrescar
                                </button>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {loading && notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <p className="text-xs text-slate-500">Buscando novedades...</p>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <p className="text-sm text-slate-500">No hay avisos pendientes</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {notifications.map((notif: any) => (
                                            <div key={notif.id} className={cn(
                                                "p-4 hover:bg-slate-50 transition-colors cursor-default",
                                                notif.isFollowUp && "bg-orange-50/30"
                                            )}>
                                                <div className="flex gap-3">
                                                    <div className={cn(
                                                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                                        notif.type === 'followup' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' :
                                                            notif.type === 'note' ? 'bg-yellow-100 text-yellow-600' :
                                                                notif.type === 'call' ? 'bg-blue-100 text-blue-600' :
                                                                    'bg-green-100 text-green-600'
                                                    )}>
                                                        {getIcon(notif.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="text-sm text-slate-900 font-bold truncate">
                                                                {notif.lead_name}
                                                            </p>
                                                            {notif.isFollowUp && (
                                                                <span className="text-[9px] bg-orange-600 text-white px-1.5 py-0.5 rounded uppercase font-black">Urge</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 font-medium">
                                                            {notif.content}
                                                        </p>
                                                        <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-bold">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(notif.created_at).toLocaleString('es-ES', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                day: '2-digit',
                                                                month: 'short'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-center">
                                <button className="text-[10px] text-slate-500 font-medium hover:text-slate-700">
                                    Marcar todas como leídas
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-700 leading-none">Admin</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Empanadas Lab</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-orange-600" />
                    </div>
                </div>
            </div>
        </header>
    );
}
