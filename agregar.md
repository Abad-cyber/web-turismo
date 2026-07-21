# 📋 Plan de Mejoras e Integraciones - Rutas del Altiplano

> **Documento de especificaciones para implementar las mejoras acordadas sin afectar el código actual.**

---

## 🖼️ 1. Corrección y Asignación Única de Imágenes por Tour

### 🎯 Diagnóstico
Actualmente todas las tarjetas del catálogo de paquetes muestran la misma imagen repetida (`hero_banner.jpg`) en lugar de mostrar la fotografía representativa de cada destino.

### 🛠️ Cambios requeridos (a implementar):
- Asignar una imagen individual y diferenciada a cada uno de los 8 paquetes turísticos:
  1. **Uros y Taquile:** Fotografía de las islas flotantes de totora.
  2. **Sillustani:** Fotografía de las Chullpas funerarias frente a la Laguna Umayo.
  3. **Amantaní:** Fotografía del atardecer/templo Pachatata en la isla.
  4. **Aramu Muru:** Fotografía del portal místico esculpido en roca.
  5. **Tinajani:** Fotografía del cañón y bosque de piedras.
  6. **Pucará y Lampa:** Fotografía del Torito de Pucará / Templo rosado de Lampa.
  7. **Llachón:** Fotografía de deportes acuáticos/kayak en la península.
  8. **Kutimbo:** Fotografía de las Chullpas de piedra volcánica de Kutimbo.

---

## 📱 2. Actualización del Número Oficial de WhatsApp

### 🎯 Objetivo
Redirigir todas las consultas, soporte flotante y compartición de boletos QR al número oficial asignado.

### 🛠️ Cambios requeridos (a implementar):
- **Nuevo número oficial:** `+51 930 844 635` (Formato API: `51930844635`).
- Actualizar enlace del botón flotante en `index.html`.
- Actualizar función `compartirWhatsApp()` en `app.js`.
- Actualizar número de contacto en el pie de página (footer) y sección de contacto.

---

## ✨ 3. Rediseño Elegante, Iconografía Formal y Micro-animaciones Avanzadas

### 🎯 Objetivo
Elevar la presencia visual de la plataforma hacia un acabado corporativo de alto nivel, sustituyendo los emojis informales por un sistema de iconografía vectorial elegante y agregando animaciones fluidas.

### 🛠️ Cambios requeridos (a implementar):
1. **Sistema de Iconografía Vectorial / Formal:**
   - Reemplazar emojis por un conjunto de íconos vectoriales modernos y minimalistas (SVG / Lucide icons / FontAwesome).
   - Aplicar íconos formales en la barra de navegación, tarjetas de tours, badges de estado, ventanas modales y panel de control.
2. **Elevación Visual y Estilo Corporativo Premium:**
   - Refinar la paleta cromática con acabados metálicos/dorados sobrios, superficies en *glassmorphism* de alta resolución y bordes delgados con sutil brillo.
   - Tipografía corporativa con jerarquía visual estructurada para mayor elegibilidad en tablas, tarjetas y formularios.
3. **Micro-animaciones y Transiciones Dinámicas:**
   - Animaciones de entrada al hacer scroll (`fade-in-up`, `slide-in`, `staggered reveal` en tarjetas).
   - Efectos interactivos al pasar el cursor (*hover depth*, resplandor suave y micro-escalado en botones y tarjetas).
   - Transiciones fluidas al abrir modales, cambiar pestañas en el dashboard y mostrar notificaciones.

---

## 📧 4. Integración de la API de Correo Gmail (Nodemailer / SMTP)

### 🎯 Objetivo
Permitir que el sistema envíe correos electrónicos automáticos de confirmación cuando:
- Un turista se registra en la plataforma.
- Se genera una nueva reserva (adjuntando el resumen del tour y código de ticket).
- El Administrador u Operaciones responde una cotización personalizada.

### 🛠️ Cambios requeridos (a implementar):
1. **Instalación de paquete:** `npm install nodemailer`
2. **Variables de entorno (`config/.env`):**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASS=tu_contraseña_de_aplicacion_gmail
   ```
3. **Servicio `emailService.js`:** Crear módulo encubierto de envío de plantillas HTML.

---

## 🗺️ 5. Corrección y Optimización de la API de Mapas (Leaflet / OpenStreetMap)

### 🎯 Diagnóstico del problema actual
El mapa interactivo en `#mapa-tours` no se renderiza en ciertos navegadores o resoluciones debido a:
1. Dimensionamiento inicial del contenedor HTML/CSS cuando la página carga en segundo plano.
2. Falta del evento `mapa.invalidateSize()` al hacer scroll hasta la sección del mapa.

### 🛠️ Cambios requeridos (a implementar):
1. **Ajuste CSS:** Garantizar un `min-height: 450px` explícito y posición relativa en `#mapa-tours`.
2. **Ajuste JS (`app.js`):** Usar `IntersectionObserver` para ejecutar `map.invalidateSize()` en cuanto la sección de mapa entre a la vista.

---

## 👑 6. Módulo CRUD Completo de Usuarios para el Administrador

### 🎯 Objetivo
Permitir que el Administrador tenga control absoluto sobre todas las cuentas del sistema desde el panel.

### 🛠️ Cambios requeridos (a implementar):
1. **Backend (Nuevos Endpoints en Express):**
   - `POST /api/usuarios` ➔ Crear directamente un nuevo usuario (turista, guía o personal de operaciones).
   - `PUT /api/usuarios/:id` ➔ Modificar nombre, correo, teléfono o rol de cualquier usuario.
   - `DELETE /api/usuarios/:id` ➔ Eliminar/dar de baja una cuenta de usuario.
2. **Frontend (Panel Admin):**
   - Formulario modal *"Nuevo Usuario"*.
   - Botones de *"Editar"* y *"Eliminar"* en cada fila de la tabla de usuarios.

---

## 👤 7. Módulo de Perfil del Usuario / Turista ("Mi Perfil")

### 🎯 Objetivo
Brindar autonomía al turista para gestionar su información personal.

### 🛠️ Cambios requeridos (a implementar):
1. **Backend:**
   - `PUT /api/auth/profile` ➔ Actualizar datos personales y/o cambiar contraseña del usuario autenticado.
2. **Frontend:**
   - Nueva pestaña *"Mi Perfil"* en el Dashboard del usuario.
   - Formulario para actualizar nombre, teléfono y cambiar contraseña de forma segura.

---

## ⚙️ 8. Documentación y Control Operativo: Stock (Cupos) y Tiempo (Fechas)

### 🎯 Diagnóstico
Explicación detallada y optimización visual de los mecanismos automáticos de control de disponibilidad, duraciones y filtros de fechas en la plataforma.

### 🛠️ Mecanismos de Control Implementados / Reforzados:
1. **Control de Stock / Cupos por Paquete:**
   - Verificación previa en `reservaService.js` antes de procesar cualquier reserva.
   - Descuento automático de cupos al confirmar reserva (`cupos = cupos - personas`).
   - Restauración automática de cupos si la reserva se marca como `cancelada`.
   - Edición manual de cupos disponibles desde el módulo de administración de tours.
2. **Control del Tiempo y Fechas:**
   - Bloqueo en frontend de fechas pasadas (`min = fecha_actual`).
   - Muestra explícita de duraciones de tours en tarjetas, detalle y boletos QR (`duracion`).
   - Filtro de manifiestos por fecha específica para Guías y Operaciones.

---

*Fecha de última actualización: 21 de Julio de 2026*  
*Estado: Pendiente de aprobación para proceder con la edición de código.*
