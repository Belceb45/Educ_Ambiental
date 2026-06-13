# Stack Tecnológico

Este documento detalla el stack de tecnologías utilizado en la app móvil de **EducAmbiental** (las versiones exactas viven en `package.json`).

## Core
- **Framework:** [Expo](https://expo.dev/) SDK 54 — plataforma para apps nativas universales con React.
- **Librería UI:** [React Native](https://reactnative.dev/) 0.81 con React 19.
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) 5.9 — tipado estático.
- **Dev Client:** `expo-dev-client` para development builds (necesario para Google Sign-In y Google Maps en iOS).

## Navegación
- **Expo Router** 6 — navegación basada en archivos con rutas tipadas (`typedRoutes`).
- **React Navigation** 7 (`native`, `bottom-tabs`, `elements`) como base de los navegadores.

## Mapas y Ubicación
- **react-native-maps** 1.20 — Google Maps en Android, Apple Maps en iOS (RF10/RF24).
- **expo-location** — permisos y posición GPS del usuario.
- **APIs externas:** Overpass (OpenStreetMap) para puntos de acopio cercanos.

## Cámara y Escaneo
- **expo-camera** — escaneo de códigos de barras (RF9, vía OpenFoodFacts en el backend).

## Estado, Datos y Seguridad
- **React Context** — estado global (`AuthContext`, `ThemeContext`).
- **expo-secure-store** — token JWT, preferencia de tema y caché offline de centros (RF22).
- **@react-native-community/netinfo** — detección de conectividad para el modo offline.
- **@react-native-google-signin/google-signin** — inicio de sesión con Google (RF2; requiere development build).

## Internacionalización
- **i18next + react-i18next** — Español e Inglés (RF20), con `expo-localization` para detectar el idioma del dispositivo.

## UI y Estilos
- **Componentes base:** `react-native-safe-area-context`, `react-native-screens`.
- **Iconos:** `@expo/vector-icons` (Ionicons), `expo-symbols`.
- **Gráficos vectoriales:** `react-native-svg`.
- **Imágenes:** `expo-image`.
- **Feedback háptico:** `expo-haptics`.
- **StatusBar / Splash:** `expo-status-bar`, `expo-splash-screen`.

## Animaciones y Rendimiento
- **react-native-reanimated** 4 + `react-native-worklets` — animaciones fluidas.
- **react-native-gesture-handler** — gestos nativos.

## Calidad de Código
- **ESLint** 9 con `eslint-config-expo`.
- **TypeScript** para validación de tipos en tiempo de compilación.

## Otros
- **expo-linking** — deep linking (p. ej. "Cómo llegar" abre Apple/Google Maps).
- **expo-web-browser** — apertura de enlaces externos.

## Backend
- **Backend:** Java 21, Spring Boot 3.2, PostgreSQL, Flyway, Spring Data JPA, MapStruct, Spring Security + JWT, OpenAPI/Swagger.
- **Panel Admin (`EducAmbientalAdmin`):** React 19, Vite, react-router-dom 7, fetch + JWT.
