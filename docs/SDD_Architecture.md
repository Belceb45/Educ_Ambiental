# SDD - Arquitectura del Sistema

Este documento describe la arquitectura técnica del frontend móvil de **EducAmbiental**.

## Visión General del Sistema

El sistema completo se compone de tres proyectos sobre una misma API REST:

| Proyecto | Tecnología | Rol |
|----------|-----------|-----|
| `Educ_Ambiental` (este repo) | Expo / React Native + TypeScript | App móvil del Usuario Ciudadano |
| `EducAmbientalAdmin` | React + Vite | Panel web de administración [RF23] |
| `EducAmibental-Backend` | Spring Boot (Java 21) + PostgreSQL | API REST, lógica de negocio y persistencia |

## Estructura de la App Móvil

La navegación usa **Expo Router** (navegación basada en archivos): cada archivo bajo `/app` es una ruta. El estado global se maneja con **Context Providers**.

### Raíz (`app/_layout.tsx`)
Composición de proveedores, de afuera hacia adentro:
1. **GestureHandlerRootView:** soporte de gestos.
2. **ThemeProvider** (`context/ThemeContext.tsx`): tema claro/oscuro [RF25]; sigue el esquema del sistema y persiste la preferencia en `SecureStore`.
3. **AuthProvider** (`context/AuthContext.tsx`): sesión JWT, login con credenciales y Google Sign-In [RF2], registro y logout. El token se guarda en `SecureStore`.
4. **RootLayoutNav:** guardia de rutas [RF5] — redirige a `/(auth)/login` si no hay sesión y a `/(tabs)` si ya la hay. Las rutas `about`, `contact`, `terms` y `faq` son públicas [RF27].

La configuración de i18n (`constants/i18n.ts`, ES/EN con i18next) se importa en la raíz [RF20].

### Grupo de Autenticación `app/(auth)/`
- `login.tsx` — inicio de sesión [RF2].
- `register.tsx` — registro [RF1].
- `verify-account.tsx` — verificación por código de correo [RF1].
- `forgot-password.tsx` — recuperación de contraseña [RF3].
- `about.tsx`, `terms.tsx`, `faq.tsx`, `contact.tsx` — páginas informativas públicas [RF27].

### Grupo Principal `app/(tabs)/` (requiere sesión)
- `index.tsx` — inicio con resumen del usuario y tip del día [RF26].
- `map.tsx` — mapa de centros [RF10/RF11] + puntos OSM con filtros y "Cómo llegar" [RF24]. Google Maps en Android, Apple Maps en iOS.
- `guide/index.tsx`, `guide/[id].tsx` — catálogo de residuos e instrucciones [RF6/RF7/RF8].
- `scan.tsx` — escáner de códigos de barras con `expo-camera` [RF9].
- `learn/index.tsx` — módulos educativos que otorgan XP [RF13/RF14].
- `rewards.tsx` — canje de recompensas [RF16].
- `ranking.tsx` — ranking comunitario [RF17].
- `notifications.tsx` — notificaciones internas con badge de no leídas [RF18].
- `profile.tsx` — panel de impacto: nivel, XP e insignias [RF15].
- `settings.tsx` — idioma [RF20], tema [RF25] y eliminación de cuenta [RF21].

## Capa de Servicios (`services/api.ts`)
Cliente HTTP central (`api`) que adjunta el token JWT y maneja el logout global ante `401`. Sobre él se definen servicios por recurso: `scannerService`, `centersService`, `dashboardService`, `contentService`, `modulesService`, `rewardsService`, `gamificationService`, `insigniasService`, `notificationsService` y `userService`.

## Modo Offline [RF22]
- `hooks/use-network-status.ts` detecta conectividad (`@react-native-community/netinfo`).
- `components/OfflineView.tsx` ofrece reintento cuando no hay red.
- Los datos críticos (p. ej. centros del mapa) se cachean en `SecureStore` y se sirven sin conexión.

## Patrones y Prácticas
- **Spec-Driven Development (SDD):** cada pantalla está vinculada a uno o más Requerimientos Funcionales (RF).
- **Separación de responsabilidades:** las pantallas manejan la vista; los Contexts el estado global; `services/api.ts` el acceso a datos.
- **Theming centralizado:** paleta en `constants/theme.ts` consumida vía `useThemedStyles`/`useTheme`; el panel admin reutiliza la misma paleta.
- **Rendimiento:** marcadores de mapa memoizados (`tracksViewChanges` se apaga tras rasterizar el pin personalizado).
