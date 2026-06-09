import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { modulesService } from '@/services/api';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { OfflineView } from '@/components/OfflineView';

interface Modulo {
  id: number;
  titulo: string;
  descripcion: string;
  contenido?: string;
  tipo?: string;
  puntosOtorgados: number;
}

export default function LearnScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isOnline } = useNetworkStatus();

  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [completados, setCompletados] = useState<number[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await modulesService.list();
      setModulos(data);
    } catch (e) {
      console.error('Error cargando módulos:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOnline) load();
    else setLoading(false);
  }, [isOnline, load]);

  const handleComplete = async (modulo: Modulo) => {
    if (!user) return;
    setCompletingId(modulo.id);
    try {
      await modulesService.complete(user.id, modulo.id);
      setCompletados((prev) => [...prev, modulo.id]);
      Alert.alert(
        t('moduleCompletedTitle'),
        t('moduleCompletedMsg', { points: modulo.puntosOtorgados }),
      );
    } catch (e: any) {
      Alert.alert(t('moduleErrorTitle'), e.message || t('moduleErrorMsg'));
    } finally {
      setCompletingId(null);
    }
  };

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
        <Text style={styles.headerTitle}>{t('nav_learn')}</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>{t('learn_subtitle')}</Text>
          {modulos.length === 0 && (
            <Text style={styles.empty}>{t('learn_empty')}</Text>
          )}
          {modulos.map((m) => {
            const done = completados.includes(m.id);
            return (
              <View key={m.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{m.tipo || 'MÓDULO'}</Text>
                  </View>
                  <View style={styles.xpBadge}>
                    <Ionicons name="leaf" size={14} color={GREEN} />
                    <Text style={styles.xpText}>+{m.puntosOtorgados} XP</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>{m.titulo}</Text>
                {!!m.descripcion && <Text style={styles.cardDesc}>{m.descripcion}</Text>}
                {!!m.contenido && <Text style={styles.cardBody}>{m.contenido}</Text>}

                <TouchableOpacity
                  style={[styles.completeBtn, done && styles.completeBtnDone]}
                  onPress={() => handleComplete(m)}
                  disabled={done || completingId === m.id}
                >
                  {completingId === m.id ? (
                    <ActivityIndicator size="small" color={WHITE} />
                  ) : (
                    <Text style={styles.completeBtnText}>
                      {done ? t('module_done') : t('module_complete')}
                    </Text>
                  )}
                </TouchableOpacity>
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
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: '700', color: GREEN, letterSpacing: 0.5 },
  xpBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  xpText: { fontSize: 13, fontWeight: '700', color: GREEN },
  cardTitle: { fontSize: 17, fontWeight: '700', color: TEXT_TITLE, marginBottom: 6 },
  cardDesc: { fontSize: 14, color: GRAY_LABEL, marginBottom: 8, lineHeight: 20 },
  cardBody: { fontSize: 14, color: '#555', marginBottom: 12, lineHeight: 21 },
  completeBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  completeBtnDone: { backgroundColor: '#A5D6A7' },
  completeBtnText: { color: WHITE, fontWeight: '700', fontSize: 15 },
});
