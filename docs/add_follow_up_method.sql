-- Agregar columna para el método de seguimiento
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS follow_up_method text;

-- Comentario para el esquema
COMMENT ON COLUMN leads.follow_up_method IS 'Método preferido o programado para el seguimiento (WhatsApp, Llamada, Email, Presencial)';
