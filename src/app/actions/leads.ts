"use server";

import { db } from "@/lib/db";
import { leads, interactions } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getAllLeads() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");

  const results = await db.select().from(leads).orderBy(desc(leads.createdAt));
  return results.map(l => ({ ...l, created_at: l.createdAt.toISOString() }));
}

export async function createLead(data: any) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");

  const result = await db.insert(leads).values(data).returning();
  return result[0];
}

export async function updateLead(id: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");

  const result = await db.update(leads).set(data).where(eq(leads.id, id)).returning();
  return result[0];
}

export async function updateLeadStatus(id: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");

  const result = await db.update(leads).set({ status }).where(eq(leads.id, id)).returning();
  return result[0];
}

export async function deleteLead(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");

  const result = await db.delete(leads).where(eq(leads.id, id)).returning();
  return result.length > 0;
}

import { isNotNull, asc } from "drizzle-orm";

export async function getTasks() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");

  const results = await db.select()
    .from(leads)
    .where(isNotNull(leads.next_follow_up))
    .orderBy(asc(leads.next_follow_up));
    
  return results.map(l => ({ ...l, created_at: l.createdAt.toISOString() }));
}

export async function clearLeadNextFollowUp(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");

  const result = await db.update(leads).set({ next_follow_up: null }).where(eq(leads.id, id)).returning();
  return result[0];
}

export async function getReportLeads() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");

  const results = await db.select({
    status: leads.status,
    source: leads.source,
    product_interest: leads.product_interest,
    created_at: leads.createdAt,
  }).from(leads);
  
  return results.map(l => ({ 
    status: l.status || '', 
    source: l.source || '', 
    product_interest: l.product_interest || '', 
    created_at: l.created_at.toISOString() 
  }));
}

export async function getLeadInteractions(leadId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");

  const results = await db.select()
    .from(interactions)
    .where(eq(interactions.lead_id, leadId))
    .orderBy(desc(interactions.createdAt));

  return results.map(i => ({ ...i, created_at: i.createdAt.toISOString() }));
}

export async function addLeadInteraction(leadId: string, type: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("No autorizado");

  const result = await db.insert(interactions).values({
    lead_id: leadId,
    type,
    content,
    user_id: (session.user as any).id || session.user.email || 'system'
  }).returning();

  return { ...result[0], created_at: result[0].createdAt.toISOString() };
}

import { lte } from "drizzle-orm";

export async function getTopBarNotifications() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  // Fetch 5 recent interactions
  const recentInteractions = await db.select({
    id: interactions.id,
    type: interactions.type,
    content: interactions.content,
    createdAt: interactions.createdAt,
    leadName: leads.name
  }).from(interactions)
    .leftJoin(leads, eq(interactions.lead_id, leads.id))
    .orderBy(desc(interactions.createdAt))
    .limit(5);

  // Fetch upcoming followups (today)
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const followUps = await db.select({
    id: leads.id,
    name: leads.name,
    next_follow_up: leads.next_follow_up,
    product_interest: leads.product_interest
  }).from(leads)
    .where(isNotNull(leads.next_follow_up))
    .orderBy(asc(leads.next_follow_up))
    .limit(5);

  const interactionNotifs = recentInteractions.map(i => ({
    id: i.id,
    type: i.type,
    content: i.content,
    created_at: i.createdAt.toISOString(),
    lead_name: i.leadName || 'Lead desconocido',
    isFollowUp: false
  }));

  const followUpNotifs = followUps
    .filter(l => l.next_follow_up && l.next_follow_up <= today)
    .map(l => ({
      id: `fup-${l.id}`,
      type: 'followup',
      content: `Seguimiento pendiente: ${l.product_interest || 'General'}`,
      created_at: l.next_follow_up!.toISOString(),
      lead_name: l.name,
      isFollowUp: true
    }));

  const combined = [...followUpNotifs, ...interactionNotifs].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return combined.slice(0, 8);
}

