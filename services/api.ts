import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://172.20.10.8:8080'; // Ajusta esto a tu IP local o URL de producción

export const TOKEN_KEY = 'auth_token';

// Variable para guardar la función de logout y poder usarla fuera de React
let logoutFn: (() => Promise<void>) | null = null;

export const setGlobalLogout = (fn: () => Promise<void>) => {
  logoutFn = fn;
};

async function handleUnauthorized() {
  console.warn('Sesión inválida o usuario no encontrado (401/403). Forzando logout...');
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync('user_data');
  if (logoutFn) {
    await logoutFn();
  }
}

async function getHeaders() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Envuelve a fetch reintentando solo cuando el fallo es de red (TypeError:
 * "Network request failed"), no cuando el servidor responde con un error HTTP.
 * Esto evita los fallos transitorios de las primeras peticiones tras un cold
 * start, cuando la pila de red aún no está lista.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 4,
  backoffMs = 800,
): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      const isNetworkError = error instanceof TypeError;
      if (!isNetworkError || attempt >= retries) {
        throw error;
      }
      console.warn(
        `Fallo de red en ${url} (intento ${attempt + 1}/${retries + 1}). Reintentando...`,
      );
      await sleep(backoffMs * (attempt + 1));
    }
  }
}

export const api = {
  async post(endpoint: string, body: any) {
    try {
      console.log(`Petición POST a: ${BASE_URL}${endpoint}`);
      const response = await fetchWithRetry(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(body),
      });

      if (response.status === 401 || response.status === 403) {
        await handleUnauthorized();
      }

      return response;
    } catch (error) {
      console.error('Error en fetch POST:', error);
      throw error;
    }
  },

  async get(endpoint: string) {
    try {
      console.log(`Petición GET a: ${BASE_URL}${endpoint}`);
      const headers = await getHeaders();
      const response = await fetchWithRetry(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });
      
      if (response.status === 401 || response.status === 403) {
        await handleUnauthorized();
      } else if (!response.ok && response.status !== 404) {
        // El 404 es un caso esperado en varios endpoints ("no encontrado") y lo
        // maneja cada servicio; no es un error que debamos registrar en rojo.
        const errorBody = await response.text().catch(() => 'No body');
        console.error(`Error en GET ${endpoint} (Status ${response.status}):`, errorBody);
      }
      
      return response;
    } catch (error) {
      console.error('Error en fetch GET:', error);
      throw error;
    }
  },

  async delete(endpoint: string) {
    const response = await fetchWithRetry(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });

    if (response.status === 401 || response.status === 403) {
      await handleUnauthorized();
    }

    return response;
  },

  async patch(endpoint: string, body: any) {
    const response = await fetchWithRetry(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify(body),
    });

    if (response.status === 401 || response.status === 403) {
      await handleUnauthorized();
    }

    return response;
  },
};

export const scannerService = {
  async getProduct(barcode: string) {
    const response = await api.get(`/api/scanner/${barcode}`);
    
    // Si el producto no existe, el backend podría devolver 404
    if (response.status === 404) {
      return { encontrado: false };
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Error desconocido');
      console.error(`Error del servidor (${response.status}):`, errorText);
      throw new Error(`Error al obtener el producto: ${response.status}`);
    }
    
    return response.json();
  }
};

export const dashboardService = {
  async getInicio() {
    const response = await api.get('/api/dashboard/inicio');
    if (!response.ok) throw new Error('Error al obtener el dashboard');
    return response.json();
  }
};

export const contentService = {
  async getByType(type: 'GUIA' | 'TIP' | 'ARTICULO') {
    const response = await api.get(`/api/contenido/tipo/${type}`);
    if (!response.ok) throw new Error(`Error al obtener contenido de tipo ${type}`);
    const data = await response.json();
    return Array.isArray(data) ? data : data.content ?? [];
  },
  async getTipDia() {
    const response = await api.get('/api/contenido/tip-dia');
    if (!response.ok) throw new Error('Error al obtener el tip del día');
    return response.json();
  }
};

export const centersService = {
  async getCentros() {
    const response = await api.get('/api/centros');
    if (!response.ok) throw new Error('Error al obtener los centros de acopio');
    return response.json();
  }
};

export const userService = {
  async deleteMyAccount() {
    const response = await api.delete('/api/usuarios/mi-cuenta');
    if (!response.ok) throw new Error('Error al eliminar la cuenta');

    // Si la respuesta está vacía (común en DELETE), no intentamos parsear JSON
    const text = await response.text();
    return text ? JSON.parse(text) : { success: true };
  }
};

// ─── Gamificación: módulos educativos, recompensas, impacto, ranking ──────────

export const modulesService = {
  // El backend pagina los módulos; devolvemos el array `content`.
  async list() {
    const response = await api.get('/api/modulos-educativos');
    if (!response.ok) throw new Error('Error al obtener los módulos educativos');
    const data = await response.json();
    return Array.isArray(data) ? data : data.content ?? [];
  },
  async complete(idUsuario: string, idModulo: number) {
    const response = await api.post(`/api/usuarios/${idUsuario}/completar-actividad/${idModulo}`, {});
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      let message = 'No se pudo completar el módulo';
      try { message = JSON.parse(text).message || message; } catch {}
      throw new Error(message);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : { success: true };
  },
};

export const rewardsService = {
  async list() {
    const response = await api.get('/api/recompensas');
    if (!response.ok) throw new Error('Error al obtener las recompensas');
    const data = await response.json();
    return Array.isArray(data) ? data : data.content ?? [];
  },
  async canjear(idUsuario: string, idRecompensa: number) {
    const response = await api.post('/api/recompensas/canjear', { idUsuario, idRecompensa });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new Error(data.message || 'No se pudo canjear la recompensa');
    }
    return data;
  },
};

export const gamificationService = {
  async getImpacto(idUsuario: string) {
    const response = await api.get(`/api/usuarios/${idUsuario}/impacto`);
    if (!response.ok) throw new Error('Error al obtener el impacto');
    return response.json();
  },
  async getRanking() {
    const response = await api.get('/api/usuarios/ranking');
    if (!response.ok) throw new Error('Error al obtener el ranking');
    const data = await response.json();
    return Array.isArray(data) ? data : data.content ?? [];
  },
};

export const insigniasService = {
  async byUser(idUsuario: string) {
    const response = await api.get(`/api/insignias/usuario/${idUsuario}`);
    if (!response.ok) throw new Error('Error al obtener las insignias');
    return response.json();
  },
};

export const ticketService = {
  async crear(idUsuario: string, titulo: string, descripcion: string) {
    const response = await api.post(`/api/tickets/usuario/${idUsuario}`, {
      titulo,
      descripcion,
      prioridad: 'MEDIA',
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new Error(data.message || 'No se pudo enviar el mensaje');
    }
    return data;
  },
};

export const notificationsService = {
  async list(idUsuario: string) {
    const response = await api.get(`/api/notificaciones/usuario/${idUsuario}`);
    if (!response.ok) throw new Error('Error al obtener las notificaciones');
    const data = await response.json();
    return Array.isArray(data) ? data : data.content ?? [];
  },
  async unreadCount(idUsuario: string): Promise<number> {
    const response = await api.get(`/api/notificaciones/usuario/${idUsuario}/no-leidas/count`);
    if (!response.ok) return 0;
    const data = await response.json();
    return data.noLeidas ?? 0;
  },
  async markRead(idNotificacion: number, idUsuario: string) {
    const response = await api.patch(`/api/notificaciones/${idNotificacion}/leer?idUsuario=${idUsuario}`, {});
    if (!response.ok) throw new Error('Error al marcar la notificación');
    return response.json();
  },
  async markAllRead(idUsuario: string) {
    const response = await api.patch(`/api/notificaciones/usuario/${idUsuario}/leer-todas`, {});
    if (!response.ok) throw new Error('Error al marcar las notificaciones');
    return response.json();
  },
};
