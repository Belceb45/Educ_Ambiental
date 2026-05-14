# EducAmbiental

EducAmbiental es una aplicación móvil diseñada para fomentar la educación ambiental, facilitar el reciclaje y permitir a los usuarios realizar un seguimiento de su impacto ecológico positivo. El proyecto utiliza un enfoque de Desarrollo Basado en Especificaciones (SDD) para asegurar que cada funcionalidad responda a una necesidad real identificada.

## Caracteristicas Principales

### Para el Ciudadano
*   Mapa Interactivo: Encuentra centros de reciclaje cercanos mediante GPS.
*   Catalogo de Residuos: Guias detalladas sobre como separar y disponer correctamente de diferentes materiales (plastico, vidrio, etc.).
*   Check-in de Reciclaje: Valida tus entregas fisicas en centros autorizados mediante codigos QR.
*   Panel de Impacto: Visualiza tus estadisticas historicas, nivel de experiencia (XP) y equivalencias ecologicas.
*   Logros y Ranking: Desbloquea medallas por tus hitos y compite sanamente en el ranking comunitario.

### Para Administradores (Centro y Sistema)
*   Gestion de Centros: Control de horarios, materiales aceptados y capacidad.
*   Gestion de Contenido: CRUD completo para el catalogo de residuos, noticias y tips ambientales.
*   Dashboard Administrativo: Metricas globales de impacto para la toma de decisiones.

## Stack Tecnologico

*   Framework: Expo (v54) con React Native (v0.81).
*   Lenguaje: TypeScript para un desarrollo robusto y tipado.
*   Navegacion: Expo Router (Navegacion basada en archivos).
*   Animaciones: React Native Reanimated para una experiencia de usuario fluida.
*   Calidad: ESLint con configuracion de Expo.

## Arquitectura del Sistema

La aplicacion sigue una arquitectura moderna y escalable:
-   Context Providers: Manejo de estado global para autenticacion, datos offline y notificaciones.
-   Estructura Modular: Navegacion organizada en Stacks (Auth, Mapa, Catalogo, Impacto, Admin) y Tabs persistentes.
-   Modo Offline: Cache local para asegurar que la informacion critica este disponible siempre.

## Estructura del Proyecto

-   /app: Rutas de la aplicacion (Expo Router).
-   /components: Componentes de UI reutilizables.
-   /constants: Temas, colores y configuraciones globales.
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
