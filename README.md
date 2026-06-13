# EducAmbiental

EducAmbiental es una aplicación móvil diseñada para fomentar la educación ambiental, facilitar el reciclaje y permitir a los usuarios realizar un seguimiento de su impacto ecológico positivo. El proyecto utiliza un enfoque de Desarrollo Basado en Especificaciones (SDD) para asegurar que cada funcionalidad responda a una necesidad real identificada.

## Caracteristicas Principales

La app movil esta enfocada al **Usuario Ciudadano**. La administracion (contenido, tickets, usuarios, metricas) se opera desde el panel web `EducAmbientalAdmin`, que consume la misma API.

### Para el Ciudadano
*   Mapa Interactivo: Encuentra centros de reciclaje cercanos mediante GPS, enriquecido con puntos de OpenStreetMap (farmacias, contenedores de vidrio/plastico/e-waste/ropa) con filtros por categoria y boton "Como llegar".
*   Catalogo de Residuos: Guias detalladas sobre como separar y disponer correctamente de diferentes materiales (plastico, vidrio, etc.).
*   Escáner de Productos: Identifica materiales y obtén sugerencias de reciclaje escaneando el código de barras.
*   Inicio personalizado con resumen de progreso y tip del dia.
*   Tema claro/oscuro, idioma ES/EN y modo offline para datos criticos.

### Gamificacion (XP puro)
*   Aprende y gana: completa modulos educativos para acumular XP y subir de nivel.
*   Recompensas: canjea tus puntos por codigos de descuento.
*   Ranking comunitario: compite por el top de XP.
*   Perfil de impacto: nivel, barra de XP e insignias reales desbloqueadas.
*   Notificaciones: avisos de XP, subidas de nivel, insignias y canjes (con badge en el encabezado).

## Stack Tecnologico

*   Framework: Expo SDK 54 con React Native 0.81 y React 19.
*   Lenguaje: TypeScript para un desarrollo robusto y tipado.
*   Navegacion: Expo Router 6 (navegacion basada en archivos, rutas tipadas).
*   Mapas: react-native-maps (Google Maps en Android, Apple Maps en iOS) + expo-location + Overpass (OSM).
*   Camara: expo-camera para el escaner de codigos de barras.
*   Datos: expo-secure-store (JWT, tema y cache offline) y netinfo (deteccion de conexion).
*   i18n: i18next / react-i18next (ES/EN).
*   Animaciones: React Native Reanimated 4 para una experiencia de usuario fluida.
*   Calidad: ESLint con configuracion de Expo.

Ver el detalle completo en [docs/SDD_Stack.md](docs/SDD_Stack.md).

## Arquitectura del Sistema

El sistema completo son tres proyectos sobre una misma API REST: esta app movil (ciudadano), el panel web `EducAmbientalAdmin` (administradores) y el backend Spring Boot `EducAmibental-Backend`.

La app sigue una arquitectura moderna y escalable:
-   Context Providers: AuthContext (sesion JWT + Google Sign-In) y ThemeContext (tema claro/oscuro persistente).
-   Navegacion por grupos de Expo Router: `(auth)` para autenticacion y paginas publicas, `(tabs)` para el flujo principal con guardia de rutas.
-   Capa de servicios (`services/api.ts`): cliente HTTP con token JWT y un servicio por recurso del backend.
-   Modo Offline: cache local para asegurar que la informacion critica este disponible siempre.

Ver el detalle en [docs/SDD_Architecture.md](docs/SDD_Architecture.md).

## Estructura del Proyecto

-   /app: Rutas de la aplicacion (Expo Router): `(auth)` y `(tabs)`.
-   /components: Componentes de UI reutilizables.
-   /constants: Temas, colores, i18n y configuraciones globales.
-   /context: Providers de estado global (Auth, Theme).
-   /services: Cliente HTTP y servicios de la API.
-   /docs: Documentacion detallada del diseño del sistema (SDD).
-   /hooks: Hooks personalizados para logica compartida.
-   /assets: Imagenes, fuentes e iconos.

## Comenzando

### Requisitos Previos
-   Node.js instalado.
-   Expo Go en tu dispositivo movil o un emulador configurado.

### Instalacion
1.  Clona el repositorio.
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Inicia el proyecto:
    ```bash
    npx expo start
    ```

---
Este proyecto es parte de la iniciativa de educacion ambiental para promover ciudades mas sostenibles.
