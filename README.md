# 🌄 Rutas del Altiplano - Plataforma Web de Turismo Puno S.A.C.

> **Agencia de Turismo & Experiencias Puno** | Rutas Tradicionales y Joyas Ocultas del Altiplano  
> 🌐 **Despliegue en Producción (Online):** [https://web-turismo.onrender.com](https://web-turismo.onrender.com)

---

## 📋 Tabla de Contenidos
1. [Despliegue en Producción (Render + Aiven)](#despliegue-en-producción-render--aiven)
2. [Requisitos Previos](#requisitos-previos)
3. [Instalación Paso a Paso](#instalación-paso-a-paso)
4. [Configurar Base de Datos MySQL](#configurar-base-de-datos-mysql)
5. [Configurar Variables de Entorno](#configurar-variables-de-entorno)
6. [Iniciar el Servidor](#iniciar-el-servidor)
7. [Usuarios de Prueba](#usuarios-de-prueba)
8. [Solución de Problemas Frecuentes](#solución-de-problemas-frecuentes)

---

## ✅ Requisitos Previos

Antes de iniciar, asegúrate de tener instalado en tu computadora:

| Software | Versión Recomendada | Descarga |
| :--- | :--- | :--- |
| **Node.js** | v18 o superior | https://nodejs.org/es/ |
| **MySQL Community Server** | v8.0 | https://dev.mysql.com/downloads/ |
| **MySQL Workbench** | v8.0 | https://dev.mysql.com/downloads/workbench/ |

Para verificar que tienes Node.js instalado, abre una terminal y ejecuta:
```bash
node --version
npm --version
```
Deberías ver algo como `v18.x.x`.

---

## 🚀 Instalación Paso a Paso

### Paso 1: Ir a la carpeta del proyecto
Abre una terminal (PowerShell o CMD) y navega a la carpeta del proyecto:
```bash
cd "c:\Users\abadp\Videos\INGENIERIA DE SOFTWARE\PROYECTO FINAL\proyecto"
```

### Paso 2: Instalar dependencias de Node.js
Ejecuta el siguiente comando. Esto descargará todas las librerías necesarias:
```bash
npm install
```
Verás aparecer la carpeta `node_modules/`. Esto puede tardar 1-2 minutos.

---

## 🗄️ Configurar Base de Datos MySQL

### Paso 3: Abrir MySQL Workbench
1. Abre **MySQL Workbench** en tu computadora.
2. Haz clic en tu conexión local (generalmente `Local instance MySQL80` o similar).
3. Ingresa tu contraseña de MySQL si te la pide.

### Paso 4: Ejecutar el Script de Base de Datos
1. En MySQL Workbench, ve al menú: **File → Open SQL Script...**
2. Navega hasta la carpeta del proyecto y selecciona: `docs/schema.sql`
3. Haz clic en **Open**.
4. Cuando se abra el script, haz clic en el botón de la **centella ⚡ (Execute All)** en la barra de herramientas.
5. Espera a que termine. Deberías ver en la parte inferior el mensaje: `Query OK` en todas las líneas.

> ✅ Esto creará automáticamente:
> - La base de datos `rutas_puno_db`
> - Las 4 tablas: `usuarios`, `paquetes`, `reservas`, `solicitudes_medida`
> - 1 usuario administrador por defecto
> - Los 8 paquetes turísticos de Puno precargados

### Paso 5: Verificar que la BD se creó correctamente
En MySQL Workbench, en el panel izquierdo (Schemas), haz clic derecho → **Refresh All**. Deberías ver aparecer `rutas_puno_db`. Expándela y verifica que existan las 4 tablas.

---

## ⚙️ Configurar Variables de Entorno

### Paso 6: Crear el archivo `.env`
1. En la carpeta `config/` del proyecto, encontrarás un archivo llamado `.env.example`.
2. **Copia ese archivo** y renómbralo a `.env` (sin la parte `.example`).
3. Abre el archivo `.env` con cualquier editor de texto y ajusta la contraseña de MySQL:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_DE_MYSQL_AQUI
DB_NAME=rutas_puno_db
JWT_SECRET=rutas_del_altiplano_puno_secret_key_2026
```

> ⚠️ **Importante:** Reemplaza `TU_CONTRASEÑA_DE_MYSQL_AQUI` con la contraseña real de tu instalación de MySQL Workbench.

---

## ▶️ Iniciar el Servidor

### Paso 7: Iniciar la aplicación web
Con la terminal en la carpeta del proyecto, ejecuta:
```bash
npm start
```

Deberías ver en la consola:
```
✅ Conexión exitosa a la Base de Datos MySQL (rutas_puno_db)
🌄 Servidor Rutas del Altiplano corriendo en http://localhost:3000
```

### Paso 8: Abrir la página web en tu navegador
Abre tu navegador (Chrome, Edge, Firefox) y ve a:
```
http://localhost:3000
```

¡La página web de **Rutas del Altiplano** debería cargar completamente! 🎉

---

## 🌐 Activar Demostración Web con LocalTunnel

Cuando quieras compartir la web con el Ingeniero, el Profesor u otra persona desde su celular o laptop, sigue estos pasos:

### Paso 9: Iniciar el túnel web (con el servidor ya corriendo)
Abre **una nueva terminal** (sin cerrar la que tiene el servidor corriendo) y ejecuta:
```bash
npm run tunnel
```
O directamente:
```bash
npx localtunnel --port 3000
```

Verás en la consola un enlace como:
```
your url is: https://rutas-puno-altiplano.loca.lt
```

### Paso 10: Enviar el enlace
Copia ese enlace y envíalo por WhatsApp, correo o mensaje. La persona podrá abrir la web desde cualquier dispositivo con internet sin instalar nada.

> 🔒 El enlace usa HTTPS (cifrado) y es seguro.
> ⏱️ El enlace estará activo mientras tengas la terminal abierta. Al cerrarla, el enlace se desactiva.

---

## 👤 Usuarios de Prueba

El sistema viene con un usuario administrador precargado:

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@rutasdelaltiplano.pe` | `admin123` |

Para crear turistas, utiliza el formulario de **Registro** en la página web.

Para crear Guías o Agentes de Operaciones, ingresa como Admin y ve al **Panel → Gestión de Usuarios** para cambiar el rol de cualquier usuario registrado.

---

## 🛠️ Solución de Problemas Frecuentes

### ❌ Error: "Cannot connect to MySQL"
**Causa:** Contraseña incorrecta en el archivo `.env`  
**Solución:** Verifica que `DB_PASSWORD` en `config/.env` sea exactamente tu contraseña de MySQL Workbench.

### ❌ Error: "Port 3000 is already in use"
**Causa:** Hay otro proceso usando el puerto 3000.  
**Solución:** Cambia `PORT=3001` en tu archivo `config/.env` y reinicia el servidor. Luego accede a `http://localhost:3001`.

### ❌ Error: "node_modules not found"
**Causa:** No se instalaron las dependencias.  
**Solución:** Ejecuta `npm install` en la carpeta del proyecto.

### ❌ La base de datos no aparece en MySQL Workbench
**Causa:** El script SQL no se ejecutó correctamente.  
**Solución:** En MySQL Workbench, haz clic derecho en el panel izquierdo → **Refresh All** y vuelve a ejecutar el script `docs/schema.sql`.

---

## 📞 Información de Contacto de la Empresa
- **RUC:** 20609876541
- **Dirección:** Jirón Lima N° 458, Plaza de Armas, Puno - Perú
- **WhatsApp:** +51 951 847 392
- **Correo:** contacto@rutasdelaltiplano.pe
- **Horarios:** Lunes a Domingo 6:00 a.m. - 9:00 p.m.
