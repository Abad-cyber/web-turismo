# 🌐 Guía de Demostración Web con LocalTunnel
## Sistema: Rutas del Altiplano - Puno

---

## ¿Qué es LocalTunnel?

LocalTunnel es una herramienta que convierte tu servidor local en una página web pública accesible desde cualquier dispositivo con internet. No necesitas contratar servidores ni pagar nada. El enlace es:
- **Seguro** (HTTPS cifrado)
- **Temporal** (activo solo cuando tú lo decides)
- **Instantáneo** (listo en segundos)

---

## 📋 Requisitos Previos

Antes de activar el túnel, asegúrate de:
1. ✅ Haber ejecutado el script `docs/schema.sql` en MySQL Workbench.
2. ✅ Tener configurado el archivo `config/.env` con tu contraseña de MySQL.
3. ✅ Haber instalado las dependencias con `npm install`.

---

## 🚀 Paso a Paso para Compartir la Web

### Paso 1: Iniciar el Servidor Node.js

Abre una terminal (PowerShell o CMD), navega al proyecto y ejecuta:

```bash
cd "c:\Users\abadp\Videos\INGENIERIA DE SOFTWARE\PROYECTO FINAL\proyecto"
npm start
```

Deberías ver:
```
✅ Conexión exitosa a la Base de Datos MySQL (rutas_puno_db)
🌄 Servidor Rutas del Altiplano corriendo en http://localhost:3000
```

**⚠️ No cierres esta terminal. El servidor debe seguir corriendo.**

---

### Paso 2: Activar el Túnel Web

Abre **una segunda terminal nueva** (sin cerrar la primera) y ejecuta:

```bash
cd "c:\Users\abadp\Videos\INGENIERIA DE SOFTWARE\PROYECTO FINAL\proyecto"
npm run tunnel
```

Verás un mensaje como:
```
your url is: https://rutas-puno-xyz123.loca.lt
```

Ese es tu enlace web público y temporal.

---

### Paso 3: Enviar el Enlace al Ingeniero/Evaluador

Copia el enlace (ejemplo: `https://rutas-puno-xyz123.loca.lt`) y envíalo por WhatsApp, correo o mensaje.

**El receptor podrá:**
- Abrir la web desde su celular, tablet o laptop.
- Registrarse como turista y explorar el catálogo.
- Hacer reservas de tours.
- Ver su ticket QR de confirmación.

---

### Paso 4: Ver las Acciones en Tiempo Real (MySQL Workbench)

Mientras el Ingeniero navega tu web, puedes abrir **MySQL Workbench** y ejecutar esta consulta para ver sus registros en vivo:

```sql
-- Ver usuarios nuevos registrados
SELECT nombre, email, rol FROM rutas_puno_db.usuarios ORDER BY id_usuario DESC LIMIT 5;

-- Ver reservas recientes
SELECT codigo_reserva, estado, monto_total FROM rutas_puno_db.reservas ORDER BY id_reserva DESC LIMIT 5;
```

---

### Paso 5: Apagar el Túnel cuando termines

Cuando quieras desactivar el acceso externo:
1. Ve a la segunda terminal (donde ejecutaste `npm run tunnel`).
2. Presiona **Ctrl + C**.

El enlace web dejará de funcionar inmediatamente. Tu servidor local seguirá corriendo en `http://localhost:3000`.

---

## ⚙️ Opciones Avanzadas

### Usar un nombre personalizado en la URL (opcional):
```bash
npx localtunnel --port 3000 --subdomain rutas-del-altiplano
```
Esto generará: `https://rutas-del-altiplano.loca.lt`
> ⚠️ El nombre personalizado puede no estar disponible si alguien más ya lo está usando.

---

## ❓ Preguntas Frecuentes

**¿El evaluador necesita instalar algo?**  
No. Solo necesita abrir el enlace en su navegador web.

**¿Los datos que ingrese el evaluador se guardan?**  
Sí. Todo lo que haga (registro, reservas, cotizaciones) se guarda en tu MySQL local y lo puedes ver en MySQL Workbench.

**¿Cuánto tiempo puede estar activo el enlace?**  
El tiempo que quieras, siempre que las dos terminales estén abiertas y tu computadora encendida.

**¿Qué pasa si cierro mi laptop?**  
El enlace deja de funcionar. Al volver a abrir la laptop, puedes repetir los Pasos 1 y 2 para generar un nuevo enlace.

**¿El enlace es siempre el mismo?**  
No, cada vez que activas el túnel se genera un enlace diferente (a menos que uses el parámetro `--subdomain`).
