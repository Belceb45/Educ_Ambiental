import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { authStyles as styles } from '@/constants/auth-styles';

export default function ContactScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!name || !email || !subject || !message) {
      Alert.alert('Error', t('allFieldsRequired') || 'Por favor completa todos los campos');
      return;
    }
    // Aquí iría la lógica para enviar el mensaje
    console.log('Sending message:', { name, email, subject, message });
    Alert.alert(t('contactTitle'), t('contactSuccess'));
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <StatusBar style="dark" />

      <View style={[styles.topWave, { height: 180 }]}>
        <Svg width="100%" height="180" viewBox="0 0 390 180" preserveAspectRatio="none">
          <Path d="M0,0 L390,0 L390,100 Q300,180 180,130 Q80,90 0,140 Z" fill="#E8F5E9" />
        </Svg>
      </View>

      {/* Botón de flecha atrás en la parte superior izquierda */}
      <TouchableOpacity 
        style={{ 
          position: 'absolute', 
          top: 50, 
          left: 20, 
          zIndex: 100,
          padding: 8 
        }} 
        onPress={() => router.back()}
      >
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" fill="#2E7D32" />
        </Svg>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { flexGrow: 1, justifyContent: 'center', paddingTop: 0 }
        ]} 
        keyboardShouldPersistTaps="handled"
      >
        {/* Name input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIconBox}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#9E9E9E" />
            </Svg>
          </View>
          <TextInput 
            style={styles.input} 
            placeholder={t('contactNamePlaceholder')} 
            placeholderTextColor="#BDBDBD" 
            value={name} 
            onChangeText={setName} 
          />
        </View>

        {/* Email input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIconBox}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#9E9E9E" />
            </Svg>
          </View>
          <TextInput 
            style={styles.input} 
            placeholder={t('contactEmailPlaceholder')} 
            placeholderTextColor="#BDBDBD" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none" 
          />
        </View>

        {/* Subject input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIconBox}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M14,17H7V15H14V17M17,13H7V11H17V13M17,9H7V7H17V9M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" fill="#9E9E9E" />
            </Svg>
          </View>
          <TextInput 
            style={styles.input} 
            placeholder={t('contactSubjectPlaceholder')} 
            placeholderTextColor="#BDBDBD" 
            value={subject} 
            onChangeText={setSubject} 
          />
        </View>

        {/* Message input */}
        <View style={[styles.inputWrapper, { height: 120, alignItems: 'flex-start', paddingTop: 12 }]}>
          <View style={[styles.inputIconBox, { marginTop: 2 }]}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H5.17L4,17.17V4H20V16Z" fill="#9E9E9E" />
            </Svg>
          </View>
          <TextInput 
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
            placeholder={t('contactMessagePlaceholder')} 
            placeholderTextColor="#BDBDBD" 
            value={message} 
            onChangeText={setMessage} 
            multiline 
            numberOfLines={4} 
          />
        </View>

        <View style={{ height: 20 }} />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSend} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>{t('sendButton')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
