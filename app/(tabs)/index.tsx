import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { useHomeStyles } from '@/hooks/use-themed-styles';
import { ThemeColors, useTheme } from '@/context/ThemeContext';
import { dashboardService } from '@/services/api';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { OfflineView } from '@/components/OfflineView';

interface DashboardData {
  saludo: string;
  puntosActuales: number;
  nivelActual: string;
  tipDelDia: {
    titulo: string;
    cuerpo: string;
    imagenUrl?: string;
  } | null;
  articulosRecientes: {
    id: number;
    titulo: string;
    cuerpo: string;
    imagenUrl?: string;
  }[];
}

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const { isDark, colors } = useTheme();
  const styles = useHomeStyles();
  const quickStyles = React.useMemo(() => makeQuickStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    // Solo cargamos si el AuthContext terminó de cargar y tenemos un usuario
    if (!authLoading && user && isOnline) {
      loadDashboard();
    } else if (!authLoading && !user) {
      // Si no hay usuario, simplemente dejamos de mostrar el spinner de carga local
      setLoading(false);
    } else if (!isOnline && !data) {
      setLoading(false);
    }
  }, [isOnline, user, authLoading]);

  const loadDashboard = async () => {
    // Doble verificación de usuario antes de la petición
    if (!user) return;
    
    setLoading(true);
    try {
      const dashboardData = await dashboardService.getInicio();
      setData(dashboardData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 1, title: t('cat_plastics'), icon: 'M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z', color: '#E3F2FD', iconColor: '#1976D2' },
    { id: 2, title: t('cat_paper'), icon: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z', color: '#FFF3E0', iconColor: '#F57C00' },
    { id: 3, title: t('cat_glass'), icon: 'M12 2c-3.87 0-7 3.13-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', color: '#E8F5E9', iconColor: '#388E3C' },
    { id: 4, title: t('cat_metals'), icon: 'M12 2L1 21h22L12 2zm0 3.45L20.4 19H3.6L12 5.45z', color: '#F3E5F5', iconColor: '#7B1FA2' },
  ];

  const formatName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) return fullName;
    const firstName = parts[0];
    const initials = parts.slice(1).map(p => p[0].toUpperCase() + '.').join(' ');
    return `${firstName} ${initials}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  if (!isOnline && !data) {
    return <OfflineView onRetry={loadDashboard} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>{data?.saludo || t('welcome_back')}</Text>
          <View style={styles.headerRow}>
            <Text style={styles.titleText}>{user?.nombre ? formatName(user.nombre) : 'Eco Amigo'}</Text>
            <View style={styles.pointsBadge}>
              <Ionicons name="leaf" size={16} color={colors.green} />
              <Text style={styles.pointsText}>{data?.puntosActuales ?? user?.puntosActuales ?? 0} pts</Text>
            </View>
          </View>
        </View>

        {/* Acciones rápidas de gamificación */}
        <View style={quickStyles.row}>
          <TouchableOpacity style={quickStyles.action} onPress={() => router.push('/learn')}>
            <View style={[quickStyles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="school-outline" size={22} color={colors.green} />
            </View>
            <Text style={quickStyles.label}>{t('nav_learn')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={quickStyles.action} onPress={() => router.push('/rewards')}>
            <View style={[quickStyles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="gift-outline" size={22} color="#F57C00" />
            </View>
            <Text style={quickStyles.label}>{t('nav_rewards')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={quickStyles.action} onPress={() => router.push('/ranking')}>
            <View style={[quickStyles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="trophy-outline" size={22} color="#1976D2" />
            </View>
            <Text style={quickStyles.label}>{t('nav_ranking')}</Text>
          </TouchableOpacity>
        </View>

        {data?.tipDelDia && (
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb-outline" size={20} color={colors.green} />
              <Text style={styles.tipTitle}>{t('ecoTip')}</Text>
            </View>
            <Text style={styles.tipContent}>{data.tipDelDia.cuerpo}</Text>
          </View>
        )}

        <Text style={[styles.titleText, { fontSize: 18, marginBottom: 15, marginTop: 10 }]}>{t('recycling_categories')}</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={styles.categoryCard}
              onPress={() => router.push({ pathname: '/(tabs)/guide', params: { category: cat.title } })}
            >
              <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                <Svg width="26" height="26" viewBox="0 0 24 24">
                  <Path d={cat.icon} fill={cat.iconColor} />
                </Svg>
              </View>
              <Text style={styles.categoryTitle}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {data?.articulosRecientes && data.articulosRecientes.length > 0 && (
          <View style={styles.articlesSection}>
            <Text style={[styles.titleText, { fontSize: 18, marginBottom: 15 }]}>{t('recentActivity')}</Text>
            {data.articulosRecientes.map((art) => (
              <TouchableOpacity key={art.id} style={styles.articleCard}>
                {art.imagenUrl && (
                  <Image source={{ uri: art.imagenUrl }} style={styles.articleImage} />
                )}
                <View style={styles.articleInfo}>
                  <Text style={styles.articleTitle}>{art.titulo}</Text>
                  <Text style={styles.articleDesc} numberOfLines={3}>{art.cuerpo}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const makeQuickStyles = (c: ThemeColors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: c.white,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: c.grayBorder,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textTitle,
  },
});
