# Guía de Pruebas con Postman - Backend EducAmbiental

Esta guía detalla cómo interactuar con los nuevos endpoints y campos del backend.

## 1. Configuración de Seguridad (JWT)

El proyecto utiliza Spring Security con JWT. Para probar los endpoints protegidos:

1.  **Obtener Token:**
    *   **Método:** `POST`
    *   **URL:** `{{base_url}}/api/v1/auth/authenticate`
    *   **Body (JSON):**
        ```json
        {
          "correo": "usuario@ejemplo.com",
          "password": "tu_password"
        }
        ```
2.  **Usar Token:**
    *   En Postman, en la pestaña **Auth**, selecciona **Bearer Token** y pega el `token` obtenido.

---

## 2. Endpoints de Nuevas Entidades

### A. Visitas de Entrega (`VisitaEntrega`)
Registro de reciclaje físico en centros.
*   **Crear Visita:** `POST /api/visitas`
    ```json
    {
      "usuarioId": "UUID_DEL_USUARIO",
      "centroReciclajeId": 1,
      "kilogramosReciclados": 12.5,
      "fechaHora": "2026-05-04T10:00:00"
    }
    ```
*   **Listar Visitas de un Usuario:** `GET /api/visitas/usuario/{uuid}`

### B. Notificaciones (`Notificacion`)
*   **Listar mis notificaciones:** `GET /api/notificaciones`
*   **Marcar como leída:** `PATCH /api/notificaciones/{id}/leer`

### C. Contenido Estático (`ContenidoEstatico`)
*   **Crear Contenido (Admin):** `POST /api/contenidos`
    ```json
    {
      "tipo": "NOTICIA",
      "titulo": "Gran Jornada de Reciclaje",
      "cuerpo": "Este sábado estaremos en el parque central...",
      "autorId": "UUID_DEL_ADMIN",
      "fechaPublicacion": "2026-05-04T09:00:00"
    }
    ```
*   **Obtener por tipo:** `GET /api/contenidos?tipo=TIP`

### D. Insignias (`Insignia`)
*   **Listar todas:** `GET /api/insignias`
*   **Asignar a usuario:** `POST /api/insignias/{id}/asignar/{usuarioId}`

---

## 3. Pruebas de Campos Actualizados

### Centro de Reciclaje
*   **Verificar campos nuevos:** `GET /api/centros/{id}`
    *   Debe retornar: `capacidadLlena` (Boolean), `administrador` (Objeto Usuario), y `materialesAceptados` (Lista de Categorías).
*   **Actualizar Capacidad:** `PATCH /api/centros/{id}`
    ```json
    { "capacidadLlena": true }
    ```

### Usuario
*   **Progreso:** `GET /api/usuarios/me`
    *   Verificar el campo `nivelActual` (por defecto 1).

### Módulo Interactivo
*   **Completar Módulo:** `POST /api/modulos/{id}/completar`
    *   Verifica que el usuario se añada a la lista de completados y se le sumen los `puntosOtorgados`.

---

## 4. Notas Técnicas
*   **Formato de Fechas:** ISO 8601 (`YYYY-MM-DDTHH:mm:ss`).
*   **IDs de Usuario:** Siempre utilizar el formato UUID (ej: `550e8400-e29b-41d4-a716-446655440000`).
*   **Variables de Postman:** Se recomienda crear un ambiente con `base_url` para alternar fácilmente entre `localhost` y producción.
