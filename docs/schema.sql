-- ============================================================
-- SCRIPT SQL COMPLETO - Rutas del Altiplano S.A.C.
-- Base de datos: rutas_puno_db
-- Descripción: Crea todas las tablas e inserta datos iniciales
-- ============================================================

-- Crear base de datos si no existe y usarla
CREATE DATABASE IF NOT EXISTS rutas_puno_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rutas_puno_db;

-- ============================================================
-- TABLA: usuarios
-- Almacena los datos de todos los usuarios del sistema
-- Roles posibles: 'admin', 'operaciones', 'guia', 'cliente'
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(100)                              NOT NULL,
  email        VARCHAR(150)                              NOT NULL UNIQUE,
  password     VARCHAR(255)                              NOT NULL,
  rol          ENUM('admin','operaciones','guia','cliente') NOT NULL DEFAULT 'cliente',
  telefono     VARCHAR(20)                               NULL,
  created_at   TIMESTAMP                                 DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP                                 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: paquetes
-- Almacena el catálogo de paquetes turísticos disponibles
-- Categorías: 'Tradicional', 'Joya Oculta', 'Vivencial'
-- ============================================================
CREATE TABLE IF NOT EXISTS paquetes (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(200)  NOT NULL,
  categoria    ENUM('Tradicional','Joya Oculta','Vivencial') NOT NULL,
  precio       DECIMAL(10,2) NOT NULL,
  duracion     VARCHAR(50)   NOT NULL,
  altitud      VARCHAR(50)   NULL,
  dificultad   ENUM('Fácil','Moderado','Difícil') NOT NULL DEFAULT 'Fácil',
  cupos        INT           NOT NULL DEFAULT 10,
  descripcion  TEXT          NULL,
  imagen       VARCHAR(200)  NULL,
  activo       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: reservas
-- Registra las reservas realizadas por los clientes
-- Estados: 'pendiente', 'confirmada', 'cancelada', 'completada'
-- ============================================================
CREATE TABLE IF NOT EXISTS reservas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  codigo_reserva  VARCHAR(20)   NOT NULL UNIQUE,
  id_usuario      INT           NOT NULL,
  id_paquete      INT           NOT NULL,
  fecha_reserva   DATE          NOT NULL,
  pasajeros       INT           NOT NULL DEFAULT 1,
  precio_total    DECIMAL(10,2) NOT NULL,
  estado          ENUM('pendiente','confirmada','cancelada','completada') NOT NULL DEFAULT 'pendiente',
  codigo_qr       TEXT          NULL,
  notas           TEXT          NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reserva_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_reserva_paquete FOREIGN KEY (id_paquete) REFERENCES paquetes(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: solicitudes_medida
-- Almacena solicitudes de paquetes personalizados a medida
-- Estados: 'nueva', 'en_revision', 'cotizada', 'aceptada', 'rechazada'
-- ============================================================
CREATE TABLE IF NOT EXISTS solicitudes_medida (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario        INT           NOT NULL,
  nombre_contacto   VARCHAR(100)  NOT NULL,
  email_contacto    VARCHAR(150)  NOT NULL,
  telefono_contacto VARCHAR(20)   NULL,
  num_personas      INT           NOT NULL DEFAULT 1,
  fecha_viaje       DATE          NULL,
  destinos          TEXT          NOT NULL,
  servicios         TEXT          NULL,
  presupuesto       VARCHAR(100)  NULL,
  mensaje           TEXT          NULL,
  estado            ENUM('nueva','en_revision','cotizada','aceptada','rechazada') NOT NULL DEFAULT 'nueva',
  created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_solicitud_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ============================================================
-- DATOS INICIALES: Usuario Administrador por defecto
-- Password: 'admin123' (hash bcrypt rounds=10)
-- ============================================================
INSERT INTO usuarios (nombre, email, password, rol, telefono)
VALUES (
  'Admin Rutas',
  'admin@rutasdelaltiplano.pe',
  '$2a$10$mIIGp.beOvvTTOMrYgGdV.0wdLzKt4s4gYMuabUH0B8Fes/qXtkL2',
  'admin',
  '+51951847392'
)
ON DUPLICATE KEY UPDATE id = id; -- No duplicar si ya existe

-- ============================================================
-- DATOS INICIALES: 8 Paquetes Turísticos de Rutas del Altiplano
-- ============================================================
INSERT INTO paquetes (nombre, categoria, precio, duracion, altitud, dificultad, cupos, descripcion, imagen)
VALUES

-- 1. Islas Uros y Taquile (clásico del Titicaca)
(
  'Las Islas Sagradas del Titicaca',
  'Tradicional',
  85.00,
  '1 Día',
  '3,812 m.s.n.m.',
  'Fácil',
  20,
  'Embárcate en una experiencia única en el Lago Titicaca, el lago navegable más alto del mundo. Visitarás las fascinantes Islas Flotantes de los Uros, construidas artesanalmente con totora, donde conocerás la milenaria cultura aimara y su modo de vida ancestral. Luego navegarás hacia la hermosa Isla Taquile, famosa por sus telares declarados Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO. Disfrutarás de un almuerzo típico con vista panorámica al lago y descubrirás los secretos de la textilería taquileña. Una jornada completa de cultura, naturaleza y magia altiplánica.',
  'uros_taquile.jpg'
),

-- 2. Sillustani (chullpas funerarias)
(
  'Arqueología y Misterio Ancestral - Sillustani',
  'Tradicional',
  45.00,
  '½ Día',
  '3,890 m.s.n.m.',
  'Fácil',
  25,
  'Descubre el enigmático complejo arqueológico de Sillustani, ubicado a orillas de la Laguna Umayo. Este sitio alberga las imponentes Chullpas (torres funerarias) de la cultura Colla y Lupaca, construidas entre los siglos XII y XVI. Admira cómo estas torres cónicas de piedra, algunas de hasta 12 metros de altura, guardan los secretos de civilizaciones preincaicas. La combinación del paisaje altiplánico, la laguna y la majestuosidad de las chullpas crea una atmósfera de misterio y respeto profundo. Incluye guía especializado en arqueología andina y visita al museo de sitio.',
  'sillustani.jpg'
),

-- 3. Amantaní (vivencia nocturna en isla)
(
  'Vivencia y Leyenda en el Lago - Amantaní',
  'Tradicional',
  135.00,
  '2 Días / 1 Noche',
  '3,812 m.s.n.m.',
  'Fácil',
  15,
  'Sumérgete en la vida comunitaria de la mística Isla Amantaní, donde el tiempo parece detenerse. Convivirás con una familia local que te acogerá en su hogar, compartiendo sus costumbres, gastronomía tradicional y vestimentas típicas. Escalarás hasta los templos de Pacha Tata (Dios Tierra) y Pacha Mama (Madre Tierra), desde donde contemplarás una de las vistas más impresionantes del Lago Titicaca. Por la noche, participarás en una danza tradicional aymara. Al día siguiente, visitarás la Isla Taquile. Una experiencia de turismo vivencial que apoya directamente a las comunidades indígenas del lago.',
  'amantani.jpg'
),

-- 4. Aramu Muru (portal místico)
(
  'Misticismo y Portales del Altiplano - Aramu Muru',
  'Joya Oculta',
  75.00,
  '1 Día',
  '3,850 m.s.n.m.',
  'Moderado',
  12,
  'Adéntrate en uno de los lugares más misteriosos y energéticos del Perú: Aramu Muru, conocido popularmente como la "Puerta de los Dioses" o "Portal de Hayu Marka". Esta formación rocosa de origen inca, tallada en la roca viva a orillas del Lago Titicaca, presenta una enigmática hendidura en forma de cruz andina que según la tradición oral fue una puerta dimensional utilizada por sacerdotes incas. Explorarás los alrededores con guía local que compartirá las leyendas y relatos místicos asociados al lugar. El recorrido incluye meditación opcional y explicación de la cosmovisión andina. Un destino para quienes buscan conexión espiritual y aventura arqueológica.',
  'aramu_muru.jpg'
),

-- 5. Tinajani (cañón y bosque de piedras)
(
  'El Cañón y Bosque de Piedras - Tinajani',
  'Joya Oculta',
  90.00,
  '1 Día',
  '3,980 m.s.n.m.',
  'Moderado',
  10,
  'Descubre el espectacular Cañón de Tinajani, un paraíso natural poco conocido ubicado en la provincia de Melgar. Este cañón de formaciones rocosas únicas, esculpidas por milenios de viento y lluvia, alberga el llamado "Bosque de Piedras", donde las rocas adoptan formas antropomorfas y zoomorfas que estimulan la imaginación. El río Tinajani serpentea entre las paredes del cañón creando paisajes de ensueño. Realizarás una caminata de dificultad moderada por senderos naturales, observando flora y fauna altoandina endémica. Ideal para fotógrafos, amantes de la naturaleza y aventureros que buscan escapar de los circuitos turísticos convencionales.',
  'tinajani.jpg'
),

-- 6. Pucará y Lampa (ruta del torito)
(
  'La Ruta del Torito - Pucará y Lampa',
  'Joya Oculta',
  65.00,
  '1 Día',
  '3,900 m.s.n.m.',
  'Fácil',
  18,
  'Emprende la Ruta del Torito, un fascinante recorrido cultural por dos joyas arquitectónicas del altiplano puneño. En Pucará conocerás el origen del famoso "Torito de Pucará", símbolo de prosperidad del hogar peruano, visitando los talleres artesanales donde los alfareros elaboran estas piezas con técnicas ancestrales. Explorarás el Museo Lítico con la impresionante colección de esculturas precolombinas. Luego viajarás a Lampa, la hermosa "Ciudad Rosada", para maravillarte con su iglesia Santiago Apóstol del siglo XVII, que guarda una réplica de la Pietà de Miguel Ángel y el extraordinario osario subterráneo. Una jornada llena de arte, historia y tradición puneña.',
  'pucara.jpg'
),

-- 7. Llachón (kayak y turismo comunitario)
(
  'Convivencia y Kayak en Llachón',
  'Vivencial',
  120.00,
  '2 Días / 1 Noche',
  '3,812 m.s.n.m.',
  'Moderado',
  10,
  'Vive una aventura única en la Península de Llachón, joya del turismo comunitario en el Lago Titicaca. Esta experiencia combina deporte, naturaleza y cultura de manera auténtica. Practicarás kayak en las cristalinas aguas del Titicaca rodeado de totorales y con vistas a las islas, guiado por pescadores locales expertos. Te hospedarás con una familia comunera que te mostrará su forma de vida tradicional, compartiendo la pesca artesanal, la agricultura en andenes y la gastronomía local. Al amanecer, contemplarás uno de los amaneceres más hermosos del lago desde la orilla. Una experiencia que apoya el turismo responsable y el desarrollo de la comunidad de Llachón.',
  'llachon.jpg'
),

-- 8. Kutimbo (chullpas escondidas)
(
  'Necrópolis Escondida - Chullpas de Kutimbo',
  'Joya Oculta',
  55.00,
  '½ Día',
  '4,000 m.s.n.m.',
  'Moderado',
  15,
  'Aventúrate hacia uno de los sitios arqueológicos menos visitados y mejor conservados de la región: las Chullpas de Kutimbo. Ubicadas a 4,000 metros de altitud en la meseta altiplánica, estas impresionantes torres funerarias circulares y cuadradas de la cultura Lupaca destacan por la calidad de su construcción en piedra volcánica. A diferencia de Sillustani, Kutimbo ofrece una experiencia más íntima y auténtica, sin las multitudes turísticas. Encontrarás pinturas rupestres en la zona y una diversidad de aves altoandinas. El camino hacia el sitio atraviesa la pampa puneña donde pastorean llamas y alpacas. Perfecto para arqueólogos aficionados y viajeros que buscan experiencias fuera del circuito estándar.',
  'kutimbo.jpg'
);
