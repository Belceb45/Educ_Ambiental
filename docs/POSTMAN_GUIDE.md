# Guía de Endpoints - Backend EducAmbiental

Esta guía contiene la documentación exhaustiva de todos los endpoints disponibles en la API, organizados por categoría.

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

### C. Google Sign-In
*   **POST** `/api/auth/google`
*   **Body:**
    ```json
    {
      "idToken": "GOOGLE_ID_TOKEN"
    }
    ```
*   **Nota:** Retorna un JWT y los datos del perfil del usuario (obtenidos de Google o de nuestra DB si ya existía).

### D. Recuperación de Contraseña (Fase 1: Solicitar Código)
*   **POST** `/api/auth/forgot-password`
*   **Descripción:** Envía un código de 6 dígitos al correo del usuario. Válido por 15 minutos.
*   **Body:**
    ```json
    {
      "email": "usuario@ejemplo.com"
    }
    ```

### E. Recuperación de Contraseña (Fase 2: Restablecer)
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
Gestión de perfiles y progreso.

### A. Listar Usuarios
*   **GET** `/api/usuarios`
*   **Auth:** Requerido (Cualquier rol).
*   **Parámetros (Opcionales):** `page`, `size`, `sort`.

### B. Crear Usuario (Directo)
*   **POST** `/api/usuarios`
*   **Body:** Mismo que `auth/register`.

### C. Completar Actividad
*   **POST** `/api/usuarios/{idUsuario}/completar-actividad/{idModulo}`
*   **Descripción:** Registra que un usuario completó un módulo educativo y le otorga puntos.

### D. Eliminar Usuario (Administrativo)
*   **DELETE** `/api/usuarios/{idUsuario}`
*   **Auth:** Requerido (**ADMIN o el mismo Usuario**).
*   **Descripción:** Elimina un usuario específico por su ID. Solo accesible por administradores o por el usuario dueño del ID.

### E. Eliminar Mi Cuenta (Usuario)
*   **DELETE** `/api/usuarios/mi-cuenta`
*   **Auth:** Requerido (**Cualquier rol**).
*   **Descripción:** El usuario autenticado elimina su propia cuenta de forma permanente basándose en su token de sesión.
*   **Header:** `Authorization: Bearer <token>`

---

## 3. Materiales Educativos (`/api/materiales`)
Información sobre materiales de reciclaje.

### A. Listar Materiales
*   **GET** `/api/materiales`
*   **Auth:** Requerido (Cualquier rol).
*   **Parámetros:** `page`, `size`, `sort`.

### B. Crear Material
*   **POST** `/api/materiales`
*   **Auth:** Requerido (**SOLO ADMIN**).
*   **Body:**
    ```json
    {
      "nombre": "Plástico PET",
      "descripcion": "Botellas de plástico transparente.",
      "categoriaId": 1
    }
    ```

---

## 4. Recompensas (`/api/recompensas`)
Catálogo y canje de beneficios.

### A. Listar Recompensas
*   **GET** `/api/recompensas`
*   **Auth:** Requerido (Cualquier rol).

### B. Crear Recompensa
*   **POST** `/api/recompensas`
*   **Auth:** Requerido (**SOLO ADMIN**).
*   **Body:**
    ```json
    {
      "nombre": "Bono de Descuento",
      "descripcion": "10% de descuento en tiendas amigas.",
      "costoPuntos": 500,
      "stock": 100
    }
    ```

### C. Canjear Recompensa
*   **POST** `/api/recompensas/canjear`
*   **Auth:** Requerido (Cualquier rol).
*   **Body:**
    ```json
    {
      "idUsuario": "UUID_DEL_USUARIO",
      "idRecompensa": 1
    }
    ```

---

## 5. Escáner de Productos (OpenFoodFacts) (`/api/scanner`)
Identificación de materiales mediante código de barras.

### A. Escanear Producto
*   **GET** `/api/scanner/{barcode}`
*   **Descripción:** Envía un código de barras (EAN/UPC) para consultar la base de datos de OpenFoodFacts y compararla con nuestras guías internas.
*   **Ejemplo:** `GET {{baseUrl}}/api/scanner/7501055300075`
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "nombreProducto": "Coca-Cola Original",
      "imagenUrl": "https://...",
      "materialesDetectados": ["plastic", "pet"],
      "instruccionesSugeridas": "1. Vaciar el contenido... 4. Aplastar...",
      "categoriaSugerida": "PLÁSTICO",
      "encontrado": true
    }
    ```

---

## 6. Dashboard y Contenido Educativo (`/api/dashboard` e `/api/contenido`)
Endpoints para el panel de inicio y guías.

### A. Dashboard de Inicio
*   **GET** `/api/dashboard/inicio`
*   **Auth:** Requerido.
*   **Descripción:** Devuelve el feed principal: saludo, puntos, tip del día y artículos destacados.

### B. Listar Contenido por Tipo
*   **GET** `/api/contenido/tipo/{tipo}`
*   **Parámetro {tipo}:** `GUIA`, `TIP`, `ARTICULO`.
*   **Descripción:** Obtiene todos los elementos de un tipo específico (ej. todas las guías de materiales).

### C. Tip del Día
*   **GET** `/api/contenido/tip-dia`
*   **Descripción:** Obtiene el tip destacado del momento.

### D. Gestión de Contenido (Admin)
*   **POST** `/api/contenido`: Crear tip/guía/artículo.
*   **PUT** `/api/contenido/{id}`: Editar contenido.
*   **DELETE** `/api/contenido/{id}`: Eliminar contenido.
*   **Body:**
    ```json
    {
      "titulo": "Nuevo Tip",
      "cuerpo": "Contenido educativo...",
      "tipo": "TIP",
      "autor": "Admin"
    }
    ```

### 7. Centros de Reciclaje (`/api/centros`)
Gestión y visualización de puntos de acopio.

- **Listar Centros:**
  - **Endpoint:** `GET {{baseUrl}}/api/centros`
  - **Descripción:** Obtiene todos los centros (incluyendo los sincronizados de la CDMX) para mostrar en el mapa.

- **Crear Centro (Manual):**
  - **POST** `/api/centros`
  - **Auth:** ADMIN.
  - **Body:**
    ```json
    {
      "nombre": "Centro Comunitario",
      "latitud": 19.4326,
      "longitud": -99.1332,
      "direccion": "Calle Falsa 123",
      "horario": "8:00 - 18:00"
    }
    ```

- **Actualizar Centro:**
  - **PUT** `/api/centros/{id}`
  - **Auth:** ADMIN.

- **Eliminar Centro:**
  - **DELETE** `/api/centros/{id}`
  - **Auth:** ADMIN.
  
- **Sincronización Manual (Solo Admin):**
  - **Endpoint:** `POST {{baseUrl}}/api/centros/sincronizar`
  - **Auth:** Requiere Bearer Token (ADMIN).
  - **Descripción:** Fuerza la descarga y actualización de centros desde la API de Datos Abiertos de la CDMX.

---

## 8. Configuración en Postman

1.  **Variable Global:** Crea una variable `base_url` con valor `http://localhost:8080`.
2. **Authorization:** En las peticiones protegidas, usa la pestaña **Auth**, selecciona **Bearer Token** y pega el token obtenido en el login.
3. **Headers:** Asegúrate de tener `Content-Type: application/json`.

---

## 9. Respuestas de Error Estándar (Frontend Integration)
Todas las excepciones son capturadas y devueltas en un formato JSON consistente para facilitar su manejo en el frontend.

### Formato de Error
```json
{
  "status": 401,
  "message": "Mensaje descriptivo del error",
  "timestamp": "2026-06-02T13:45:00",
  "errors": [] // Opcional: lista de errores específicos (ej. validaciones)
}
```

### Casos Comunes
- **401 Unauthorized (Token Expirado):** `"message": "El token JWT ha expirado"`
- **401 Unauthorized (No registrado):** `"message": "Usuario no encontrado o no registrado"`
- **401 Unauthorized (Credenciales):** `"message": "Credenciales inválidas: correo o contraseña incorrectos"`
- **403 Forbidden (No verificado):** `"message": "La cuenta aún no ha sido verificada. Revisa tu correo."`
- **409 Conflict (Duplicado):** `"message": "El correo electrónico ya está registrado"`
- **404 Not Found:** `"message": "Recurso no encontrado"`
- **400 Bad Request (Validación):** `"message": "Error de validación", "errors": ["El correo es obligatorio", ...]`

