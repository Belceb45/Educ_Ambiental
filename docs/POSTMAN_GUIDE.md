# Guía de Endpoints - Backend EducAmbiental

Esta guía contiene la documentación exhaustiva de todos los endpoints disponibles en la API, organizados por categoría, incluyendo detalles de autenticación y manejo de errores.

---

## 1. Autenticación (`/api/auth`)
Endpoints públicos para gestión de acceso y registro.

### A. Registro de Usuario (Local)
*   **POST** `/api/auth/register`
*   **Descripción:** Crea una cuenta desactivada (`enabled: false`) y envía un código de 6 dígitos al correo.
*   **Body:**
    ```json
    {
      "nombre": "Nombre Usuario",
      "correo": "usuario@ejemplo.com",
      "password": "password123"
    }
    ```

### B. Verificación de Registro (Activar Cuenta)
*   **POST** `/api/auth/verify`
*   **Descripción:** Activa la cuenta usando el código enviado al correo. Retorna el JWT y el perfil del usuario.
*   **Body:**
    ```json
    {
      "email": "usuario@ejemplo.com",
      "code": "123456"
    }
    ```
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "token": "JWT_TOKEN_AQUÍ",
      "id": "UUID_USUARIO",
      "nombre": "Nombre Usuario",
      "correo": "usuario@ejemplo.com",
      "rol": "USER",
      "puntosActuales": 0,
      "nivelActual": 1
    }
    ```

### C. Inicio de Sesión (Local)
*   **POST** `/api/auth/authenticate`
*   **Descripción:** Solo funciona si la cuenta ya fue verificada. Retorna el JWT y el perfil completo.
*   **Body:**
    ```json
    {
      "email": "usuario@ejemplo.com",
      "password": "password123"
    }
    ```
*   **Respuesta Exitosa (200 OK):** Mismo formato que la Verificación.

### D. Google Sign-In
*   **POST** `/api/auth/google`
*   **Body:**
    ```json
    {
      "idToken": "GOOGLE_ID_TOKEN"
    }
    ```
*   **Nota:** Retorna un JWT y los datos del perfil del usuario (obtenidos de Google o de nuestra DB si ya existía).

### E. Recuperación de Contraseña (Fase 1: Solicitar Código)
*   **POST** `/api/auth/forgot-password`
*   **Descripción:** Envía un código de 6 dígitos al correo del usuario. Válido por 15 minutos.
*   **Body:**
    ```json
    {
      "email": "usuario@ejemplo.com"
    }
    ```

### F. Recuperación de Contraseña (Fase 2: Restablecer)
*   **POST** `/api/auth/reset-password`
*   **Descripción:** Utiliza el código recibido por correo para establecer una nueva contraseña.
*   **Body:**
    ```json
    {
      "email": "usuario@ejemplo.com",
      "code": "123456",
      "newPassword": "nueva_password_789"
    }
    ```

---

## 2. Usuarios (`/api/usuarios`)
Gestión de perfiles y roles administrativos.

### A. Listar Usuarios
*   **GET** `/api/usuarios`
*   **Auth:** `ADMIN_SYSTEM`
*   **Parámetros (Opcionales):** `page`, `size`, `sort`.

### B. Completar Actividad
*   **POST** `/api/usuarios/{idUsuario}/completar-actividad/{idModulo}`
*   **Auth:** Requerido (**el mismo Usuario**: `idUsuario` debe coincidir con el del token).
*   **Descripción:** Registra que un usuario completó un módulo educativo y le otorga XP. Es **idempotente**: un módulo solo puede completarse una vez por usuario (evita farmeo de puntos). Al completarlo se recalcula el nivel, se genera una notificación y se evalúan insignias.
*   **Errores comunes:** `409/400` si el módulo ya fue completado.

### C. Eliminar Usuario (Administrativo)
*   **DELETE** `/api/usuarios/{idUsuario}`
*   **Auth:** Requerido (**ADMIN_SYSTEM o el mismo Usuario**).
*   **Descripción:** Elimina un usuario específico por su ID. Solo accesible por administradores de sistema o por el usuario dueño del ID.

### D. Eliminar Mi Cuenta (Usuario)
*   **DELETE** `/api/usuarios/mi-cuenta`
*   **Auth:** Requerido (**Cualquier rol**).
*   **Descripción:** El usuario autenticado elimina su propia cuenta de forma permanente basándose en su token de sesión.
*   **Header:** `Authorization: Bearer <token>`

---

## 3. Materiales y Categorías (`/api/materiales` y `/api/categorias`)

### A. Listar Materiales / Búsqueda
*   **GET** `/api/materiales`: Listado paginado de todos los materiales.
*   **GET** `/api/materiales/buscar?nombre=plastico`: Búsqueda predictiva de materiales por nombre.
*   **Auth:** Público / Cualquier rol.

### B. Crear/Editar Material
*   **POST/PUT** `/api/materiales`
*   **Auth:** Requerido (**ADMIN_CONTENT**).
*   **Body:**
    ```json
    {
      "nombre": "Plástico PET",
      "instruccionesReciclaje": "Vaciar, limpiar y aplastar.",
      "idCategoria": 1
    }
    ```

### C. Gestión de Categorías
*   **GET** `/api/categorias`: Listado público de categorías base.
*   **POST/PUT/DELETE** `/api/categorias` (Auth: **ADMIN_CONTENT**).

---

## 4. Recompensas y Módulos Educativos

### A. Gestión de Recompensas (`/api/recompensas`)
*   **GET** `/api/recompensas`: Listado público.
*   **POST/PUT/DELETE** (Auth: **ADMIN_CONTENT**).
*   **POST** `/api/recompensas/canjear`: (Auth: **USER**) `{"idUsuario": "...", "idRecompensa": 1}`

### B. Módulos Educativos (`/api/modulos-educativos`)
*   **GET** `/api/modulos-educativos`: Consultar trivias y cursos.
*   **POST/PUT/DELETE** (Auth: **ADMIN_CONTENT**).
*   **Body:**
    ```json
    {
      "titulo": "Trivia Plásticos",
      "descripcion": "Aprende a identificar el PET.",
      "puntosOtorgados": 50,
      "tipo": "TRIVIA"
    }
    ```

---

## 5. Escáner de Productos (`/api/scanner`)
*   **GET** `/api/scanner/{barcode}`
*   **Descripción:** Consulta la API de OpenFoodFacts para identificar materiales.
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "nombreProducto": "Coca-Cola Original",
      "materialesDetectados": ["plastic", "pet"],
      "instruccionesSugeridas": "1. Vaciar... 2. Aplastar...",
      "encontrado": true
    }
    ```

---

## 6. Sistema de Tickets de Soporte (`/api/tickets`)
Gestión de incidencias y ayuda al usuario.

### A. Reportar Problema (Usuario)
*   **POST** `/api/tickets/usuario/{idUsuario}`
*   **Body:**
    ```json
    {
      "titulo": "Error en escáner",
      "descripcion": "No reconoce códigos de barras de latas.",
      "prioridad": "ALTA"
    }
    ```

### B. Gestión de Soporte (Admin Sistema)
*   **GET** `/api/tickets`: Ver todos los tickets del sistema.
*   **PATCH** `/api/tickets/{id}/asignar/{idAdmin}`: Asignar a un admin de sistema.
*   **PATCH** `/api/tickets/{id}/estado?nuevoEstado=RESUELTO`: Cambiar estado.

---

## 7. Centros de Reciclaje (`/api/centros`)
Gestión y visualización de puntos de acopio.

### A. Listar Centros (Mapa)
*   **GET** `/api/centros`
*   **Descripción:** Retorna todos los centros con coordenadas, contacto, `imagenUrl` y `descripcion` (materiales aceptados).

### B. Sincronización e Importación (Admin Sistema)
*   **POST** `/api/centros/sincronizar`: Sincronización automática con Datos Abiertos CDMX.
*   **POST** `/api/centros/importar-csv`: Desde CSV local con geocodificación automática (OSM).

### C. Gestión Manual
*   **POST/PUT/DELETE** `/api/centros` (Auth: **ADMIN_SYSTEM**).
*   **Body:**
    ```json
    {
      "nombre": "Centro Comunitario",
      "latitud": 19.4326,
      "longitud": -99.1332,
      "direccion": "Calle Falsa 123",
      "horario": "8:00 - 18:00",
      "imagenUrl": "https://...",
      "descripcion": "Acepta PET, cartón y vidrio."
    }
    ```

---

## 7B. Gamificación, Impacto y Comunicación

Estos endpoints sostienen el bucle de gamificación del ciudadano (RF14–RF18).

### A. Ranking Comunitario (RF17)
*   **GET** `/api/usuarios/ranking`
*   **Auth:** Requerido (cualquier usuario autenticado).
*   **Descripción:** Devuelve el top 20 de usuarios ordenados por XP, con su posición.
*   **Respuesta (200 OK):**
    ```json
    [
      { "posicion": 1, "idUsuario": "UUID", "nombre": "Ana", "puntosActuales": 1450, "nivelActual": 2 }
    ]
    ```

### B. Panel de Impacto (RF15)
*   **GET** `/api/usuarios/{idUsuario}/impacto`
*   **Auth:** Requerido (**el mismo Usuario** o `ADMIN_SYSTEM`).
*   **Descripción:** Agrega el progreso de gamificación del usuario (XP puro: nivel, XP, insignias e historial reciente). El nivel se calcula con `nivel = puntos / 1000 + 1`.
*   **Respuesta (200 OK):**
    ```json
    {
      "puntosActuales": 1450,
      "nivelActual": 2,
      "etiquetaNivel": "Eco-Explorador",
      "xpEnNivel": 450,
      "xpParaSiguiente": 1000,
      "totalModulosCompletados": 5,
      "insignias": [
        { "id": 1, "nombre": "Primer Módulo", "descripcion": "...", "iconoUrl": "🌱", "obtenida": true }
      ],
      "historialReciente": [
        { "id": 10, "cantidad": 50, "tipoOperacion": "GANANCIA", "motivo": "Completó el módulo: ...", "fecha": "2026-06-08T12:00:00" }
      ]
    }
    ```

### C. Insignias (RF15)
*   **GET** `/api/insignias`: Catálogo público de insignias.
*   **GET** `/api/insignias/usuario/{idUsuario}`: Catálogo con el flag `obtenida` para ese usuario (Auth: **el mismo Usuario** o `ADMIN_SYSTEM`).
*   **Nota:** Las insignias se otorgan automáticamente al completar actividades (Primer Módulo, Aprendiz Verde, Eco-Maestro, Coleccionista de XP).

### D. Notificaciones (RF18)
*   **GET** `/api/notificaciones/usuario/{idUsuario}`: Lista las notificaciones del usuario (más recientes primero).
*   **GET** `/api/notificaciones/usuario/{idUsuario}/no-leidas/count`: Devuelve `{ "noLeidas": N }`.
*   **PATCH** `/api/notificaciones/{idNotificacion}/leer?idUsuario={idUsuario}`: Marca una notificación como leída.
*   **PATCH** `/api/notificaciones/usuario/{idUsuario}/leer-todas`: Marca todas como leídas.
*   **Auth:** Requerido (**el mismo Usuario** o `ADMIN_SYSTEM`).
*   **Nota:** Las notificaciones se generan automáticamente (XP ganado, subida de nivel, insignia desbloqueada, canje de recompensa).

### E. Dashboard Administrativo (RF19)
*   **GET** `/api/dashboard/admin`
*   **Auth:** `ADMIN_SYSTEM`.
*   **Descripción:** Métricas globales del sistema.
*   **Respuesta (200 OK):**
    ```json
    {
      "totalUsuarios": 120,
      "usuariosVerificados": 98,
      "totalCentros": 45,
      "totalMateriales": 30,
      "totalContenidos": 60,
      "ticketsAbiertos": 4,
      "ticketsPorEstado": { "ABIERTO": 4, "EN_PROGRESO": 2, "RESUELTO": 10, "CERRADO": 8 }
    }
    ```

---

## 8. Configuración en Postman

1.  **Variable Global:** Crea una variable `base_url` con valor `http://localhost:8080`.
2. **Authorization:** En las peticiones protegidas, usa la pestaña **Auth**, selecciona **Bearer Token** y pega el token obtenido en el login.
3. **Headers:** Asegúrate de tener `Content-Type: application/json`.

---

## 9. Respuestas de Error Estándar
Todas las excepciones son capturadas y devueltas en un formato JSON consistente.

### Formato de Error
```json
{
  "status": 401,
  "message": "Mensaje descriptivo del error",
  "timestamp": "2026-06-02T13:45:00",
  "errors": []
}
```

### Casos Comunes
- **401 Unauthorized (Token Expirado):** `"message": "El token JWT ha expirado"`
- **401 Unauthorized (Credenciales):** `"message": "Correo o contraseña incorrectos"`
- **403 Forbidden (Permisos):** `"message": "No tienes los permisos necesarios para esta acción"`
- **404 Not Found:** `"message": "Recurso no encontrado"`
- **400 Bad Request:** `"message": "Error de validación", "errors": [...]`

---

## 10. Resumen de Roles (Seguridad)
- **USER:** Ciudadano. Actividades, Escáner, Canjes, Tickets propios.
- **ADMIN_SYSTEM:** Soporte. Usuarios, Centros, Gestión de Tickets.
- **ADMIN_CONTENT:** Editor. Catálogo, Materiales, Recompensas, Módulos Educativos.
