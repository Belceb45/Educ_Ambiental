import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.100.178:8080'; // Ajusta esto a tu IP local o URL de producción

export const TOKEN_KEY = 'auth_token';

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

export const api = {
  async post(endpoint: string, body: any) {
    try {
      console.log(`Petición POST a: ${BASE_URL}${endpoint}`);
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(body),
      });
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
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
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
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });
    return response;
  },

  async patch(endpoint: string, body: any) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify(body),
    });
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
    return response.json();
  },
  async getTipDia() {
    const response = await api.get('/api/contenido/tip-dia');
    if (!response.ok) throw new Error('Error al obtener el tip del día');
    return response.json();
  }
};

export const userService = {
  async deleteMyAccount() {
    const response = await api.delete('/api/usuarios/mi-cuenta');
    if (!response.ok) throw new Error('Error al eliminar la cuenta');
    return response.json();
  }
};
