import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
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

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = () => {
    if (!password) {
      setPasswordError(t('passwordRequired'));
      return;
    }
    setPasswordError('');
    console.log('Login attempt:', { phone, password, rememberMe });
  };

  const handleForgotPassword = () => {
    console.log('Forgot password');
  };

  const handleSignUp = () => {
    router.push('/register');
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
          <AuthMenu />
        </View>

        <View style={styles.brandContainer}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandText}>EducAmbiental</Text>
        </View>

        <Text style={styles.title}>{t('loginTitle')}</Text>

        <View style={styles.inputWrapper}>
          <View style={styles.inputIconBox}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1 C9.39 21 3 14.61 3 7a1 1 0 011-1h3.5a1 1 0 011 1 c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" fill="#9E9E9E" />
            </Svg>
          </View>
          <TextInput style={styles.input} placeholder={t('phonePlaceholder')} placeholderTextColor="#BDBDBD" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>

        <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
          <View style={styles.inputIconBox}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M18 8h-1V6A5 5 0 007 6v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12 a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4z M9 8V6a3 3 0 016 0v2H9z" fill="#9E9E9E" />
            </Svg>
          </View>
          <TextInput style={styles.input} placeholder={t('passwordPlaceholder')} placeholderTextColor="#BDBDBD" value={password} onChangeText={(text) => { setPassword(text); if (text) setPasswordError(''); }} secureTextEntry />
        </View>
        {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

        <View style={styles.rememberRow}>
          <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && (
                <Svg width="12" height="12" viewBox="0 0 24 24">
                  <Path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
              )}
            </View>
            <Text style={styles.rememberText}>{t('rememberMe')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>{t('loginButton')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('noAccount')} </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.linkText}>{t('createAccountLink')}</Text>
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
