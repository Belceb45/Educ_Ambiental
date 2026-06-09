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
import { rewardsService, gamificationService } from '@/services/api';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { OfflineView } from '@/components/OfflineView';

interface Recompensa {
  id: number;
  tiendaFicticia?: string;
  descripcion: string;
  costoPuntos: number;
  stock: number;
}

export default function RewardsScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isOnline } = useNetworkStatus();

  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);
  const [puntos, setPuntos] = useState<number>(user?.puntosActuales ?? 0);
  const [loading, setLoading] = useState(true);
  const [canjeandoId, setCanjeandoId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await rewardsService.list();
      setRecompensas(data);
      if (user) {
        try {
          const impacto = await gamificationService.getImpacto(user.id);
          setPuntos(impacto.puntosActuales ?? 0);
        } catch {}
      }
    } catch (e) {
      console.error('Error cargando recompensas:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOnline) load();
    else setLoading(false);
  }, [isOnline, load]);

  const handleCanjear = (r: Recompensa) => {
    if (!user) return;
    if (puntos < r.costoPuntos) {
      Alert.alert(t('rewards_insufficient_title'), t('rewards_insufficient_msg'));
      return;
    }
    Alert.alert(t('rewards_confirm_title'), t('rewards_confirm_msg', { cost: r.costoPuntos }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('confirm'),
        onPress: async () => {
          setCanjeandoId(r.id);
          try {
            const res = await rewardsService.canjear(user.id, r.id);
            setPuntos(res.puntosRestantes ?? puntos - r.costoPuntos);
            setRecompensas((prev) =>
              prev.map((x) => (x.id === r.id ? { ...x, stock: Math.max(0, x.stock - 1) } : x)),
            );
            Alert.alert(t('rewards_success_title'), t('rewards_success_msg', { code: res.codigoAlfanumerico }));
          } catch (e: any) {
            Alert.alert('Error', e.message || t('rewards_error_msg'));
          } finally {
            setCanjeandoId(null);
          }
        },
      },
    ]);
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
        <Text style={styles.headerTitle}>{t('nav_rewards')}</Text>
      </View>

      <View style={styles.balanceBar}>
        <Ionicons name="leaf" size={18} color={GREEN} />
        <Text style={styles.balanceText}>{t('rewards_balance', { points: puntos })}</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {recompensas.length === 0 && <Text style={styles.empty}>{t('rewards_empty')}</Text>}
          {recompensas.map((r) => {
            const sinStock = r.stock <= 0;
            const sinPuntos = puntos < r.costoPuntos;
            return (
              <View key={r.id} style={styles.card}>
                <View style={{ flex: 1 }}>
                  {!!r.tiendaFicticia && <Text style={styles.store}>{r.tiendaFicticia}</Text>}
                  <Text style={styles.cardTitle}>{r.descripcion}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.costBadge}>
                      <Ionicons name="leaf" size={13} color={GREEN} />
                      <Text style={styles.costText}>{r.costoPuntos} pts</Text>
                    </View>
                    <Text style={styles.stock}>{t('rewards_stock', { stock: r.stock })}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.redeemBtn, (sinStock || sinPuntos) && styles.redeemBtnDisabled]}
                  onPress={() => handleCanjear(r)}
                  disabled={sinStock || canjeandoId === r.id}
                >
                  {canjeandoId === r.id ? (
                    <ActivityIndicator size="small" color={WHITE} />
                  ) : (
                    <Text style={styles.redeemText}>
                      {sinStock ? t('rewards_no_stock') : t('rewards_redeem')}
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
  balanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  balanceText: { fontSize: 15, fontWeight: '700', color: GREEN },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  empty: { fontSize: 15, color: GRAY_LABEL, textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  store: { fontSize: 12, fontWeight: '700', color: '#F57C00', marginBottom: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: TEXT_TITLE, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  costBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  costText: { fontSize: 14, fontWeight: '700', color: GREEN },
  stock: { fontSize: 12, color: GRAY_LABEL },
  redeemBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  redeemBtnDisabled: { backgroundColor: '#BDBDBD' },
  redeemText: { color: WHITE, fontWeight: '700', fontSize: 14 },
});
