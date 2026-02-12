# Esquema de Base de Datos - Empanadas Lab CRM

Este documento detalla la estructura de la base de datos en Supabase (PostgreSQL).

## Tabla: `leads`
Almacena la información de los prospectos capturados desde las landing pages.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` | Identificador único (PK). |
| `created_at` | `timestamptz` | Fecha de creación del lead. |
| `name` | `text` | Nombre completo del contacto. |
| `email` | `text` | Correo electrónico. |
| `phone` | `text` | Número de contacto (WhatsApp). |
| `source` | `text` | Marca de origen (`empanadas-paisanas`, `colbrew`, `chococol`, etc). |
| `interest` | `text` | Tipo de interés (`distribución`, `franquicia`, `compra`, etc). |
| `status` | `text` | Estado actual: `nuevo`, `contactado`, `interesado`, `cerrado`, `descartado`. |
| `assigned_to` | `uuid` | Referencia al usuario administrador asignado. |
| `last_contact_at` | `timestamptz` | Fecha del último contacto realizado. |

## Tabla: `interactions`
Almacena el historial de contacto y notas para cada lead.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` | Identificador único (PK). |
| `created_at` | `timestamptz` | Fecha de la interacción. |
| `lead_id` | `uuid` | Referencia al lead. |
| `user_id` | `uuid` | Referencia al usuario que realizó la acción. |
| `type` | `text` | Tipo: `whatsapp`, `llamada`, `correo`, `nota`. |
| `content` | `text` | Detalle de la conversación o nota. |

## SQL para Supabase (Concepto)

```sql
-- Habilitar RLS es mandatorio después de crear
-- CREATE TABLE leads (...)
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
```
