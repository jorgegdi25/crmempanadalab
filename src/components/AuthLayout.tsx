"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

function AuthContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const isLoginPage = pathname === "/login";
    const isPublicWidget = pathname === "/widget/chat";
    const isPublicPage = isLoginPage || isPublicWidget;

    const { status } = useSession({
        required: !isPublicPage,
        onUnauthenticated() {
            if (!isPublicPage) {
                router.replace("/login");
            }
        },
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (isPublicPage) {
        return <>{children}</>;
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
        );
    }

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

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthContent>{children}</AuthContent>
        </SessionProvider>
    );
}
