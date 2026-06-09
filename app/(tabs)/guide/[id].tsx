import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { GRAY_BG, TEXT_TITLE, WHITE, GREEN, GRAY_LABEL, GREEN_LIGHT, GRAY_BORDER } from '@/constants/auth-styles';
import { contentService } from '@/services/api';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { OfflineView } from '@/components/OfflineView';

const { width } = Dimensions.get('window');

interface ContentItem {
  id: number;
  titulo: string;
  cuerpo: string;
  tipo: string;
  categoria?: string;
  imagenUrl?: string;
}

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isOnline } = useNetworkStatus();
  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState<ContentItem | null>(null);

  useEffect(() => {
    if (id && isOnline) {
      loadGuideDetails();
    } else if (!isOnline) {
      setLoading(false);
    }
  }, [id, isOnline]);

  const loadGuideDetails = async () => {
    setLoading(true);
    try {
      // Intentar obtener todos y filtrar por ID ya que el servicio suele devolver listas
      const data = await contentService.getByType('GUIA');
      const found = data.find((g: any) => g.id.toString() === id);
      setGuide(found || null);
    } catch (error) {
      console.error('Error loading guide details:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (text: string) => {
    // Manejar saltos de línea y formateo básico
    // Si el texto viene con marcadores tipo "1.", "2." o "-", podemos detectarlos
    return text.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <View key={index} style={{ height: 10 }} />;

      // Detectar listas numeradas o con viñetas
      const isListItem = /^\d+\.|^-|^\*/.test(trimmedLine);

      return (
        <View key={index} style={isListItem ? styles.listItem : styles.paragraph}>
          {isListItem && <View style={styles.bullet} />}
          <Text style={isListItem ? styles.listItemText : styles.bodyText}>
            {trimmedLine}
          </Text>
        </View>
      );
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  if (!isOnline && !guide) {
    return <OfflineView onRetry={loadGuideDetails} />;
  }

  if (!guide) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: t('nav_guide'), headerShown: true }} />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={64} color={GRAY_LABEL} />
          <Text style={styles.emptyText}>{t('guide_not_found') || 'Guía no encontrada'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t('back') || 'Volver'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
      <Stack.Screen 
        options={{ 
          title: guide.categoria || t('nav_guide'),
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.headerCircleButton}
            >
              <Ionicons name="arrow-back" size={24} color={TEXT_TITLE} />
            </TouchableOpacity>
          ),
        }} 
      />

      {guide.imagenUrl ? (
        <Image source={{ uri: guide.imagenUrl }} style={styles.image} />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: GREEN_LIGHT }]}>
          <Ionicons name="leaf" size={80} color={GREEN} />
        </View>
      )}

      <View style={styles.contentContainer}>
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>{guide.categoria || t('category_general')}</Text>
        </View>
        
        <Text style={styles.title}>{guide.titulo}</Text>
        
        <View style={styles.divider} />
        
        <View style={styles.body}>
          {renderContent(guide.cuerpo)}
        </View>
        
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  image: {
    width: '100%',
    height: 250,
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 24,
    marginTop: -20,
    backgroundColor: WHITE,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  tagText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: TEXT_TITLE,
    lineHeight: 32,
  },
  divider: {
    height: 1,
    backgroundColor: GRAY_BORDER,
    marginVertical: 20,
  },
  body: {
    marginTop: 0,
  },
  paragraph: {
    marginBottom: 15,
  },
  bodyText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 5,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
    marginTop: 9,
    marginRight: 12,
  },
  listItemText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    flex: 1,
  },
  emptyText: {
    fontSize: 18,
    color: GRAY_LABEL,
    marginTop: 15,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 25,
    backgroundColor: GREEN,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
