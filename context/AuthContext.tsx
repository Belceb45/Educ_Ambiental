import { api, TOKEN_KEY } from '@/services/api';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  nombre: string;
  correo: string;
  role?: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, correo: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
    
    try {
      GoogleSignin.configure({
        webClientId: '662747805533-5dib8f1schbuim0peenj5c15vp0qid29.apps.googleusercontent.com', // Tu Web Client ID real
        offlineAccess: true,
      });
    } catch (e) {
      console.log('GoogleSignin no disponible (Solo funcionará en Development Builds)');
    }
  }, []);

  async function loadStorageData() {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userData = await SecureStore.getItemAsync('user_data');

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.error('Error loading storage data', e);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/authenticate', { email, password });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`El servidor no respondió con un JSON válido (Status: ${response.status})`);
      }

      if (response.ok) {
        const token = data.token || data.jwt;
        const userData = data.user || { id: '1', nombre: 'Usuario', correo: email };

        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
        
        setUser(userData);
      } else {
        throw new Error(data.message || 'Error en el inicio de sesión');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (nombre: string, correo: string, password: string) => {
    try {
      const response = await api.post('/api/auth/register', { nombre, correo, password });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`El servidor no respondió con un JSON válido (Status: ${response.status})`);
      }

      if (response.ok) {
        const token = data.token || data.jwt;
        if (token) {
          const userData = data.user || { id: '1', nombre, correo };
          await SecureStore.setItemAsync(TOKEN_KEY, token);
          await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
          setUser(userData);
        }
      } else {
        throw new Error(data.message || 'Error en el registro');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync('user_data');
    setUser(null);
  };

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) throw new Error('No ID Token from Google');

      const response = await api.post('/api/auth/google', { idToken });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('El servidor no respondió con un JSON válido tras login con Google');
      }

      if (response.ok) {
        const token = data.token || data.jwt;
        const userData = data.user || { 
          id: userInfo.data?.user.id, 
          nombre: userInfo.data?.user.name, 
          correo: userInfo.data?.user.email 
        };

        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
        setUser(userData);
      } else {
        throw new Error(data.message || 'Error en la autenticación con nuestro backend');
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
