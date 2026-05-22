"use server";

import { db } from "@/lib/db";
import { leads } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSettingsStats() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("No autorizado");

    const allLeads = await db.select().from(leads);

    const total = allLeads.length;
    const closed = allLeads.filter(l => l.status === 'Cerrado').length;
    const newCount = allLeads.filter(l => l.status === 'Nuevo').length;
    const contacted = allLeads.filter(l => l.status === 'Contactado').length;
    const interested = allLeads.filter(l => l.status === 'Interesado').length;
    const discarded = allLeads.filter(l => l.status === 'Descartado').length;

    // By source
    const sourceMap: Record<string, number> = {};
    allLeads.forEach(l => {
        const s = l.source || 'Desconocido';
        sourceMap[s] = (sourceMap[s] || 0) + 1;
    });
    const bySource = Object.entries(sourceMap).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);

    // By product
    const productMap: Record<string, number> = {};
    allLeads.forEach(l => {
        const p = l.product_interest || 'Sin especificar';
        productMap[p] = (productMap[p] || 0) + 1;
    });
    const byProduct = Object.entries(productMap).map(([product, count]) => ({ product, count })).sort((a, b) => b.count - a.count);

    return { total, closed, new: newCount, contacted, interested, discarded, bySource, byProduct };
}
