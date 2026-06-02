import { useRouter, useLocalSearchParams } from 'expo-router';
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
import { authStyles as styles, GREEN } from '@/constants/auth-styles';
import { useAuth } from '@/context/AuthContext';

export default function VerifyAccountScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { t } = useTranslation();
  const { verifyAccount, forgotPassword } = useAuth();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!code) {
      Alert.alert(t('error') || 'Error', t('codeRequired'));
      return;
    }

    setIsLoading(true);
    try {
      await verifyAccount(email as string, code);
      Alert.alert(t('success') || 'Éxito', t('verificationSuccess'), [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (error: any) {
      const errorMessage = error.message || '';
      let title = t('error') || 'Error';
      let displayMessage = errorMessage;

      if (errorMessage.includes('inválido') || errorMessage.includes('incorrecto')) {
        title = t('invalidCodeTitle') || 'Código Inválido';
        displayMessage = t('invalidCodeMsg') || 'El código ingresado no es correcto. Por favor, verifica el correo.';
      } else if (errorMessage.includes('expirado')) {
        title = t('expiredCodeTitle') || 'Código Expirado';
        displayMessage = t('expiredCodeMsg') || 'El código ha vencido. Solicita uno nuevo.';
      }

      Alert.alert(title, displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      // Usamos forgotPassword para reenviar el código ya que cumple la misma función técnica
      await forgotPassword(email as string);
      Alert.alert(t('success') || 'Éxito', t('codeSentSuccess'));
    } catch (error: any) {
      Alert.alert(t('error') || 'Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <StatusBar style="dark" />

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
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={GREEN} />
            </Svg>
          </TouchableOpacity>
          <AuthMenu />
        </View>

        <View style={styles.brandContainer}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandText}>EducAmbiental</Text>
        </View>

        <Text style={styles.title}>{t('verifyAccountTitle')}</Text>
        <Text style={[styles.footerText, { textAlign: 'center', marginBottom: 20 }]}>
          {t('verifyAccountDesc')} {"\n"}
          <Text style={{ fontWeight: 'bold' }}>{email}</Text>
        </Text>

        <View style={styles.inputWrapper}>
          <View style={styles.inputIconBox}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#9E9E9E" />
            </Svg>
          </View>
          <TextInput 
            style={styles.input} 
            placeholder={t('codePlaceholder')} 
            placeholderTextColor="#BDBDBD" 
            value={code} 
            onChangeText={setCode} 
            keyboardType="number-pad" 
            maxLength={6}
          />
        </View>

        <View style={{ height: 30 }} />

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleVerify} 
          activeOpacity={0.85}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{t('verifyButton')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleResendCode} 
          style={{ marginTop: 20, alignItems: 'center' }}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>{t('resendCode')}</Text>
        </TouchableOpacity>
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
