import { Platform, StyleSheet } from 'react-native';
import type { ThemeColors } from '@/context/ThemeContext';

export const GREEN       = '#43A047';
export const GREEN_LIGHT = '#E8F5E9';
export const WHITE       = '#FFFFFF';
export const GRAY_BG     = '#F7F7F7';
export const GRAY_BORDER = '#E0E0E0';
export const GRAY_LABEL  = '#9E9E9E';   // antes #757575 — más suave
export const TEXT_TITLE  = '#4A4A4A';   // antes #424242 — menos negro
export const TEXT_INPUT  = '#5A5A5A';   // antes #212121 — más ligero
export const ERROR       = '#EF5350';

export const authStyles = StyleSheet.create({

  // ── Layout base ────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: GRAY_BG,
  },

  // ── Ola + hojas decorativas ────────────────────────────────────────────────
  topWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    zIndex: 0,
  },
  topLeaf: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  bottomLeaf: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 0,
  },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,    // era 32; reducir 4px da más "aire" sin romper alineación
    paddingTop: 72,           // era 80
    paddingBottom: 48,
    zIndex: 1,
  },

  // ── Header (menú idioma) ───────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 16,         // era 10
    zIndex: 2,
  },

  // ── Logo + nombre marca ────────────────────────────────────────────────────
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,         // era 24 — más respiro antes del título
    marginLeft: -6,           // ← FIX: compensa el padding interno del PNG del logo
  },
  logo: {
    width: 88,                // era 80 — ligeramente más grande para que el arte quede alineado
    height: 88,
    marginRight: 2,
  },
  brandText: {
    fontSize: 26,             // era 28
    fontWeight: '700',        // mantiene peso porque va junto al logo
    color: GREEN,
    letterSpacing: -0.3,
  },

  // ── Título de sección ("Iniciar sesión") ───────────────────────────────────
  title: {
    fontSize: 24,             // era 26
    fontWeight: '500',        // era '700' — MUCHO más ligero, como el mockup
    color: TEXT_TITLE,        // #4A4A4A suave
    marginBottom: 28,         // era 20
    letterSpacing: -0.2,
  },

  // También se usa en register como "Crear Cuenta"
  pageTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: TEXT_TITLE,
    letterSpacing: -0.4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  pageSubtitle: {
    fontSize: 15,
    color: GRAY_LABEL,
    marginTop: 4,
  },

  // ── Inputs ─────────────────────────────────────────────────────────────────
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    marginBottom: 20,         // era 16 — más espacio entre campos
    paddingHorizontal: 18,    // era 16
    height: 56,               // era 54 — un toque más alto
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,      // era 0.06 — sombra más sutil
    shadowRadius: 5,
    elevation: 2,
  },
  inputError: {
    borderColor: ERROR,
    marginBottom: 4,
  },
  inputIconBox: {
    marginRight: 12,          // era 10
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: TEXT_INPUT,        // #5A5A5A — no tan negro
    fontWeight: '400',        // explícito para que no herede bold del sistema
  },
  errorText: {
    color: ERROR,
    fontSize: 12,             // era 13
    fontWeight: '500',        // era '600'
    marginBottom: 14,
    marginLeft: 10,
  },

  // ── Recordarme / Olvidé contraseña ────────────────────────────────────────
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 40,         // era 8 — gran salto antes del botón, como el mockup
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },
  checkboxChecked: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  rememberText: {
    fontSize: 14,
    color: GRAY_LABEL,        // era #757575
    fontWeight: '400',
  },
  forgotText: {
    fontSize: 14,
    color: GREEN,
    fontWeight: '500',        // era '600' — un paso más ligero
  },

  // ── Botón primario ─────────────────────────────────────────────────────────
  primaryButton: {
    backgroundColor: GREEN,
    height: 48,               // Reducido de 56 a 48
    borderRadius: 24,         // Ajustado para mantener la proporción circular
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,         // Reducido de 24 a 12 para acercar al footer
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: WHITE,
    fontSize: 17,
    fontWeight: '300',        // era '700'
    letterSpacing: 0.2,
  },

  // ── Footer ("¿No tienes cuenta?") ─────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 14,
    color: GRAY_LABEL,        // era #616161
    fontWeight: '400',
  },
  linkText: {
    fontSize: 14,
    color: GREEN,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // ── Social Login ───────────────────────────────────────────────────────────
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: GRAY_BORDER,
  },
  dividerText: {
    marginHorizontal: 10,
    color: GRAY_LABEL,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: TEXT_TITLE,
    fontWeight: '500',
  },

  // ── Register: tarjetas agrupadas (iOS Settings) ───────────────────────────
  card: {
    backgroundColor: WHITE,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: GRAY_LABEL,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 4,
  },
  spacer: {
    height: 24,
  },
});

// ── Versión temática (dark mode) ─────────────────────────────────────────────
// Misma hoja de estilos pero parametrizada por la paleta activa. Las pantallas de
// auth la consumen vía useAuthStyles() para reaccionar al cambio de tema.
export const makeAuthStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.grayBg },
  topWave: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, zIndex: 0 },
  topLeaf: { position: 'absolute', top: 0, right: 0 },
  bottomLeaf: { position: 'absolute', bottom: 0, left: 0, zIndex: 0 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 72, paddingBottom: 48, zIndex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 16, zIndex: 2 },
  brandContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 36, marginLeft: -6 },
  logo: { width: 88, height: 88, marginRight: 2 },
  brandText: { fontSize: 26, fontWeight: '700', color: c.green, letterSpacing: -0.3 },
  title: { fontSize: 24, fontWeight: '500', color: c.textTitle, marginBottom: 28, letterSpacing: -0.2 },
  pageTitle: { fontSize: 28, fontWeight: '600', color: c.textTitle, letterSpacing: -0.4, fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium' },
  pageSubtitle: { fontSize: 15, color: c.grayLabel, marginTop: 4 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: c.white, borderRadius: 30,
    borderWidth: 1, borderColor: c.grayBorder, marginBottom: 20, paddingHorizontal: 18, height: 56,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  inputError: { borderColor: c.error, marginBottom: 4 },
  inputIconBox: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: c.textInput, fontWeight: '400' },
  errorText: { color: c.error, fontSize: 12, fontWeight: '500', marginBottom: 14, marginLeft: 10 },
  rememberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 40 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: c.grayLabel,
    marginRight: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: c.white,
  },
  checkboxChecked: { backgroundColor: c.green, borderColor: c.green },
  rememberText: { fontSize: 14, color: c.grayLabel, fontWeight: '400' },
  forgotText: { fontSize: 14, color: c.green, fontWeight: '500' },
  primaryButton: {
    backgroundColor: c.green, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, shadowColor: c.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 4,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '300', letterSpacing: 0.2 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  footerText: { fontSize: 14, color: c.grayLabel, fontWeight: '400' },
  linkText: { fontSize: 14, color: c.green, fontWeight: '600', textDecorationLine: 'underline' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: c.grayBorder },
  dividerText: { marginHorizontal: 10, color: c.grayLabel, fontSize: 14 },
  socialButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: c.white, height: 48,
    borderRadius: 24, borderWidth: 1, borderColor: c.grayBorder, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  socialButtonText: { marginLeft: 12, fontSize: 16, color: c.textTitle, fontWeight: '500' },
  card: {
    backgroundColor: c.white, borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  sectionLabel: { fontSize: 12, fontWeight: '400', color: c.grayLabel, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 },
  spacer: { height: 24 },
});