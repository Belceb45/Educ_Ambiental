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
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: await getHeaders(),
      });
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
