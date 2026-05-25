import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { authStyles as styles } from '@/constants/auth-styles';

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <StatusBar style="dark" />

      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, flex: 1 }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={{ width: 80, height: 80 }} 
            resizeMode="contain" 
          />
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#2E7D32',
            marginTop: 10
          }}>
            {t('aboutTitle')}
          </Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {/* Concept Section */}
          <Text style={sectionTitleStyle}>{t('conceptTitle')}</Text>
          <Text style={textContentStyle}>{t('conceptContent')}</Text>

          {/* Saving Planet Section */}
          <Text style={sectionTitleStyle}>{t('savingPlanetTitle')}</Text>
          <Text style={textContentStyle}>{t('savingPlanetContent')}</Text>

          {/* Waste Reality Section */}
          <Text style={sectionTitleStyle}>{t('wasteRealityTitle')}</Text>
          <Text style={textContentStyle}>{t('wasteRealityContent')}</Text>
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

const sectionTitleStyle = {
  fontSize: 14,
  fontWeight: '700' as const,
  color: '#424242',
  marginTop: 15,
  marginBottom: 8,
};

const textContentStyle = {
  fontSize: 11,
  color: '#616161',
  lineHeight: 16,
  textAlign: 'justify' as const,
  fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
};
