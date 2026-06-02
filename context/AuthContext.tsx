import { api, TOKEN_KEY } from '@/services/api';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Intentar importar GoogleSignin de forma segura para evitar crashes en entornos sin el módulo nativo (como Expo Go)
let GoogleSignin: any = null;
try {
  const GoogleSigninModule = require('@react-native-google-signin/google-signin');
  if (GoogleSigninModule) {
    GoogleSignin = GoogleSigninModule.GoogleSignin;
  }
} catch (e) {
  // El módulo no está disponible, se manejará en tiempo de ejecución
}

interface User {
  id: string;
  nombre: string;
  correo: string;
  role?: string;
  nivelActual?: number;
  puntosActuales?: number;
  co2Ahorrado?: number;
  aguaAhorrada?: number;
  arbolesSalvados?: number;
  kgReciclados?: number;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (nombre: string, correo: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  verifyAccount: (email: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
    
    if (GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId: '662747805533-5dib8f1schbuim0peenj5c15vp0qid29.apps.googleusercontent.com', // Tu Web Client ID real
          offlineAccess: true,
        });
      } catch (e) {
        console.log('GoogleSignin no pudo ser configurado:', e);
      }
    } else {
      console.log('GoogleSignin no disponible (Solo funcionará en Development Builds con el módulo nativo)');
    }
  }, []);

  async function loadStorageData() {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userData = await SecureStore.getItemAsync('user_data');
      const isPersistent = await SecureStore.getItemAsync('is_persistent');

      if (token && userData) {
        // Si no se marcó "Recordarme", cerramos sesión al reiniciar la app
        if (isPersistent === 'false') {
          await logout();
        } else {
          setUser(JSON.parse(userData));
        }
      }
    } catch (e) {
      console.error('Error loading storage data', e);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
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
        
        // Extraer datos del usuario de forma robusta (plana o anidada)
        const userData: User = {
          id: data.id || data.user?.id || '1',
          nombre: data.nombre || data.user?.nombre || 'Usuario',
          correo: data.correo || data.user?.correo || email,
          role: data.rol || data.user?.rol || 'USER',
          nivelActual: data.nivelActual || data.user?.nivelActual || 1,
          puntosActuales: data.puntosActuales || data.user?.puntosActuales || 0,
          co2Ahorrado: data.co2Ahorrado || data.user?.co2Ahorrado || 0,
          aguaAhorrada: data.aguaAhorrada || data.user?.aguaAhorrada || 0,
          arbolesSalvados: data.arbolesSalvados || data.user?.arbolesSalvados || 0,
          kgReciclados: data.kgReciclados || data.user?.kgReciclados || 0,
        };

        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
        await SecureStore.setItemAsync('is_persistent', rememberMe.toString());
        
        setUser(userData);
      } else {
        console.log('Login failed response:', data);
        throw new Error(data.message || `Error en el inicio de sesión (Status: ${response.status})`);
      }
    } catch (error: any) {
      console.error('Login error detail:', error);
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

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      // El registro ahora devuelve un mensaje de éxito indicando que se envió un código,
      // o podría devolver el token si el backend así lo decide tras verificar,
      // pero según la guía, la verificación es un paso separado.
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const verifyAccount = async (email: string, code: string) => {
    try {
      const response = await api.post('/api/auth/verify', { email, code });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`Error en la respuesta del servidor (Status: ${response.status})`);
      }

      if (response.ok) {
        const token = data.token || data.jwt;
        const userData = data.user || { id: data.id || '1', nombre: data.nombre || 'Usuario', correo: email };

        if (token) {
          await SecureStore.setItemAsync(TOKEN_KEY, token);
          await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
          setUser(userData);
        }
      } else {
        throw new Error(data.message || 'Código de verificación inválido');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync('user_data');
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al solicitar el código');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      const response = await api.post('/api/auth/reset-password', { email, code, newPassword });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!GoogleSignin) {
      throw new Error('Google Sign-In no está disponible en este entorno. Se requiere una Development Build con el módulo nativo.');
    }

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
    <AuthContext.Provider value={{ user, loading, login, register, logout, signInWithGoogle, forgotPassword, resetPassword, verifyAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
