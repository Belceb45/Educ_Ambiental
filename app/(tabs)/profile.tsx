import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { GRAY_BG, GRAY_BORDER, GRAY_LABEL, GREEN, TEXT_TITLE, WHITE } from '@/constants/auth-styles';
import { useAuth } from '@/context/AuthContext';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Colores extra (derivados del verde principal) ────────────────────────────
const GREEN_DARK  = '#2E7D32';
const GREEN_PALE  = '#E8F5E9';
const AMBER       = '#FF9800';
const AMBER_PALE  = '#FFF3E0';
const BLUE        = '#1976D2';
const BLUE_PALE   = '#E3F2FD';
const TEAL        = '#00897B';
const TEAL_PALE   = '#E0F2F1';
const SURFACE     = WHITE;

// ─── Avatar con iniciales ─────────────────────────────────────────────────────
function Avatar({ name, size = 80 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: GREEN_PALE,
        borderWidth: 3,
        borderColor: GREEN,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ fontSize: size * 0.35, fontWeight: '700', color: GREEN_DARK }}>
        {initials || '🌿'}
      </Text>
    </View>
  );
}

// ─── Barra de XP estilo Duolingo ──────────────────────────────────────────────
function XpBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min((current / max) * 100, 100);

  return (
    <View style={xpStyles.wrapper}>
      <View style={xpStyles.container}>
        <View style={xpStyles.track}>
          <View style={[xpStyles.fill, { width: `${pct}%` }]} />
        </View>
        <View style={xpStyles.starBox}>
          <Text style={xpStyles.goalIcon}>⭐</Text>
        </View>
      </View>
      <Text style={xpStyles.label}>
        {current} / {max} XP
      </Text>
    </View>
  );
}

const xpStyles = StyleSheet.create({
  wrapper: { 
    width: '100%', 
    marginTop: 4 
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#A5D6A7',
  },
  starBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalIcon: { 
    fontSize: 18 
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'left',
  },
});

// ─── Tarjeta de impacto (Duolingo streak card) ────────────────────────────────
interface ImpactCardProps {
  icon: string;
  value: string;
  label: string;
  bg: string;
  fg: string;
}

function ImpactCard({ icon, value, label, bg, fg }: ImpactCardProps) {
  return (
    <View style={[cardStyles.card, { backgroundColor: bg, borderColor: fg + '30' }]}>
      <Text style={cardStyles.icon}>{icon}</Text>
      <Text style={[cardStyles.value, { color: fg }]}>{value}</Text>
      <Text style={[cardStyles.label, { color: fg + 'BB' }]}>{label}</Text>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: (SCREEN_W - 64) / 2,
    maxWidth: (SCREEN_W - 64) / 2,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  icon: { fontSize: 28, marginBottom: 4 },
  value: { fontSize: 22, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
});

// ─── Badge de nivel (escudo) ──────────────────────────────────────────────────
function LevelBadge({ level }: { level: number }) {
  return (
    <View style={badgeStyles.wrap}>
      <Svg width="48" height="54" viewBox="0 0 48 54">
        <Path
          d="M24 2L4 10v16c0 13.25 8.5 24.1 20 27 11.5-2.9 20-13.75 20-27V10L24 2z"
          fill={GREEN_DARK}
        />
        <Path
          d="M24 6L7 13v13c0 11 7 20 17 22.5 10-2.5 17-11.5 17-22.5V13L24 6z"
          fill={GREEN}
        />
      </Svg>
      <View style={badgeStyles.overlay}>
        <Text style={badgeStyles.number}>{level}</Text>
      </View>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  wrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  overlay: {
    position: 'absolute',
    top: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { fontSize: 18, fontWeight: '800', color: WHITE },
});

// ─── Separador de sección ─────────────────────────────────────────────────────
function SectionTitle({ children }: { children: string }) {
  return <Text style={sectionStyles.title}>{children}</Text>;
}
const sectionStyles = StyleSheet.create({
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: GRAY_LABEL,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 2,
  },
});

// ─── Fila de logro ────────────────────────────────────────────────────────────
function AchievementRow({
  icon,
  title,
  desc,
  done,
}: {
  icon: string;
  title: string;
  desc: string;
  done: boolean;
}) {
  return (
    <View style={achievStyles.row}>
      <View style={[achievStyles.iconBox, done && achievStyles.iconBoxDone]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[achievStyles.title, !done && { color: GRAY_LABEL }]}>{title}</Text>
        <Text style={achievStyles.desc}>{desc}</Text>
      </View>
      {done && (
        <View style={achievStyles.checkBadge}>
          <Text style={{ color: WHITE, fontSize: 12, fontWeight: '700' }}>✓</Text>
        </View>
      )}
    </View>
  );
}

const achievStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GRAY_BORDER,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: GRAY_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxDone: { backgroundColor: GREEN_PALE },
  title: { fontSize: 15, fontWeight: '500', color: TEXT_TITLE },
  desc: { fontSize: 12, color: GRAY_LABEL, marginTop: 1 },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const stats = {
    level:      user?.nivelActual    ?? 0,
    xp:         user?.puntosActuales ?? 0,
    nextLevelXp: 1000,
    co2:        user?.co2Ahorrado    ?? 0,
    water:      user?.aguaAhorrada   ?? 0,
    trees:      user?.arbolesSalvados ?? 0,
    recycled:   user?.kgRecycled     ?? 0,
  };

  const handleLogout = () => {
    Alert.alert(t('logoutConfirm'), '', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('confirm'), onPress: logout, style: 'destructive' },
    ]);
  };

  // Formatear nombre: Nombre + Iniciales de apellidos
  const formatName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) return fullName;
    
    const firstName = parts[0];
    const initials = parts.slice(1)
      .map(p => p[0].toUpperCase() + '.')
      .join(' ');
      
    return `${firstName} ${initials}`;
  };

  const rawName = user?.nombre || 'Eco Usuario';
  const displayName = formatName(rawName);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* ── Header verde estilo Duolingo ── */}
      <View style={styles.header}>
        {/* Botones superiores */}
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
              <Path
                d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                fill="rgba(255,255,255,0.8)"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Avatar + nombre */}
        <View style={styles.avatarSection}>
          <Avatar name={rawName} size={80} />
          <View style={{ alignItems: 'center', marginTop: 10, gap: 2 }}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userSub}>{user?.email ?? ''}</Text>
          </View>
        </View>

        {/* Nivel + XP */}
        <View style={styles.levelRow}>
          <LevelBadge level={stats.level} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.levelLabel}>{t('level')} {stats.level}</Text>
            <XpBar current={stats.xp} max={stats.nextLevelXp} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* ── Impacto ambiental ── */}
        <SectionTitle>{t('dashboardTitle')}</SectionTitle>
        <View style={styles.grid}>
          <ImpactCard icon="🌳" value={String(stats.trees)} label={t('treesSaved')}   bg={GREEN_PALE} fg={GREEN_DARK} />
          <ImpactCard icon="💧" value={`${stats.water}L`}   label={t('waterSaved')}  bg={BLUE_PALE}  fg={BLUE}      />
          <ImpactCard icon="♻️" value={`${stats.recycled}kg`} label={t('kgRecycled')} bg={TEAL_PALE}  fg={TEAL}      />
          <ImpactCard icon="🌫️" value={`${stats.co2}kg`}   label={t('co2Saved')}     bg={AMBER_PALE} fg={AMBER}     />
        </View>

        <View style={{ height: 24 }} />

        {/* ── Logros ── */}
        <SectionTitle>{t('achievements') || 'Logros'}</SectionTitle>
        <View style={styles.achievCard}>
          <AchievementRow
            icon="🌱"
            title={t('achievement_1_title') || 'Primer reciclaje'}
            desc={t('achievement_1_desc') || 'Registraste tu primer material'}
            done={stats.recycled > 0}
          />
          <AchievementRow
            icon="💦"
            title={t('achievement_2_title') || 'Guardián del agua'}
            desc={t('achievement_2_desc') || 'Ahorraste más de 100L de agua'}
            done={stats.water >= 100}
          />
          <AchievementRow
            icon="🏆"
            title={t('achievement_3_title') || 'Nivel 5'}
            desc={t('achievement_3_desc') || 'Alcanzaste el nivel 5'}
            done={stats.level >= 5}
          />
          <AchievementRow
            icon="🌲"
            title={t('achievement_4_title') || 'Sembrador'}
            desc={t('achievement_4_desc') || 'Contribuiste a salvar 10 árboles'}
            done={stats.trees >= 10}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Estilos globales ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GRAY_BG,
  },

  // Header verde
  header: {
    backgroundColor: GREEN,
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 24,
    gap: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  iconBtn: {
    padding: 4,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginTop: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: WHITE,
    letterSpacing: -0.3,
  },
  userSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },

  // Nivel
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 16,
    padding: 14,
  },
  levelLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },

  // Scroll content
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },

  // Grid de impacto 2×2
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  // Card de logros
  achievCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
});