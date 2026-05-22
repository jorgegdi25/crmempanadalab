import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        const subscription = await request.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: 'Subscription is required' }, { status: 400 });
        }

        // Guardar la suscripción en una tabla de Supabase llamada 'push_subscriptions'
        // Nota: El usuario debe crear esta tabla si no existe
        const { error } = await supabase
            .from('push_subscriptions')
            .upsert([{
                endpoint: subscription.endpoint,
                subscription_data: subscription,
                updated_at: new Date().toISOString()
            }], { onConflict: 'endpoint' });

        if (error) {
            // Si la tabla no existe, fallará. Podríamos intentar crearla o simplemente informar.
            console.error('Error saving subscription:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Push subscription error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
