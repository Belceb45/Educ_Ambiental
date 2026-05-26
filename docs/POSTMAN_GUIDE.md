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
*   **Descripción:** Activa la cuenta usando el código enviado al correo. Retorna el primer JWT.
*   **Body:**
    ```json
    {
      "email": "usuario@ejemplo.com",
      "code": "123456"
    }
    ```

### C. Inicio de Sesión (Local)
*   **POST** `/api/auth/authenticate`
*   **Descripción:** Solo funciona si la cuenta ya fue verificada.
*   **Body:**
    ```json
    {
      "email": "usuario@ejemplo.com",
      "password": "password123"
    }
    ```

### C. Google Sign-In
*   **POST** `/api/auth/google`
*   **Body:**
    ```json
    {
      "idToken": "GOOGLE_ID_TOKEN"
    }
    ```
*   **Nota:** Retorna un JWT de nuestra aplicación.

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

### D. Eliminar Usuario
*   **DELETE** `/api/usuarios/{idUsuario}`
*   **Auth:** Requerido (**SOLO ADMIN**).

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

## 5. Otros Endpoints (Documentados en Requerimientos)

### Centros de Reciclaje
*   **GET** `/api/centros`: Listar todos los centros.
*   **GET** `/api/centros/{id}`: Detalle del centro.
*   **PATCH** `/api/centros/{id}`: Actualizar capacidad (Admin).

### Notificaciones
*   **GET** `/api/notificaciones`: Listar notificaciones del usuario.
*   **PATCH** `/api/notificaciones/{id}/leer`: Marcar como leída.

---

## Configuración en Postman

1.  **Variable Global:** Crea una variable `base_url` con valor `http://localhost:8080`.
2.  **Authorization:** En las peticiones protegidas, usa la pestaña **Auth**, selecciona **Bearer Token** y pega el token obtenido en el login.
3.  **Headers:** Asegúrate de tener `Content-Type: application/json`.
