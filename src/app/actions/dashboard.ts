"use server";

import { db } from "@/lib/db";
import { leads, interactions } from "@/lib/schema";
import { count, eq, gte, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getDashboardData() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Total Leads
  const totalLeadsRes = await db.select({ value: count() }).from(leads);
  const totalCount = totalLeadsRes[0].value;

  // New Leads Today
  const newTodayRes = await db.select({ value: count() }).from(leads).where(gte(leads.createdAt, today));
  const newTodayCount = newTodayRes[0].value;

  // Closed Leads
  const closedRes = await db.select({ value: count() }).from(leads).where(eq(leads.status, 'Cerrado'));
  const closedCount = closedRes[0].value;

  const conversionRate = totalCount ? ((closedCount / totalCount) * 100).toFixed(1) + "%" : "0%";

  // Recent Leads
  const recentLeads = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(5);

  // Recent Interactions
  const recentInteractionsRaw = await db
    .select({
      id: interactions.id,
      content: interactions.content,
      type: interactions.type,
      created_at: interactions.createdAt,
      lead_name: leads.name
    })
    .from(interactions)
    .leftJoin(leads, eq(interactions.lead_id, leads.id))
    .orderBy(desc(interactions.createdAt))
    .limit(5);

  // Weekly data (last 8 weeks)
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const weeklyLeadsRaw = await db.select({ created_at: leads.createdAt }).from(leads).where(gte(leads.createdAt, eightWeeksAgo)).orderBy(leads.createdAt);

  const weeks: { label: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i * 7));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const countVal = weeklyLeadsRaw.filter(l => {
      const d = l.created_at;
      return d >= weekStart && d < weekEnd;
    }).length;

    const label = weekStart.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    weeks.push({ label, count: countVal });
  }

  return {
    stats: {
      total: totalCount,
      newToday: newTodayCount,
      conversion: conversionRate,
      closed: closedCount
    },
    recentLeads: recentLeads.map(l => ({...l, created_at: l.createdAt.toISOString()})),
    recentActivity: recentInteractionsRaw.map(i => ({...i, created_at: i.created_at.toISOString()})),
    weeklyData: weeks
  };
}
