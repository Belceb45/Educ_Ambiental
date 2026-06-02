import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, FlatList, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { GRAY_BG, TEXT_TITLE, WHITE, GREEN, GRAY_LABEL, GREEN_LIGHT, GRAY_BORDER } from '@/constants/auth-styles';
import { contentService } from '@/services/api';

interface ContentItem {
  id: number;
  titulo: string;
  cuerpo: string; // Cambio de 'contenido' a 'cuerpo' para coincidir con el backend
  tipo: string;
  categoria?: string;
  imagenUrl?: string;
}

export default function GuideScreen() {
  const { t } = useTranslation();
  const { category: navCategory } = useLocalSearchParams<{ category?: string }>();
  const [loading, setLoading] = useState(true);
  const [guides, setGuides] = useState<ContentItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(navCategory || null);

  const categories = [t('cat_all'), t('cat_plastics'), t('cat_paper'), t('cat_glass'), t('cat_metals')];

  useEffect(() => {
    loadGuides();
  }, []);

  // Sincronizar con el parámetro de navegación si cambia
  useEffect(() => {
    if (navCategory) {
      setSelectedCategory(navCategory);
    }
  }, [navCategory]);

  const loadGuides = async () => {
    try {
      const data = await contentService.getByType('GUIA');
      setGuides(data);
    } catch (error) {
      console.error('Error loading guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuides = selectedCategory && selectedCategory !== t('cat_all')
    ? guides.filter(g => {
        // Lógica de filtrado por categoría (basada en el título si el campo categoria no viene del backend)
        const target = (g.categoria || g.titulo).toLowerCase();
        const selected = selectedCategory.toLowerCase().replace(/s$/, ''); // singularizar para búsqueda más amplia
        
        if (selected.includes('plástico') || selected.includes('plastic')) {
          return target.includes('plástico') || target.includes('plastic');
        }
        if (selected.includes('papel') || selected.includes('paper') || selected.includes('cartón') || selected.includes('cardboard')) {
          return target.includes('papel') || target.includes('paper') || target.includes('cartón') || target.includes('cardboard');
        }
        if (selected.includes('vidrio') || selected.includes('glass')) {
          return target.includes('vidrio') || target.includes('glass');
        }
        if (selected.includes('metal')) {
          return target.includes('metal');
        }
        return target.includes(selected);
      })
    : guides;

  const renderGuideItem = ({ item }: { item: ContentItem }) => (
    <TouchableOpacity style={styles.guideCard} activeOpacity={0.9}>
      {item.imagenUrl && (
        <Image source={{ uri: item.imagenUrl }} style={styles.guideImage} />
      )}
      <View style={styles.guideInfo}>
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>{item.categoria || t('category_general')}</Text>
        </View>
        <Text style={styles.guideTitle}>{item.titulo}</Text>
        <Text style={styles.guideExcerpt}>{item.cuerpo}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('nav_guide')}</Text>
        <Text style={styles.headerSubtitle}>{t('guide_subtitle')}</Text>
      </View>

      <View style={styles.categoryFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {categories.map((cat) => {
            const isAll = cat === t('cat_all');
            const isActive = selectedCategory === cat || (isAll && !selectedCategory);
            
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  isActive ? styles.categoryChipActive : null
                ]}
                onPress={() => setSelectedCategory(isAll ? null : cat)}
              >
                <Text style={[
                  styles.categoryChipText,
                  isActive ? styles.categoryChipTextActive : null
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredGuides}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGuideItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={GRAY_LABEL} />
            <Text style={styles.emptyText}>{t('no_guides_available')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY_BG,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: WHITE,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_TITLE,
  },
  headerSubtitle: {
    fontSize: 16,
    color: GRAY_LABEL,
    marginTop: 4,
  },
  categoryFilterContainer: {
    backgroundColor: WHITE,
    paddingBottom: 15,
  },
  categoryList: {
    paddingHorizontal: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: GRAY_BG,
    marginRight: 10,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
  },
  categoryChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  categoryChipText: {
    fontSize: 14,
    color: GRAY_LABEL,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: WHITE,
  },
  listContent: {
    padding: 24,
  },
  guideCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  guideImage: {
    width: '100%',
    height: 150,
  },
  guideInfo: {
    padding: 20,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  tagText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: 'bold',
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_TITLE,
    marginBottom: 8,
  },
  guideExcerpt: {
    fontSize: 14,
    color: GRAY_LABEL,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: GRAY_LABEL,
    marginTop: 15,
    textAlign: 'center',
  },
});
