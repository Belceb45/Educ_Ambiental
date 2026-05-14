# SDD - Stack Tecnológico

Este documento detalla el stack de tecnologías utilizado en el proyecto **EducAmbiental**.

## Core
- **Framework:** [Expo](https://expo.dev/) (v54.0.33) - Platform for making universal native apps with React.
- **Librería UI:** [React Native](https://reactnative.dev/) (v0.81.5) - Framework para aplicaciones móviles nativas.
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (v5.9.2) - Supersert de JavaScript con tipado estático.
- **Runtime:** [Node.js](https://nodejs.org/)

## Navegación
- **Expo Router:** (v6.0.23) - Navegación basada en archivos.
- **React Navigation:**
    - `@react-navigation/native` (v7.1.8)
    - `@react-navigation/bottom-tabs` (v7.4.0)

## UI y Estilos
- **Componentes Base:** `react-native-safe-area-context`, `react-native-screens`.
- **Iconos:** `@expo/vector-icons`, `expo-symbols`.
- **Imágenes:** `expo-image` (v3.0.11).
- **Feedback Hápitico:** `expo-haptics`.
- **StatusBar:** `expo-status-bar`.

## Animaciones y Rendimiento
- **Reanimated:** `react-native-reanimated` (v4.1.1) - Librería potente para animaciones fluidas.
- **Gesture Handler:** `react-native-gesture-handler`.
- **Worklets:** `react-native-worklets`.

## Calidad de Código
- **Linter:** [ESLint](https://eslint.org/) (v9.25.0) con `eslint-config-expo`.
- **Tipado:** TypeScript para validación de tipos en tiempo de compilación.

## Otros
- **Splash Screen:** `expo-splash-screen`.
- **Linking:** `expo-linking` para Deep Linking.
- **Web Browser:** `expo-web-browser` para abrir enlaces externos.
