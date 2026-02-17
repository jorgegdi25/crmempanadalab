"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isLoginPage = pathname === "/login";
    const isPublicWidget = pathname === "/widget/chat";
    const isPublicPage = isLoginPage || isPublicWidget;

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session && !isPublicPage) {
                router.replace("/login");
                return;
            }

            if (session && isLoginPage) {
                router.replace("/");
                return;
            }

            setAuthenticated(!!session);
            setLoading(false);
        };

        checkSession();

        // Listen for auth state changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session && !isPublicPage) {
                router.replace("/login");
            } else if (session && isLoginPage) {
                router.replace("/");
            }
            setAuthenticated(!!session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [isPublicPage, isLoginPage, router]);

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    // Public pages: no sidebar/topbar
    if (isPublicPage) {
        return <>{children}</>;
    }

    // Authenticated pages: show sidebar/topbar
    if (authenticated) {
        return (
            <div className="flex h-screen overflow-hidden">
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    return null;
}
