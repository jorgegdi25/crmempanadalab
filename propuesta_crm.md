# Propuesta Técnica: CRM Empanadas Lab

## 1. Resumen Ejecutivo
El objetivo es desarrollar una plataforma centralizada ("Empanadas Lab CRM") para gestionar la relación con clientes (leads) provenientes de las múltiples marcas del grupo: **Empanadas Paisanas**, **Colbrew**, **Chococol**, y futuras iniciativas.

Actualmente, los datos llegan de forma dispersa (probablemente correos). El CRM unificará estas entradas en una sola base de datos, permitiendo un seguimiento profesional, métricas de conversión y tiempos de respuesta ágiles.

---

## 2. Arquitectura del Proyecto

### 2.1. Independencia
El CRM será un **proyecto de software independiente** (Standalone App).
*   **Dominio Sugerido:** `crm.empanadaslab.com` o `admin.empanadaslab.com`.
*   **Ventaja:** Si una landing page cambia, se cae o se rediseña, el CRM sigue operativo. La lógica de negocio no se mezcla con la presentación.

### 2.2. Flujo de Datos
1.  **Captura:** El usuario llena un formulario en `empanadapaisana.com` o `colbrew.com.co`.
2.  **Envío (Webhook):** La web envía los datos silenciosamente a la API del CRM.
3.  **Procesamiento:** El CRM recibe la data, identifica la marca de origen (`source: 'colbrew'`) y crea un "Nuevo Lead".
4.  **Notificación:** El administrador recibe una alerta (email/push).
5.  **Gestión:** El administrador entra al CRM, revisa el lead y ejecuta acciones (WhatsApp/Llamada).

---

## 3. Stack Tecnológico Sugerido

Se presentan dos caminos viables. Se recomienda la **Opción A** por escalabilidad y experiencia de usuario "tipo app".

### Opción A: Stack Moderno (Recomendada)
*   **Frontend (Interfaz):** Next.js (React). Permite una interfaz súper rápida, interactiva y con componentes ricos (modales, drag-and-drop).
*   **Backend / Base de Datos:** Supabase o Firebase.
    *   Manejan la autenticación segura (Login) "out of the box".
    *   Base de datos en tiempo real (ves llegar los leads sin recargar la página).
*   **Hosting:** Vercel (Frontend) + Supabase Cloud (Backend).

### Opción B: Stack Tradicional (Hostinger)
*   **Framework:** Laravel (PHP) o CodeIgniter.
*   **Base de Datos:** MySQL.
*   **Infraestructura:** Se aloja en el mismo hosting actual.
*   **Pros:** Costo cero adicional inicial.
*   **Contras:** Interfaces menos "fluidas" (requieren recargas), mayor esfuerzo en seguridad manual.

---

## 4. Funcionalidades Clave

### 4.1. Autenticación y Roles
*   Login seguro para administradores.
*   Posibilidad de roles: "Vendedor" (solo ve sus leads) vs "Admin" (ve todo), si el equipo crece.

### 4.2. Dashboard Unificado
*   Vista rápida de LEADS HOY / SEMANA.
*   Gráfico de torta: Leads por Marca (¿Quién trae más gente? ¿Colbrew o Empanadas?).

### 4.3. Gestión de Leads (Pipeline)
Vista tipo tablero (Kanban) o Lista inteligente con estados:
1.  **Nuevo:** Acaba de llegar, nadie lo ha tocado.
2.  **Contactado:** Ya se le escribió/llamó.
3.  **Interesado / En Cotización:** Pidió precios.
4.  **Cerrado / Venta:** ¡Éxito!
5.  **Descartado:** No interesado o spam.

### 4.4. Acciones Rápidas ("One-Click")
Desde la ficha del cliente, botones directos para no perder tiempo copiando y pegando:
*   🟢 **WhatsApp:** Abre WhatsApp Web con la API `wa.me` y un mensaje precargado: *"Hola [Nombre], te escribo de Empanadas Lab respecto a tu interés en..."*
*   📧 **Correo:** Abre el cliente de correo con asunto y cuerpo base.
*   📞 **Llamar:** En móvil, marca el número directamente.

### 4.5. Historial de Interacciones (Bitácora)
Pequeña sección de "Notas" por cliente.
*   *"Le llamé el lunes, dijo que volviera a llamar el viernes a las 3 PM."*
*   Permite que cualquier vendedor sepa en qué quedó la conversación anterior.

---

## 5. Integración (Cómo conectar las webs actuales)

No es necesario rehacer las webs actuales. Solo se añade una pequeña pieza de código en el script de envío de formulario (`send_mail.php` o JS):

```javascript
// Ejemplo conceptual
const datosLead = {
    nombre: "Juan Perez",
    telefono: "3001234567",
    interes: "Distribución",
    origen: "empanadapaisana.com" // <--- CLAVE
};

// Enviar al CRM
fetch('https://api.empanadaslab.com/v1/leads', {
    method: 'POST',
    body: JSON.stringify(datosLead)
});
```

## 6. Siguientes Pasos
1.  Definir el stack tecnológico preferido.
2.  Diseñar la base de datos (Tabla `Leads`, Tabla `Interacciones`, Tabla `Usuarios`).
3.  Crear el repositorio del nuevo proyecto.
