import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform, ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { useAuthStyles } from '@/hooks/use-themed-styles';
import { useTheme } from '@/context/ThemeContext';

export default function TermsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const styles = useAuthStyles();
  const { isDark, colors } = useTheme();

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '700',
          color: colors.textTitle,
          marginBottom: 10,
          textAlign: 'center'
        }}>
          {t('termsTitle')}
        </Text>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <Text style={{
            fontSize: 9.5,
            color: colors.grayLabel,
            lineHeight: 12,
            textAlign: 'justify',
            fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif'
          }}>
            {t('termsContent')}
          </Text>
        </ScrollView>

        <TouchableOpacity 
          style={[styles.primaryButton, { marginTop: 15, marginBottom: 0, height: 45 }]} 
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>{t('backButton')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
