-- Tabla para guardar suscripciones a notificaciones push
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint TEXT UNIQUE NOT NULL,
    subscription_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción y actualización (pública para el widget o controlada por API Key)
CREATE POLICY "Enable insert for all" ON push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all" ON push_subscriptions FOR SELECT USING (true);
CREATE POLICY "Enable update for all" ON push_subscriptions FOR UPDATE USING (true);
