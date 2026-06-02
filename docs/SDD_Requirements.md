# SDD - Requerimientos del Sistema

Este documento enumera los requerimientos funcionales y no funcionales del proyecto **EducAmbiental**.

## Requerimientos Funcionales (RF)

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RF1 | Registro de Usuario | Creación de cuentas nuevas con validación de correo. | Alta |
| RF2 | Inicio de Sesión | Validación de acceso con credenciales seguras. | Alta |
| RF3 | Recuperación de Contraseña | Flujo para restablecer contraseña mediante código/enlace. | Alta |
| RF4 | Gestión de Roles | Soporte para Usuario Ciudadano, Admin de Centro y Admin de Sistema. | Alta |
| RF5 | Navegador de rutas | Protección de rutas privadas para usuarios autenticados. | Alta |
| RF6 | Consulta de categorías | Catálogo organizado de tipos de residuos (plástico, vidrio, etc.). | Alta |
| RF7 | Instrucciones de disposición | Guías detalladas sobre separación, limpieza y disposición. | Alta |
| RF8 | Búsqueda predictiva | Barra de búsqueda manual para encontrar productos específicos. | Alta |
| RF9 | Gestión de contenido | Operaciones CRUD sobre el catálogo de residuos (Admin). | Alta |
| RF10 | Mapa interactivo | Visualización de centros de reciclaje cercanos mediante GPS. | Alta |
| RF11 | Detalle de Centro | Ficha informativa con horarios, contacto y materiales aceptados. | Alta |
| RF12 | Gestión de perfil Centro | Actualización de info y capacidad por Admin de Centro. | Media |
| RF13 | Check-in de Reciclaje | Validación de entrega física mediante QR o geolocalización. | Alta |
| RF14 | Cálculo de puntos XP | Asignación de puntos por materiales entregados y educación. | Alta |
| RF15 | Panel de Impacto | Estadísticas históricas, nivel actual y equivalencias ecológicas. | Baja |
| RF16 | Desbloqueo de Logros | Sistema de medallas e insignias por hitos alcanzados. | Baja |
| RF17 | Ranking de Usuarios | Tabla de clasificación basada en puntos acumulados. | Media |
| RF18 | Sistema de Notificaciones | Alertas de recordatorio, felicitaciones y avisos de centros. | Media |
| RF19 | Dashboard Administrativo | Métricas globales de impacto para el Admin del Sistema. | Alta |
| RF20 | Gestión de contenido amp. | Gestión de noticias, tips y FAQs sin tocar código. | Media |
| RF21 | Visualización Offline | Cache local para consulta de guías y mapa sin conexión. | Media |
| RF22 | Navegación Intermodular | Interfaz unificada con navegación persistente. | Baja |
| RF23 | Búsqueda Dinámica Ext. | Búsqueda en tiempo real de puntos de reciclaje externos vía Overpass API. | Media |
| RF24 | Geocodificación Inversa | Conversión de coordenadas en direcciones legibles (Calle, Colonia, CP). | Media |
| RF25 | Navegación Externa | Apertura de Google Maps/Apple Maps para rutas de llegada. | Media |
| RF26 | Gestión de Idioma (i18n) | Soporte dinámico para Español e Inglés en toda la interfaz. | Alta |
| RF27 | Eliminación de Cuenta | Proceso de borrado permanente con doble confirmación de seguridad. | Alta |

## Requerimientos No Funcionales (RNF)

| ID | Nombre | Descripción |
|----|--------|-------------|
| RNF-01 | Interfaz Intuitiva | Diseño amigable, claro y fácil de usar. |
| RNF-02 | Rendimiento Eficiente | Consultas y visualización de datos en tiempo óptimo (Uso de memoización y renderizado optimizado). |
| RNF-03 | Seguridad | Cifrado de datos sensibles y control de accesos. |
| RNF-04 | Disponibilidad | Acceso continuo a la plataforma en cualquier momento. |
| RNF-05 | Confiabilidad | Información precisa, constante y actualizada (Manejo de Throttling en APIs de terceros). |
| RNF-06 | Adaptabilidad | Diseño responsivo para diferentes dispositivos móviles. |
| RNF-07 | Escalabilidad | Capacidad para soportar incremento de usuarios y datos. |
| RNF-08 | Mantenibilidad | Código modular siguiendo buenas prácticas y documentado. |
