# 🌐 Planificación y Despliegue en Producción - Rutas del Altiplano

> **Plataforma Web de Turismo y Operaciones | Rutas Tradicionales y Joyas Ocultas en Puno**  
> **Estado:** 🚀 **EN PRODUCCIÓN (ONLINE)**

---

## 📌 1. Arquitectura de Despliegue en la Nube

| Componente | Tecnología / Proveedor | URL / Endpoint / Configuración |
| :--- | :--- | :--- |
| **Aplicación Web (Node.js + Express)** | **Render.com** (Web Service Free) | 🌐 [https://web-turismo.onrender.com](https://web-turismo.onrender.com) |
| **Base de Datos Relacional** | **Aiven.io** (MySQL Cloud Service) | 🗄️ `mysql-rutas-puno-rutas-puno.d.aivencloud.com:12136` |
| **Control de Versiones y CI/CD** | **GitHub** | 🐙 [https://github.com/Abad-cyber/web-turismo.git](https://github.com/Abad-cyber/web-turismo.git) |

---

## ⚙️ 2. Variables de Entorno en Producción (Render.com)

La aplicación en Render.com está configurada con las siguientes variables de entorno para conectarse automáticamente a la base de datos MySQL en la nube (Aiven):

```env
PORT=3000
DB_HOST=mysql-rutas-puno-rutas-puno.d.aivencloud.com
DB_PORT=12136
DB_USER=avnadmin
DB_PASSWORD=********
DB_NAME=rutas_puno_db
JWT_SECRET=rutas_del_altiplano_puno_secret_key_2026
```

---

## 🔄 3. Flujo de Trabajo para Correcciones y Desarrollo (Workflow)

Para corregir errores y probar nuevas funcionalidades de forma segura sin romper la web en producción:

1. **Desarrollo y Pruebas Locales:**
   * Iniciar el servidor local: `npm run dev`
   * Probar en el navegador local: `http://localhost:3000`
   * Verificar que las correcciones funcionen perfectamente.

2. **Publicar Cambios a Producción (GitHub ➔ Render):**
   * Una vez probado en local, subir los cambios en **Git Bash**:
     ```bash
     git add .
     git commit -m "Descripción de la corrección realizada"
     git push origin main
     ```
   * **Despliegue Automático:** Render detectará el `push` y actualizará automáticamente la web pública en [https://web-turismo.onrender.com](https://web-turismo.onrender.com).

---

## 🔑 4. Credenciales de Prueba en Producción

* **Rol Administrador:**
  * **Email:** `admin@rutasdelaltiplano.pe`
  * **Contraseña:** `admin123`
* **Catálogo Precargado:** 8 Paquetes Turísticos de Puno (Uros, Taquile, Sillustani, Amantaní, Aramu Muru, Tinajani, Pucará/Lampa, Llachón, Kutimbo).

---

## 📝 5. Próximas Mejoras y Plan de Corrección de Errores

1. Refactorización y pulido de funciones JavaScript frontend en `app.js`.
2. Verificación de flujo completo de reservas, generación de tickets QR y botón WhatsApp (`+51 930 844 635`).
3. Pruebas de compatibilidad responsive en navegadores móviles.
