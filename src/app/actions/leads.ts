"use server";

import { db } from "@/lib/db";
import { leads } from "@/lib/schema";
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

export async function updateLeadStatus(id: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");

  const result = await db.update(leads).set({ status }).where(eq(leads.id, id)).returning();
  return result[0];
}
