import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/lib/schema';

// Por seguridad, usaremos una API_KEY personalizada.
const API_KEY = process.env.CRM_API_KEY || 'emp_lab_secret_2026';

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
        },
    });
}

export async function POST(req: Request) {
    try {
        const apiKey = req.headers.get('x-api-key');

        if (apiKey !== API_KEY) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, phone, source, product_interest, notes, city, country } = body;

        if (!name) {
            return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        const newLead = await db.insert(leads).values({
            name,
            email,
            phone,
            source: source || 'Web Externo',
            status: 'Nuevo',
            product_interest,
            notes,
            city,
            country,
            tags: ['Web-Incoming']
        }).returning();

        return NextResponse.json({ success: true, data: newLead }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
