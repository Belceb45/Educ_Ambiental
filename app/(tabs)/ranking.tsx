import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ThemeColors, useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { useAuth } from '@/context/AuthContext';
import { gamificationService } from '@/services/api';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { OfflineView } from '@/components/OfflineView';

interface RankEntry {
  posicion: number;
  idUsuario: string;
  nombre: string;
  puntosActuales: number;
  nivelActual: number;
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function RankingScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isOnline } = useNetworkStatus();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gamificationService.getRanking();
      setRanking(data);
    } catch (e) {
      console.error('Error cargando ranking:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOnline) load();
    else setLoading(false);
  }, [isOnline, load]);

  if (!isOnline) return <OfflineView onRetry={load} />;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="chevron-back" size={28} color={colors.textTitle} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('nav_ranking')}</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.green} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>{t('ranking_subtitle')}</Text>
          {ranking.length === 0 && <Text style={styles.empty}>{t('ranking_empty')}</Text>}
          {ranking.map((r) => {
            const isMe = user?.id === r.idUsuario;
            return (
              <View key={r.idUsuario} style={[styles.row, isMe && styles.rowMe]}>
                <View style={styles.posBox}>
                  <Text style={styles.posText}>{MEDALS[r.posicion] || `#${r.posicion}`}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, isMe && { color: colors.green }]} numberOfLines={1}>
                    {r.nombre}{isMe ? ` (${t('ranking_you')})` : ''}
                  </Text>
                  <Text style={styles.level}>{t('level')} {r.nivelActual}</Text>
                </View>
                <View style={styles.pointsBox}>
                  <Ionicons name="leaf" size={14} color={colors.green} />
                  <Text style={styles.points}>{r.puntosActuales}</Text>
                </View>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.grayBg },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: c.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: c.textTitle, flex: 1 },
  backButton: { marginLeft: -8, padding: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  subtitle: { fontSize: 14, color: c.grayLabel, marginBottom: 16 },
  empty: { fontSize: 15, color: c.grayLabel, textAlign: 'center', marginTop: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: c.grayBorder,
    gap: 12,
  },
  rowMe: { borderColor: c.green, borderWidth: 2, backgroundColor: '#F1F8E9' },
  posBox: { width: 40, alignItems: 'center' },
  posText: { fontSize: 18, fontWeight: '800', color: c.textTitle },
  name: { fontSize: 15, fontWeight: '700', color: c.textTitle },
  level: { fontSize: 12, color: c.grayLabel, marginTop: 1 },
  pointsBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  points: { fontSize: 15, fontWeight: '700', color: c.green },
});
