# 🗄️ Guía de Base de Datos MySQL Workbench
## Sistema: Rutas del Altiplano - Puno

---

## 📌 Requisitos
- MySQL Server 8.0 instalado
- MySQL Workbench 8.0 instalado
- El script `schema.sql` (en esta misma carpeta `docs/`)

---

## 📂 Paso 1: Abrir MySQL Workbench

1. Abre **MySQL Workbench** desde el menú de inicio de Windows.
2. En la pantalla principal, haz doble clic en tu conexión local (suele llamarse `Local instance MySQL80`).
3. Si te pide contraseña, ingresa la que configuraste al instalar MySQL.

---

## ⚡ Paso 2: Ejecutar el Script `schema.sql`

1. En el menú superior ve a: **File → Open SQL Script...**
2. Navega a la carpeta del proyecto: `proyecto/docs/`
3. Selecciona el archivo **`schema.sql`** y haz clic en **Abrir**.
4. El script se abrirá en una nueva pestaña del editor SQL.
5. Haz clic en el ícono de **Centella ⚡ (Execute All Statements)** en la barra de herramientas superior.
6. Espera que termine. En el panel inferior verás el progreso y los mensajes `Query OK`.

---

## ✅ Paso 3: Verificar que todo se creó correctamente

1. En el panel izquierdo (Schemas), haz clic derecho y selecciona **Refresh All**.
2. Deberías ver la base de datos **`rutas_puno_db`** en la lista.
3. Expande `rutas_puno_db → Tables` y verifica que existan estas 4 tablas:
   - `usuarios`
   - `paquetes`
   - `reservas`
   - `solicitudes_medida`

---

## 🔍 Paso 4: Consultar los datos iniciales

Puedes verificar que los datos semilla se cargaron correctamente ejecutando estas consultas:

```sql
-- Ver el usuario administrador creado
SELECT id_usuario, nombre, email, rol FROM rutas_puno_db.usuarios;

-- Ver los 8 paquetes turísticos cargados
SELECT id_paquete, titulo, categoria, precio FROM rutas_puno_db.paquetes;
```

Para ejecutar una consulta, escríbela en el editor y presiona **Ctrl + Shift + Enter** o el botón ⚡.

---

## 👀 Monitoreo en Tiempo Real (Durante la Demostración)

Cuando el Ingeniero/Evaluador ingrese al sistema desde el enlace de LocalTunnel, puedes ver sus acciones en tiempo real ejecutando estas consultas:

### Ver usuarios registrados (nuevos registros del evaluador):
```sql
SELECT id_usuario, nombre, email, rol, telefono 
FROM rutas_puno_db.usuarios 
ORDER BY id_usuario DESC;
```

### Ver todas las reservas realizadas:
```sql
SELECT 
  r.codigo_reserva,
  u.nombre AS turista,
  p.titulo AS tour,
  r.fecha_reserva,
  r.pasajeros,
  r.monto_total,
  r.estado
FROM rutas_puno_db.reservas r
JOIN rutas_puno_db.usuarios u ON r.id_usuario = u.id_usuario
JOIN rutas_puno_db.paquetes p ON r.id_paquete = p.id_paquete
ORDER BY r.id_reserva DESC;
```

### Ver solicitudes de ruta a la medida:
```sql
SELECT 
  s.id_solicitud,
  u.nombre AS solicitante,
  s.destinos_interes,
  s.fecha_tentativa,
  s.pasajeros,
  s.estado
FROM rutas_puno_db.solicitudes_medida s
JOIN rutas_puno_db.usuarios u ON s.id_usuario = u.id_usuario
ORDER BY s.id_solicitud DESC;
```

---

## ⚠️ Reiniciar la Base de Datos (Datos de Demostración)

Si quieres limpiar los datos de prueba y volver al estado inicial (solo el admin y los 8 tours), ejecuta:

```sql
-- Limpiar reservas y solicitudes de prueba (conserva paquetes y admin)
DELETE FROM rutas_puno_db.reservas WHERE id_reserva > 0;
DELETE FROM rutas_puno_db.solicitudes_medida WHERE id_solicitud > 0;
DELETE FROM rutas_puno_db.usuarios WHERE rol = 'turista';
ALTER TABLE rutas_puno_db.reservas AUTO_INCREMENT = 1;
ALTER TABLE rutas_puno_db.solicitudes_medida AUTO_INCREMENT = 1;
```

---

## 📊 Estructura Completa de Tablas

### Tabla `usuarios`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| id_usuario | INT PK AI | ID único del usuario |
| nombre | VARCHAR(100) | Nombre completo |
| email | VARCHAR(100) UNIQUE | Correo de login |
| password | VARCHAR(255) | Hash bcrypt de la contraseña |
| rol | VARCHAR(20) | turista / admin / operaciones / guia |
| telefono | VARCHAR(20) | Teléfono de contacto |

### Tabla `paquetes`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| id_paquete | INT PK AI | ID único del paquete |
| titulo | VARCHAR(150) | Nombre del tour |
| categoria | VARCHAR(50) | Tradicional / Joya Oculta / Vivencial / Místico |
| descripcion | TEXT | Descripción detallada del tour |
| precio | DECIMAL(10,2) | Precio por persona en soles |
| duracion | VARCHAR(50) | Duración del tour |
| altitud | VARCHAR(50) | Altitud en m.s.n.m. |
| dificultad | VARCHAR(20) | Fácil / Moderado / Exigente |
| cupos | INT | Cupos disponibles |
| imagen | VARCHAR(255) | Nombre del archivo de imagen |

### Tabla `reservas`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| id_reserva | INT PK AI | ID único de la reserva |
| codigo_reserva | VARCHAR(20) UNIQUE | Código legible (ej. RES-4821) |
| id_usuario | INT FK | Referencia a usuarios |
| id_paquete | INT FK | Referencia a paquetes |
| fecha_reserva | DATE | Fecha del tour |
| pasajeros | INT | Número de pasajeros |
| monto_total | DECIMAL(10,2) | Total cobrado |
| estado | VARCHAR(20) | Pendiente / Confirmado / Completado / Cancelado |
| codigo_qr | VARCHAR(255) | Texto del código QR del ticket |

### Tabla `solicitudes_medida`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| id_solicitud | INT PK AI | ID único de la solicitud |
| id_usuario | INT FK | Referencia a usuarios |
| destinos_interes | TEXT | Joyas ocultas o destinos solicitados |
| fecha_tentativa | DATE | Fecha propuesta por el turista |
| pasajeros | INT | Número estimado de personas |
| mensaje | TEXT | Mensaje adicional o peticiones especiales |
| estado | VARCHAR(20) | Pendiente / Cotizado / Atendido |
