import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos el service role key para saltar RLS en la inserción de leads externos si es necesario,
// o simplemente la anon key si las políticas permiten inserción pública (que no es lo ideal).
// Por seguridad, usaremos las variables de entorno estándar y validaremos con una API_KEY personalizada.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const API_KEY = process.env.CRM_API_KEY || 'emp_lab_secret_2026';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

        const { data, error } = await supabase
            .from('leads')
            .insert([
                {
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
                }
            ])
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, data }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
