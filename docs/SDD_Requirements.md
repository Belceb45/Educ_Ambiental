# Requerimientos del Sistema - EducAmbiental

Este documento consolida todos los requerimientos funcionales y no funcionales del proyecto **EducAmbiental**, reflejando la arquitectura actual y la estrategia de gamificación educativa.

## 1. Gestión de Roles de Acceso

El sistema cuenta con tres niveles de acceso claramente definidos:

1.  **Usuario Ciudadano:** Usuario final que consume contenido educativo, escanea productos, localiza centros y gana puntos/recompensas.
2.  **Administrador de Sistema (Soporte):** Responsable de la salud de la plataforma, gestión de cuentas de usuario y resolución de incidencias técnicas (Tickets).
3.  **Administrador de Contenido (Editor):** Responsable de mantener actualizado el catálogo de residuos, crear módulos interactivos, trivias, tips y artículos.

---

## 2. Requerimientos Funcionales (RF)

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| **RF1** | Registro de Usuario | Creación de cuentas nuevas con validación de correo y habilitación de perfil. | Alta |
| **RF2** | Inicio de Sesión | Acceso seguro mediante credenciales (JWT) y soporte para Google Sign-In. | Alta |
| **RF3** | Recuperación de Contraseña | Flujo de restablecimiento mediante códigos enviados al correo registrado. | Alta |
| **RF4** | Gestión de Roles | Implementación de permisos diferenciados para Ciudadano, Admin de Sistema y Admin de Contenido. | Alta |
| **RF5** | Navegador de Rutas | Protección de secciones privadas y gestión de sesiones activas. | Alta |
| **RF6** | Catálogo de Residuos | Visualización organizada de categorías de materiales (plástico, vidrio, papel, etc.). | Alta |
| **RF7** | Instrucciones de Disposición | Guías detalladas sobre cómo limpiar, separar y desechar correctamente cada material. | Alta |
| **RF8** | Búsqueda Predictiva | Buscador manual en el catálogo para identificar materiales por nombre de producto. | Alta |
| **RF9** | Escaneo de Productos | Identificación de materiales y guías mediante escaneo de códigos de barras (OpenFoodFacts). | Alta |
| **RF10** | Mapa Interactivo | Localización de centros de reciclaje cercanos sincronizados automáticamente con Datos Abiertos CDMX. | Alta |
| **RF11** | Detalle de Centro | Información de contacto, ubicación y materiales aceptados en cada punto de acopio. | Alta |
| **RF12** | Gestión de Tickets | Sistema para que el Admin de Sistema gestione reportes de problemas o dudas de usuarios. | Media |
| **RF13** | Gestión de Contenido | Interfaz para que el Admin de Contenido cree y edite Módulos, Trivias, Tips y Artículos. | Alta |
| **RF14** | Gamificación Educativa | Otorgamiento de puntos XP por completar actividades de aprendizaje en la plataforma. | Media |
| **RF15** | Panel de Impacto | Visualización del progreso del usuario: nivel actual, insignias ganadas y puntos acumulados. | Media |
| **RF16** | Sistema de Recompensas | Canje de puntos acumulados por cupones de descuento o beneficios digitales. | Alta |
| **RF17** | Ranking Comunitario | Tabla de clasificación de usuarios basada en su nivel de participación educativa. | Baja |
| **RF18** | Notificaciones | Alertas internas sobre nuevos contenidos, logros alcanzados o recordatorios de actividad. | Media |
| **RF19** | Dashboard Administrativo | Visualización de métricas globales: usuarios activos, contenido más visto y estado de tickets. | Alta |
| **RF20** | Soporte Multi-idioma | Interfaz preparada para internacionalización (i18n), soportando Español e Inglés. | Baja |
| **RF21** | Eliminación de Cuenta | Opción de borrado permanente de datos personales a solicitud del usuario. | Media |
| **RF22** | Visualización Offline | Cacheo de guías de reciclaje y mapas básicos para consulta sin conexión a internet. | Media |
| **RF23** | Panel de Administración Web | Aplicación web (React + Vite) con CRUD completo para las funciones administrativas: Dashboard, Tickets, Usuarios y Centros (`ADMIN_SYSTEM`); Contenido, Módulos, Materiales, Categorías y Recompensas (`ADMIN_CONTENT`). | Alta |
| **RF24** | Puntos de Acopio Externos (OSM) | Enriquecimiento del mapa con puntos de OpenStreetMap (Overpass) en un radio de 5 km: farmacias, contenedores de vidrio/plástico/e-waste/ropa y chatarrerías, con filtros por categoría y botón "Cómo llegar" (Apple/Google Maps). | Media |
| **RF25** | Tema Claro/Oscuro | Modo oscuro en la app: sigue el esquema del sistema por defecto y persiste la preferencia manual del usuario. | Baja |
| **RF26** | Inicio Personalizado | Pantalla de inicio del ciudadano con resumen de su progreso y tip del día (`GET /api/dashboard/inicio`). | Media |
| **RF27** | Páginas Informativas | Secciones de FAQ, Acerca de, Términos y Condiciones y formulario de Contacto en la app. | Baja |

---

## 3. Requerimientos No Funcionales (RNF)

| ID | Nombre | Descripción |
|----|--------|-------------|
| **RNF-01** | Interfaz Intuitiva | Diseño centrado en el usuario, siguiendo principios de UX/UI modernos y responsivos. |
| **RNF-02** | Rendimiento | Tiempos de respuesta óptimos en la carga de mapas y procesamiento de escaneo. |
| **RNF-03** | Seguridad | Cifrado de contraseñas (BCrypt) y protección de endpoints mediante Spring Security. |
| **RNF-04** | Disponibilidad | Arquitectura diseñada para garantizar el acceso al sistema 24/7. |
| **RNF-05** | Integridad de Datos | Sincronización confiable con APIs externas (CDMX, OpenFoodFacts). |
| **RNF-06** | Escalabilidad | Estructura de código modular que permite añadir nuevos tipos de contenido o recompensas fácilmente. |
| **RNF-07** | Mantenibilidad | Uso de estándares de desarrollo (N-Tier architecture, DTOs, Mappers) y documentación clara. |

---

## 4. Notas de Arquitectura
*   **Tres clientes, una API:** App móvil (este proyecto), Panel de Administración Web (`EducAmbientalAdmin`) y la API REST de Spring Boot (`EducAmibental-Backend`).
*   **Fuente de Mapas:** Sincronización vía API CKAN (Datos Abiertos CDMX) en el backend; la app además consulta Overpass (OSM) en tiempo real (RF24).
*   **Lógica de Gamificación:** Exclusivamente ligada a la interacción con contenido educativo.
*   **Base de Datos:** PostgreSQL con migraciones gestionadas por Flyway.

## 5. Notas de Alcance (Implementación)
*   **App ciudadano-only:** La app móvil cubre al Usuario Ciudadano. RF12 (Tickets), RF13 (Gestión de Contenido) y RF19 (Dashboard Admin) se operan desde el Panel de Administración Web (RF23).
*   **Impacto = XP puro:** El panel de impacto (RF15) usa XP, nivel e insignias reales; no maneja métricas físicas estimadas (CO₂, agua, árboles, kg). Nivel = `puntos / 1000 + 1`.
*   **Gamificación automatizada:** Completar un módulo (idempotente) otorga XP, sube de nivel, genera notificaciones (RF18) y desbloquea insignias.
*   **Mapa multiplataforma:** `react-native-maps` con Google Maps en Android y Apple Maps en iOS (Expo Go en iOS no incluye el SDK de Google Maps). Los centros propios se cachean para el modo offline (RF22).
*   **RF27 (Contacto):** El formulario de contacto existe como pantalla, pero aún no envía el reporte al sistema de tickets del backend.
*   **Google Sign-In (RF2):** Requiere development build con el módulo nativo; en Expo Go la app degrada con aviso, sin crashear.
