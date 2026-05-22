import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads, pushSubscriptions } from '@/lib/schema';
import webpush from 'web-push';

const CRM_API_KEY = process.env.CRM_API_KEY || 'emp_lab_secret_2026';

let vapidConfigured = false;
function ensureVapid() {
    if (vapidConfigured) return;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (publicKey && privateKey) {
        webpush.setVapidDetails(
            process.env.VAPID_SUBJECT || 'mailto:info@empanadaslab.com',
            publicKey,
            privateKey
        );
        vapidConfigured = true;
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
        },
    });
}

export async function POST(request: Request) {
    try {
        const apiKey = request.headers.get('x-api-key');
        if (apiKey !== CRM_API_KEY) {
            return NextResponse.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        const body = await request.json();
        const { name, phone, email, product_interest, source, notes, country, city } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        const newLeadRaw = await db.insert(leads).values({
            name,
            phone: phone || null,
            email: email || null,
            product_interest: product_interest || 'Chat Widget',
            source: source || 'Widget Externo',
            status: 'Nuevo',
            notes: notes || 'Lead capturado vía chat widget.',
            country: country || null,
            city: city || null,
            tags: ['widget']
        }).returning();

        const newLead = newLeadRaw[0];

        ensureVapid();
        try {
            const bscriptions = await db.select({ subscription_data: pushSubscriptions.subscription_data }).from(pushSubscriptions);

            if (bscriptions && bscriptions.length > 0) {
                const payload = JSON.stringify({
                    title: `¡Nuevo Lead: ${name}! 🥟`,
                    body: `${product_interest || 'Interés general'} de ${source || 'Web'}`,
                    url: `/`
                });

                const pushPromises = bscriptions.map(sub =>
                    webpush.sendNotification(sub.subscription_data as any, payload)
                        .catch((err: any) => console.error('Error sending push:', err))
                );

                await Promise.all(pushPromises);
            }
        } catch (pushError) {
            console.error('Push notification loop error:', pushError);
        }

        return NextResponse.json({ success: true, lead: newLead }, {
            status: 201,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });

    } catch (error: any) {
        console.error('External API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
}
