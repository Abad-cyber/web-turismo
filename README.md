# 🌄 Rutas del Altiplano - Plataforma Web de Turismo Puno S.A.C.

**Agencia de Turismo & Experiencias Puno** | Rutas Tradicionales y Joyas Ocultas del Altiplano

> 🌐 **Enlace Oficial de la Web (En Vivo):** [https://web-turismo.onrender.com](https://web-turismo.onrender.com)

---

## 📖 Manual de Usuario

Bienvenido a la plataforma de gestión y reservas de **Rutas del Altiplano**. A continuación, te explicamos cómo utilizar las principales funciones del sistema según tu rol.

### 1. Perfil de Cliente (Turista)
Como turista, puedes explorar nuestros paquetes y realizar reservas directamente desde la web:
* **Explorar Tours:** En la página principal, visualiza todos los tours disponibles. Haz clic en "Ver detalles" para leer el itinerario completo, qué incluye y recomendaciones.
* **Reservar:** Dentro de un tour, selecciona la fecha, cantidad de pasajeros y haz clic en "Reservar Ahora". 
* **Mis Reservas:** Una vez registrado, dirígete a tu **Panel de Usuario**. Allí verás la pestaña **"Mis Reservas"**.
* **Tickets Virtuales:** En tus reservas, puedes hacer clic en **"Ticket"** para generar tu boleto digital con código QR para presentarlo el día del tour.

### 2. Perfil de Operador / Guía
Si eres parte del equipo de operaciones, tienes herramientas especiales para la gestión diaria:
* **Todas las Reservas:** Al ingresar, verás una tabla con todas las reservas del sistema. Puedes filtrar por fechas y cambiar el estado (Pendiente, Confirmada, Cancelada, Completada) de manera inmediata.
* **Visualizar Tickets:** Junto al selector de estado, tienes un botón rápido para ver el Ticket del cliente con sus datos completos.
* **Manifiestos de Pasajeros:** En la pestaña **Manifiesto**, puedes generar la lista oficial de pasajeros para un tour específico en una fecha determinada. Ideal para imprimir y entregar al guía antes de la salida.
* **Cotizaciones a Medida:** Si un cliente solicita un tour personalizado, podrás revisar sus solicitudes y actualizar el estado de la cotización.

### 3. Perfil de Administrador
El administrador tiene control total sobre el sistema, incluyendo las funciones del Operador, más:
* **Gestión de Paquetes:** Puede añadir nuevos tours, editar precios, cambiar imágenes y actualizar itinerarios desde la pestaña **Tours (Admin)**.
* **Gestión de Usuarios:** Puede visualizar a todos los clientes registrados y cambiarles el rol (convertir un cliente en Guía, Operador o Administrador).

---

## 🚀 Tecnologías y Arquitectura

El sistema ha sido desarrollado bajo un enfoque Full-Stack moderno:
* **Frontend:** HTML5, CSS3, JavaScript Vanilla. (Diseño Responsive, moderno e interactivo utilizando componentes dinámicos y la librería de íconos Lucide).
* **Backend:** Node.js con Express.js. Arquitectura basada en Patrón MVC (Modelos, Controladores, Rutas y Servicios).
* **Base de Datos:** MySQL v8.0.
* **Seguridad:** Encriptación de contraseñas con bcryptjs, y protección de rutas con JSON Web Tokens (JWT).

---

## 🛠️ Instalación Local (Para Desarrolladores)

### Requisitos Previos
* Node.js v18+
* MySQL Server v8.0

### Pasos de Instalación
1. Clona el repositorio e instala las dependencias:
   `ash
   git clone https://github.com/Abad-cyber/web-turismo.git
   cd web-turismo
   npm install
   `
2. Ejecuta el script de la base de datos docs/schema.sql en MySQL Workbench para crear las tablas y paquetes predeterminados.
3. Crea un archivo .env en la carpeta config/ basado en .env.example:
   `env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña
   DB_NAME=rutas_puno_db
   JWT_SECRET=super_secret_key
   `
4. Inicia el servidor:
   `ash
   npm start
   `
5. Abre en tu navegador http://localhost:3000.

---

## 📞 Soporte y Contacto
* **RUC:** 20609876541
* **Dirección:** Jirón Lima N° 458, Plaza de Armas, Puno - Perú
* **WhatsApp:** +51 951 847 392
* **Correo:** contacto@rutasdelaltiplano.pe
