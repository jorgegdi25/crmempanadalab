-- 1. Crear tabla de LEADS
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT, -- 'empanadas-paisanas', 'colbrew', 'chococol'
    interest TEXT,
    status TEXT DEFAULT 'nuevo', -- 'nuevo', 'contactado', 'interesado', 'cerrado', 'descartado'
    assigned_to UUID REFERENCES auth.users(id),
    last_contact_at TIMESTAMPTZ
);

-- 2. Crear tabla de INTERACCIONES
CREATE TABLE IF NOT EXISTS interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    type TEXT, -- 'whatsapp', 'llamada', 'correo', 'nota'
    content TEXT
);

-- 3. Habilitar RLS (Seguridad)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas básicas (Solo usuarios autenticados pueden ver/editar)
CREATE POLICY "Permitir lectura para usuarios autenticados" ON leads
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserción para usuarios autenticados" ON leads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización para usuarios autenticados" ON leads
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Repetir para interactions
CREATE POLICY "Permitir todo para usuarios autenticados" ON interactions
    FOR ALL USING (auth.role() = 'authenticated');
