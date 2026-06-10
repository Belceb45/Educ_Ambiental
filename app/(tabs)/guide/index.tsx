import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, FlatList, Platform, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { ThemeColors, useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { contentService } from '@/services/api';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { OfflineView } from '@/components/OfflineView';

interface ContentItem {
  id: number;
  titulo: string;
  cuerpo: string; // Cambio de 'contenido' a 'cuerpo' para coincidir con el backend
  tipo: string;
  categoria?: string;
  imagenUrl?: string;
}

export default function GuideScreen() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const { category: navCategory } = useLocalSearchParams<{ category?: string }>();
  const { isOnline } = useNetworkStatus();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [loading, setLoading] = useState(true);
  const [guides, setGuides] = useState<ContentItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(navCategory || null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [t('cat_all'), t('cat_plastics'), t('cat_paper'), t('cat_glass'), t('cat_metals')];

  useEffect(() => {
    if (!authLoading && user && isOnline) {
      loadGuides();
    } else if (!authLoading && !user) {
      setLoading(false);
    } else if (!isOnline && guides.length === 0) {
      setLoading(false);
    }
  }, [isOnline, user, authLoading]);

  // Sincronizar con el parámetro de navegación si cambia
  useEffect(() => {
    if (navCategory) {
      setSelectedCategory(navCategory);
    }
  }, [navCategory]);

  const loadGuides = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await contentService.getByType('GUIA');
      setGuides(data);
    } catch (error) {
      console.error('Error loading guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryGuides = selectedCategory && selectedCategory !== t('cat_all')
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

  // RF8 — Búsqueda predictiva por nombre de material/producto en el catálogo.
  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const query = normalize(searchQuery.trim());
  const filteredGuides = query
    ? categoryGuides.filter(g =>
        normalize(`${g.titulo} ${g.categoria || ''} ${g.cuerpo}`).includes(query),
      )
    : categoryGuides;

  const renderGuideItem = ({ item }: { item: ContentItem }) => (
    <TouchableOpacity 
      style={styles.guideCard} 
      activeOpacity={0.9}
      onPress={() => router.push({
        pathname: '/(tabs)/guide/[id]',
        params: { id: item.id.toString() }
      })}
    >
      {item.imagenUrl && (
        <Image source={{ uri: item.imagenUrl }} style={styles.guideImage} />
      )}
      <View style={styles.guideInfo}>
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>{item.categoria || t('category_general')}</Text>
        </View>
        <Text style={styles.guideTitle}>{item.titulo}</Text>
        <Text style={styles.guideExcerpt} numberOfLines={2}>
          {item.cuerpo.replace(/\n/g, ' ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  if (!isOnline && guides.length === 0) {
    return <OfflineView onRetry={loadGuides} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('nav_guide')}</Text>
        <Text style={styles.headerSubtitle}>{t('guide_subtitle')}</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.grayLabel} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('guide_search_placeholder')}
            placeholderTextColor={colors.grayLabel}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.grayLabel} />
            </TouchableOpacity>
          )}
        </View>
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
            <Ionicons name={query ? 'search-outline' : 'document-text-outline'} size={64} color={colors.grayLabel} />
            <Text style={styles.emptyText}>{query ? t('no_search_results') : t('no_guides_available')}</Text>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.grayBg,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: c.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: c.textTitle,
  },
  headerSubtitle: {
    fontSize: 16,
    color: c.grayLabel,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.grayBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.grayBorder,
    paddingHorizontal: 14,
    height: 46,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: c.textTitle,
    paddingVertical: 0,
  },
  categoryFilterContainer: {
    backgroundColor: c.white,
    paddingBottom: 15,
  },
  categoryList: {
    paddingHorizontal: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: c.grayBg,
    marginRight: 10,
    borderWidth: 1,
    borderColor: c.grayBorder,
  },
  categoryChipActive: {
    backgroundColor: c.green,
    borderColor: c.green,
  },
  categoryChipText: {
    fontSize: 14,
    color: c.grayLabel,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: c.white,
  },
  listContent: {
    padding: 24,
  },
  guideCard: {
    backgroundColor: c.white,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: c.grayBorder,
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
    backgroundColor: c.greenLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  tagText: {
    color: c.green,
    fontSize: 12,
    fontWeight: 'bold',
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: c.textTitle,
    marginBottom: 8,
  },
  guideExcerpt: {
    fontSize: 14,
    color: c.grayLabel,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: c.grayLabel,
    marginTop: 15,
    textAlign: 'center',
  },
});
