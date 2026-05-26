import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import AuthMenu from '@/components/auth-menu';
import { authStyles as styles } from '@/constants/auth-styles';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { register, signInWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert(t('error') || 'Error', t('allFieldsRequired') || 'Todos los campos son obligatorios');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError(t('passwordMismatch') || 'Las contraseñas no coinciden');
      return;
    }
    setPasswordError('');
    if (!termsAccepted) {
      Alert.alert(t('error') || 'Error', t('acceptTermsRequired') || 'Debe aceptar los términos y condiciones');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      // Redirigir a la pantalla de verificación
      router.push({
        pathname: '/(auth)/verify-account',
        params: { email }
      });
    } catch (error: any) {
      Alert.alert(t('error') || 'Error', error.message || t('registerFailed') || 'Error en el registro');
    } finally {
      setIsLoading(false);
    }
    };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.message !== 'SIGN_IN_CANCELLED') {
        Alert.alert(t('error') || 'Error', error.message || 'Error con Google Sign-In');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerms = () => {
    router.push('/(auth)/terms');
  };

  const handleLogin = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <StatusBar style="dark" />

      {/* Reutilizando elementos visuales del login para consistencia */}
      <View style={styles.topWave}>
        <Svg width="100%" height="220" viewBox="0 0 390 220" preserveAspectRatio="none">
          <Path d="M0,0 L390,0 L390,140 Q300,220 180,170 Q80,130 0,180 Z" fill="#E8F5E9" />
        </Svg>
        <View style={styles.topLeaf}>
          <Svg width="90" height="90" viewBox="0 0 90 90">
            <Path d="M80,5 C80,5 85,45 55,65 C40,75 20,70 10,60 C20,60 35,55 45,45 C55,35 60,15 80,5 Z" fill="#A5D6A7" opacity="0.7" />
            <Path d="M80,5 C70,20 60,35 45,45" stroke="#81C784" strokeWidth="1.5" fill="none" />
          </Svg>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <AuthMenu />
        </View>

        <View style={styles.brandContainer}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandText}>EducAmbiental</Text>
        </View>

        <Text style={styles.title}>{t('registerTitle')}</Text>

        {/* Nombre input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIconBox}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#9E9E9E" />
            </Svg>
          </View>
          <TextInput style={styles.input} placeholder={t('namePlaceholder')} placeholderTextColor="#BDBDBD" value={name} onChangeText={setName} />
        </View>

        {/* Email input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIconBox}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#9E9E9E" />
            </Svg>
          </View>
          <TextInput style={styles.input} placeholder={t('emailPlaceholder')} placeholderTextColor="#BDBDBD" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>

        {/* Password input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIconBox}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M18 8h-1V6A5 5 0 007 6v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12 a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4z M9 8V6a3 3 0 016 0v2H9z" fill="#9E9E9E" />
            </Svg>
          </View>
          <TextInput 
            style={styles.input} 
            placeholder={t('passwordPlaceholder')} 
            placeholderTextColor="#BDBDBD" 
            value={password} 
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }} 
            secureTextEntry={!showPassword} 
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path 
                d={showPassword ? "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" : "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92C21.03 15.34 22 13.77 22 12c-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.12 7.13 11.04 7 12 7zm-1.12 1.48l1.64 1.64c.15-.07.31-.12.48-.12 1.1 0 2 .9 2 2 0 .17-.05.33-.12.48l1.64 1.64c.3-.53.48-1.15.48-1.8 0-1.93-1.57-3.5-3.5-3.5-.65 0-1.27.18-1.8.48zM2.71 3.16L1.27 4.6l2.12 2.12C1.97 8.11 1 9.94 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l4.02 4.02 1.44-1.44L2.71 3.16zm5.32 5.32l2.36 2.36c-.2.43-.39.91-.39 1.41 0 1.93 1.57 3.5 3.5 3.5.5 0 .98-.19 1.41-.39l1.67 1.67c-.84.46-1.79.75-2.82.75-3.31 0-6-2.69-6-6 0-1.03.29-1.98.75-2.82z"} 
                fill="#9E9E9E" 
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Confirm Password input */}
        <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
          <View style={styles.inputIconBox}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M18 8h-1V6A5 5 0 007 6v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12 a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4z M9 8V6a3 3 0 016 0v2H9z" fill="#9E9E9E" />
            </Svg>
          </View>
          <TextInput 
            style={styles.input} 
            placeholder={t('confirmPasswordPlaceholder')} 
            placeholderTextColor="#BDBDBD" 
            value={confirmPassword} 
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (passwordError) setPasswordError('');
            }} 
            secureTextEntry={!showConfirmPassword} 
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 4 }}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path 
                d={showConfirmPassword ? "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" : "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92C21.03 15.34 22 13.77 22 12c-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.12 7.13 11.04 7 12 7zm-1.12 1.48l1.64 1.64c.15-.07.31-.12.48-.12 1.1 0 2 .9 2 2 0 .17-.05.33-.12.48l1.64 1.64c.3-.53.48-1.15.48-1.8 0-1.93-1.57-3.5-3.5-3.5-.65 0-1.27.18-1.8.48zM2.71 3.16L1.27 4.6l2.12 2.12C1.97 8.11 1 9.94 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l4.02 4.02 1.44-1.44L2.71 3.16zm5.32 5.32l2.36 2.36c-.2.43-.39.91-.39 1.41 0 1.93 1.57 3.5 3.5 3.5.5 0 .98-.19 1.41-.39l1.67 1.67c-.84.46-1.79.75-2.82.75-3.31 0-6-2.69-6-6 0-1.03.29-1.98.75-2.82z"} 
                fill="#9E9E9E" 
              />
            </Svg>
          </TouchableOpacity>
        </View>
        {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

        <View style={styles.rememberRow}>
          <View style={styles.checkboxRow}>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => setTermsAccepted(!termsAccepted)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                {termsAccepted && (
                  <Svg width="12" height="12" viewBox="0 0 24 24">
                    <Path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </Svg>
                )}
              </View>
              <Text style={[styles.rememberText, { fontSize: 13 }]}>{t('acceptTerms')} </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleTerms}>
              <Text style={[styles.forgotText, { fontSize: 13, textDecorationLine: 'underline' }]}>{t('termsAndConditions')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 10 }} />

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleRegister} 
          activeOpacity={0.85}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{t('registerButton')}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('orContinueWith')}</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={styles.socialButton} 
          onPress={handleGoogleRegister} 
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Svg width="20" height="20" viewBox="0 0 24 24">
            <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </Svg>
          <Text style={styles.socialButtonText}>{t('googleSignUp')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('alreadyHaveAccount')} </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.linkText}>{t('loginLink')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomLeaf} pointerEvents="none">
        <Svg width="120" height="100" viewBox="0 0 120 100">
          <Path d="M10,95 C10,95 5,55 35,35 C50,25 70,30 80,45 C70,45 55,50 45,60 C35,70 30,88 10,95 Z" fill="#A5D6A7" opacity="0.6" />
          <Path d="M10,95 C20,80 30,65 45,60" stroke="#81C784" strokeWidth="1.5" fill="none" />
        </Svg>
      </View>
    </KeyboardAvoidingView>
  );
}
