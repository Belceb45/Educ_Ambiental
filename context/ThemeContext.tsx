import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// ── Paleta de colores por tema ───────────────────────────────────────────────
// Las claves replican los tokens históricos de constants/auth-styles para que la
// conversión de pantallas sea directa (GREEN -> colors.green, WHITE -> colors.white…).
export interface ThemeColors {
  green: string;
  greenLight: string;
  white: string;       // superficies / tarjetas
  grayBg: string;      // fondo de pantalla
  grayBorder: string;
  grayLabel: string;
  textTitle: string;
  textInput: string;
  error: string;
  overlay: string;     // fondos translúcidos (headers circulares, etc.)
}

export const lightColors: ThemeColors = {
  green: '#43A047',
  greenLight: '#E8F5E9',
  white: '#FFFFFF',
  grayBg: '#F7F7F7',
  grayBorder: '#E0E0E0',
  grayLabel: '#9E9E9E',
  textTitle: '#4A4A4A',
  textInput: '#5A5A5A',
  error: '#EF5350',
  overlay: 'rgba(255, 255, 255, 0.9)',
};

export const darkColors: ThemeColors = {
  green: '#66BB6A',
  greenLight: '#15301F',
  white: '#1E1E1E',
  grayBg: '#121212',
  grayBorder: '#2E2E2E',
  grayLabel: '#9E9E9E',
  textTitle: '#ECECEC',
  textInput: '#D5D5D5',
  error: '#EF5350',
  overlay: 'rgba(30, 30, 30, 0.9)',
};

const STORAGE_KEY = 'theme_mode';

interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setDark: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
  setDark: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Por defecto sigue la apariencia del sistema hasta que el usuario elija.
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        if (stored === 'dark') setIsDark(true);
        else if (stored === 'light') setIsDark(false);
      } catch {
        // Si falla la lectura, se mantiene la apariencia del sistema.
      }
    })();
  }, []);

  const persist = (value: boolean) => {
    SecureStore.setItemAsync(STORAGE_KEY, value ? 'dark' : 'light').catch(() => {});
  };

  const setDark = (value: boolean) => {
    setIsDark(value);
    persist(value);
  };

  const toggleTheme = () => setDark(!isDark);

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
