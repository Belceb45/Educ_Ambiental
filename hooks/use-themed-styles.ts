import { useMemo } from 'react';
import { useTheme, ThemeColors } from '@/context/ThemeContext';
import { makeAuthStyles } from '@/constants/auth-styles';
import { makeHomeStyles } from '@/constants/home-styles';

/**
 * Construye una hoja de estilos a partir de la paleta activa y la memoiza por tema.
 * Uso: const styles = useThemedStyles(makeStyles);
 */
export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}

/** Hoja de estilos compartida de las pantallas de autenticación, ya tematizada. */
export function useAuthStyles() {
  const { colors } = useTheme();
  return useMemo(() => makeAuthStyles(colors), [colors]);
}

/** Hoja de estilos del home / header, ya tematizada. */
export function useHomeStyles() {
  const { colors } = useTheme();
  return useMemo(() => makeHomeStyles(colors), [colors]);
}
