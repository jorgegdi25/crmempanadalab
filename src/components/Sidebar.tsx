"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Settings,
    ChevronRight,
    CheckSquare,
    Kanban,
    BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Leads", href: "/leads", icon: Users },
    { name: "Pipeline", href: "/pipeline", icon: Kanban },
    { name: "Tareas", href: "/tasks", icon: CheckSquare },
    { name: "Reportes", href: "/reports", icon: BarChart3 },
    { name: "Configuración", href: "/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
            <div className="flex h-16 items-center px-6">
                <span className="text-xl font-bold tracking-tight">Empanadas<span className="text-orange-500">Lab</span></span>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-orange-600 text-white"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <div className="flex items-center">
                                <item.icon className={cn(
                                    "mr-3 h-5 w-5",
                                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                                )} />
                                {item.name}
                            </div>
                            {isActive && <ChevronRight className="h-4 w-4" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-2 py-3 bg-slate-800/50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">
                        AD
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold">Admin User</span>
                        <span className="text-[10px] text-slate-400">admin@empanadas.com</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
