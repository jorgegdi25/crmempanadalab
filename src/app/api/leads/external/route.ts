import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with Service Role Key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CRM_API_KEY = process.env.CRM_API_KEY || 'emp_lab_secret_2026';

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
        // 1. Validate API Key
        const apiKey = request.headers.get('x-api-key');
        if (apiKey !== CRM_API_KEY) {
            return NextResponse.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        // 2. Validate Service Key Availability
        if (!supabaseServiceKey) {
            console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
            return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            }
        });

        const body = await request.json();
        const { name, phone, email, product_interest, source, notes, country, city } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        const { data, error } = await supabase
            .from('leads')
            .insert([
                {
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
                }
            ])
            .select();

        if (error) {
            console.error('Error inserting external lead:', error);
            return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        return NextResponse.json({ success: true, lead: data[0] }, {
            status: 201,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });

    } catch (error: any) {
        console.error('Unexpected error in external lead API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
}
