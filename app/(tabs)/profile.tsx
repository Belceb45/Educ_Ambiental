import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useFocusEffect, useRouter } from 'expo-router';

import { GRAY_BG, GRAY_BORDER, GRAY_LABEL, GREEN, TEXT_TITLE, WHITE } from '@/constants/auth-styles';
import { useAuth } from '@/context/AuthContext';
import { gamificationService } from '@/services/api';

const { width: SCREEN_W } = Dimensions.get('window');

const GREEN_DARK = '#2E7D32';
const GREEN_PALE = '#E8F5E9';

interface Insignia {
  id: number;
  nombre: string;
  descripcion: string;
  iconoUrl?: string;
  obtenida?: boolean;
}

interface HistorialItem {
  id: number;
  cantidad: number;
  tipoOperacion: string;
  motivo: string;
  fecha: string;
}

interface Impacto {
  puntosActuales: number;
  nivelActual: number;
  etiquetaNivel: string;
  xpEnNivel: number;
  xpParaSiguiente: number;
  totalModulosCompletados: number;
  insignias: Insignia[];
  historialReciente: HistorialItem[];
}

// ─── Barra de XP ──────────────────────────────────────────────────────────────
function XpBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min((current / Math.max(max, 1)) * 100, 100);
  return (
    <View style={xpStyles.wrapper}>
      <View style={xpStyles.container}>
        <View style={xpStyles.track}>
          <View style={[xpStyles.fill, { width: `${pct}%` }]} />
        </View>
        <Text style={xpStyles.goalIcon}>⭐</Text>
      </View>
      <Text style={xpStyles.label}>{current} / {max} XP</Text>
    </View>
  );
}

const xpStyles = StyleSheet.create({
  wrapper: { width: '100%', marginTop: 4 },
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6, backgroundColor: '#A5D6A7' },
  goalIcon: { fontSize: 18 },
  label: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: 4, textAlign: 'left' },
});

// ─── Badge de nivel (escudo) ──────────────────────────────────────────────────
function LevelBadge({ level }: { level: number }) {
  return (
    <View style={badgeStyles.wrap}>
      <Svg width="48" height="54" viewBox="0 0 48 54">
        <Path d="M24 2L4 10v16c0 13.25 8.5 24.1 20 27 11.5-2.9 20-13.75 20-27V10L24 2z" fill={GREEN_DARK} />
        <Path d="M24 6L7 13v13c0 11 7 20 17 22.5 10-2.5 17-11.5 17-22.5V13L24 6z" fill={GREEN} />
      </Svg>
      <View style={badgeStyles.overlay}>
        <Text style={badgeStyles.number}>{level}</Text>
      </View>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  wrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', top: 12, alignItems: 'center', justifyContent: 'center' },
  number: { fontSize: 18, fontWeight: '800', color: WHITE },
});

function SectionTitle({ children }: { children: string }) {
  return <Text style={sectionStyles.title}>{children}</Text>;
}
const sectionStyles = StyleSheet.create({
  title: {
    fontSize: 13, fontWeight: '600', color: GRAY_LABEL, textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: 12, marginLeft: 2,
  },
});

// ─── Tarjeta de estadística (resumen) ─────────────────────────────────────────
function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}
const statStyles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: GRAY_BORDER,
    padding: 14, alignItems: 'center', gap: 2,
  },
  icon: { fontSize: 24, marginBottom: 2 },
  value: { fontSize: 20, fontWeight: '800', color: GREEN_DARK },
  label: { fontSize: 11, fontWeight: '500', color: GRAY_LABEL, textAlign: 'center' },
});

// ─── Insignia ─────────────────────────────────────────────────────────────────
function BadgeItem({ insignia }: { insignia: Insignia }) {
  const obtenida = !!insignia.obtenida;
  return (
    <View style={[insigniaStyles.item, !obtenida && insigniaStyles.itemLocked]}>
      <Text style={[insigniaStyles.icon, !obtenida && { opacity: 0.35 }]}>{insignia.iconoUrl || '🏅'}</Text>
      <Text style={[insigniaStyles.name, !obtenida && { color: GRAY_LABEL }]} numberOfLines={2}>
        {insignia.nombre}
      </Text>
      {obtenida && (
        <View style={insigniaStyles.check}>
          <Text style={{ color: WHITE, fontSize: 10, fontWeight: '700' }}>✓</Text>
        </View>
      )}
    </View>
  );
}
const insigniaStyles = StyleSheet.create({
  item: {
    width: (SCREEN_W - 40 - 24) / 3,
    backgroundColor: WHITE, borderRadius: 14, borderWidth: 1, borderColor: '#C8E6C9',
    paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center', gap: 6, position: 'relative',
  },
  itemLocked: { borderColor: GRAY_BORDER, backgroundColor: GRAY_BG },
  icon: { fontSize: 30 },
  name: { fontSize: 11, fontWeight: '600', color: TEXT_TITLE, textAlign: 'center' },
  check: {
    position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9,
    backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center',
  },
});

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 80 }: { name: string; size?: number }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, backgroundColor: GREEN_PALE,
      borderWidth: 3, borderColor: GREEN, alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: size * 0.35, fontWeight: '700', color: GREEN_DARK }}>{initials || '🌿'}</Text>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [impacto, setImpacto] = useState<Impacto | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (user) {
        setLoading(true);
        gamificationService
          .getImpacto(user.id)
          .then((data) => { if (active) setImpacto(data); })
          .catch((e) => console.error('Error cargando impacto:', e))
          .finally(() => { if (active) setLoading(false); });
      } else {
        setLoading(false);
      }
      return () => { active = false; };
    }, [user]),
  );

  if (!user) return null;

  const nivel = impacto?.nivelActual ?? user.nivelActual ?? 1;
  const xp = impacto?.xpEnNivel ?? 0;
  const xpMax = impacto?.xpParaSiguiente ?? 1000;
  const puntos = impacto?.puntosActuales ?? user.puntosActuales ?? 0;
  const modulos = impacto?.totalModulosCompletados ?? 0;
  const insignias = impacto?.insignias ?? [];

  const handleLogout = () => {
    Alert.alert(t('logoutConfirm'), '', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('confirm'), onPress: logout, style: 'destructive' },
    ]);
  };

  const formatName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) return fullName;
    const firstName = parts[0];
    const initials = parts.slice(1).map((p) => p[0].toUpperCase() + '.').join(' ');
    return `${firstName} ${initials}`;
  };

  const rawName = user?.nombre || 'Eco Usuario';
  const displayName = formatName(rawName);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/settings')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Svg width="22" height="22" viewBox="0 0 24 24">
              <Path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41l-0.36,2.54c-0.59,0.24-1.13,0.57-1.62,0.94L5.24,5.33c-0.22-0.07-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.81,11.69,4.81,12c0,0.31,0.02,0.65,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.07,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" fill={WHITE} />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleLogout}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Svg width="22" height="22" viewBox="0 0 24 24">
              <Path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="rgba(255,255,255,0.8)" />
            </Svg>
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <Avatar name={rawName} size={80} />
          <View style={{ alignItems: 'center', marginTop: 10, gap: 2 }}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userSub}>{user?.correo ?? ''}</Text>
          </View>
        </View>

        <View style={styles.levelRow}>
          <LevelBadge level={nivel} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.levelLabel}>
              {t('level')} {nivel} · {impacto?.etiquetaNivel ?? ''}
            </Text>
            <XpBar current={xp} max={xpMax} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading && !impacto ? (
          <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 30 }} />
        ) : (
          <>
            {/* Resumen */}
            <SectionTitle>{t('profile_summary')}</SectionTitle>
            <View style={styles.grid}>
              <StatCard icon="⭐" value={String(puntos)} label={t('totalXp')} />
              <StatCard icon="📈" value={String(nivel)} label={t('level')} />
              <StatCard icon="📚" value={String(modulos)} label={t('modulesCompleted')} />
            </View>

            {/* Ranking */}
            <TouchableOpacity style={styles.rankingBtn} onPress={() => router.push('/ranking')}>
              <Text style={styles.rankingIcon}>🏆</Text>
              <Text style={styles.rankingText}>{t('viewRanking')}</Text>
              <Text style={styles.rankingChevron}>›</Text>
            </TouchableOpacity>

            <View style={{ height: 24 }} />

            {/* Insignias */}
            <SectionTitle>{t('badges')}</SectionTitle>
            {insignias.length === 0 ? (
              <Text style={styles.emptyBadges}>{t('badges_empty')}</Text>
            ) : (
              <View style={styles.badgeGrid}>
                {insignias.map((i) => <BadgeItem key={i.id} insignia={i} />)}
              </View>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GRAY_BG },
  header: {
    backgroundColor: GREEN, paddingTop: 60, paddingBottom: 28, paddingHorizontal: 24, gap: 20,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerButtons: {
    position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16, zIndex: 10,
  },
  iconBtn: { padding: 4 },
  avatarSection: { alignItems: 'center', marginTop: 4 },
  userName: { fontSize: 22, fontWeight: '700', color: WHITE, letterSpacing: -0.3 },
  userSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  levelRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 16, padding: 14,
  },
  levelLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginBottom: 2 },
  scroll: { paddingHorizontal: 20, paddingTop: 28 },
  grid: { flexDirection: 'row', gap: 12 },
  rankingBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: WHITE,
    borderRadius: 16, borderWidth: 1, borderColor: GRAY_BORDER, padding: 16, marginTop: 16,
  },
  rankingIcon: { fontSize: 22 },
  rankingText: { flex: 1, fontSize: 15, fontWeight: '600', color: TEXT_TITLE },
  rankingChevron: { fontSize: 24, color: GRAY_LABEL },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  emptyBadges: { fontSize: 14, color: GRAY_LABEL, textAlign: 'center', marginTop: 10 },
});
