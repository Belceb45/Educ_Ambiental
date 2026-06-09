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

import { GREEN, WHITE, TEXT_TITLE, GRAY_LABEL, GRAY_BG, GRAY_BORDER } from '@/constants/auth-styles';
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
          <Ionicons name="chevron-back" size={28} color={TEXT_TITLE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('nav_ranking')}</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={GREEN} />
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
                  <Text style={[styles.name, isMe && { color: GREEN }]} numberOfLines={1}>
                    {r.nombre}{isMe ? ` (${t('ranking_you')})` : ''}
                  </Text>
                  <Text style={styles.level}>{t('level')} {r.nivelActual}</Text>
                </View>
                <View style={styles.pointsBox}>
                  <Ionicons name="leaf" size={14} color={GREEN} />
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GRAY_BG },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: TEXT_TITLE, flex: 1 },
  backButton: { marginLeft: -8, padding: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  subtitle: { fontSize: 14, color: GRAY_LABEL, marginBottom: 16 },
  empty: { fontSize: 15, color: GRAY_LABEL, textAlign: 'center', marginTop: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    gap: 12,
  },
  rowMe: { borderColor: GREEN, borderWidth: 2, backgroundColor: '#F1F8E9' },
  posBox: { width: 40, alignItems: 'center' },
  posText: { fontSize: 18, fontWeight: '800', color: TEXT_TITLE },
  name: { fontSize: 15, fontWeight: '700', color: TEXT_TITLE },
  level: { fontSize: 12, color: GRAY_LABEL, marginTop: 1 },
  pointsBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  points: { fontSize: 15, fontWeight: '700', color: GREEN },
});
