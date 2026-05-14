# SDD - Arquitectura del Sistema

Este documento describe la arquitectura técnica del frontend de **EducAmbiental** basada en el diagrama de componentes.

## Estructura General
La aplicación sigue una arquitectura basada en **Providers** para el manejo de estado global y una estructura de navegación jerárquica mediante **Stacks** y **Tabs**.

### Raíz (Root)
- **App:** Punto de entrada que inicializa los servicios base.

### Capa de Proveedores (Context Providers)
Los proveedores envuelven la navegación principal para proveer estado y lógica compartida:
1. **AuthContextProvider:** Gestiona el estado de la sesión y el rol del usuario.
2. **OfflineDataProvider:** Implementa [RF21] para el almacenamiento en caché local.
3. **NotificacionesProvider:** Implementa [RF18] para la gestión de alertas push.

## Navegación (Navigators)
La navegación está orquestada por el **AppNavigator**, que valida rutas privadas [RF5].

### 1. Flujo de Autenticación (AuthStack)
- **LoginScreen:** Autenticación de usuarios [RF2].
- **RegistroScreen:** Creación de cuentas [RF1].
- **RecuperarPasswordScreen:** Flujo de recuperación [RF3].

### 2. Flujo Principal (MainTabNavigator)
Utiliza una barra de navegación inferior [RF22] y se divide en 4 Stacks principales:

#### A. MapaStack
- **MapaScreen:** Visualización de centros [RF10].
- **DetalleCentroModal:** Ficha informativa de centros [RF11].
- **EscanerQRScreen:** Validación de visitas mediante QR [RF13].

#### B. CatalogoStack
- **CatalogoScreen:** Listado de categorías [RF6] con búsqueda predictiva [RF8].
- **DetalleResiduoScreen:** Muestra la guía de separación [RF7].

#### C. ImpactoStack
- **PerfilImpactoScreen:** Estadísticas personales [RF15] y puntos XP [RF14].
- **RankingComunidadScreen:** Tabla de clasificación [RF17] y vitrina de medallas [RF16].

#### D. AdminStack
- **GestionCentroScreen:** Control de capacidad por Admin de Centro [RF12].
- **DashboardGlobalScreen:** Métricas para el Admin del Sistema [RF19].
- **GestionContenidoScreen:** CRUD de residuos [RF9] y noticias/tips [RF20].

## Patrones y Prácticas
- **Spec-Driven Development (SDD):** Cada componente está vinculado a uno o más Requerimientos Funcionales (RF).
- **Separación de Concernimientos:** Los Screens manejan la lógica de vista, mientras que los Providers manejan la lógica de negocio y estado.
- **Navegación Modular:** Uso de Stacks anidados para una navegación limpia y escalable.
