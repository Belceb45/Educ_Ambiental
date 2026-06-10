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
import { notificationsService } from '@/services/api';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { OfflineView } from '@/components/OfflineView';

interface Notificacion {
  id: number;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '';
  }
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isOnline } = useNetworkStatus();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [items, setItems] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await notificationsService.list(user.id);
      setItems(data);
    } catch (e) {
      console.error('Error cargando notificaciones:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOnline) load();
    else setLoading(false);
  }, [isOnline, load]);

  const handleMarkAll = async () => {
    if (!user) return;
    try {
      await notificationsService.markAllRead(user.id);
      setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePress = async (n: Notificacion) => {
    if (n.leida || !user) return;
    try {
      await notificationsService.markRead(n.id, user.id);
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x)));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOnline) return <OfflineView onRetry={load} />;

  const hayNoLeidas = items.some((n) => !n.leida);

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
        <Text style={styles.headerTitle}>{t('nav_notifications')}</Text>
        {hayNoLeidas && (
          <TouchableOpacity onPress={handleMarkAll}>
            <Text style={styles.markAll}>{t('notif_mark_all')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.green} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {items.length === 0 && (
            <View style={styles.emptyBox}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.grayLabel} />
              <Text style={styles.empty}>{t('notif_empty')}</Text>
            </View>
          )}
          {items.map((n) => (
            <TouchableOpacity
              key={n.id}
              style={[styles.card, !n.leida && styles.cardUnread]}
              onPress={() => handlePress(n)}
              activeOpacity={0.7}
            >
              {!n.leida && <View style={styles.dot} />}
              <View style={{ flex: 1 }}>
                <Text style={[styles.message, !n.leida && { fontWeight: '700' }]}>{n.mensaje}</Text>
                <Text style={styles.date}>{formatDate(n.fechaCreacion)}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  headerTitle: { fontSize: 26, fontWeight: '800', color: c.textTitle, flex: 1 },
  backButton: { marginLeft: -8, padding: 4 },
  markAll: { fontSize: 13, fontWeight: '700', color: c.green },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 12 },
  empty: { fontSize: 15, color: c.grayLabel, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: c.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: c.grayBorder,
  },
  cardUnread: { backgroundColor: '#F1F8E9', borderColor: '#C8E6C9' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.green },
  message: { fontSize: 14, color: c.textTitle, lineHeight: 20 },
  date: { fontSize: 11, color: c.grayLabel, marginTop: 4 },
});
