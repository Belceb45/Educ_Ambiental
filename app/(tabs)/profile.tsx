import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useAuth } from '@/context/AuthContext';
import { dashboardStyles as styles } from '@/constants/dashboard-styles';
import { GREEN, WHITE, GRAY_LABEL, TEXT_TITLE } from '@/constants/auth-styles';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  // Datos REALES del usuario (o 0 si no existen)
  const stats = {
    level: user?.nivelActual || 0,
    xp: user?.puntosActuales || 0,
    nextLevelXp: 1000, // Esto debería calcularse según el nivel
    co2: user?.co2Ahorrado || 0,
    water: user?.aguaAhorrada || 0,
    trees: user?.arbolesSalvados || 0,
    recycled: user?.kgRecycled || 0,
  };

  const handleLogout = () => {
    Alert.alert(
      t('logoutConfirm'),
      '',
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('confirm'), onPress: logout, style: 'destructive' },
      ]
    );
  };

  const xpProgress = (stats.xp / stats.nextLevelXp) * 100;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{t('profile')}</Text>
            <Text style={styles.userName}>{user?.nombre || 'Eco Usuario'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.profileButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill={WHITE} />
            </Svg>
          </TouchableOpacity>
        </View>

        <View style={styles.levelCard}>
          <View style={styles.levelInfo}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{t('level')} {stats.level}</Text>
            </View>
            <Text style={styles.xpPointsText}>{stats.xp} / {stats.nextLevelXp} XP</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${xpProgress}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>{t('dashboardTitle')}</Text>
        
        <View style={styles.impactRow}>
          <View style={styles.impactItem}>
            <View style={styles.impactCircle}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M12 2L1 21h22L12 2zm0 3.45L20.4 19H3.6L12 5.45z" fill={GREEN} />
              </Svg>
            </View>
            <Text style={styles.impactValue}>{stats.trees}</Text>
            <Text style={styles.impactLabel}>{t('treesSaved')}</Text>
          </View>

          <View style={styles.impactItem}>
            <View style={styles.impactCircle}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" fill={GREEN} />
              </Svg>
            </View>
            <Text style={stats.impactValue as any}>{stats.water}L</Text>
            <Text style={styles.impactLabel}>{t('waterSaved')}</Text>
          </View>

          <View style={styles.impactItem}>
            <View style={styles.impactCircle}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" fill={GREEN} />
              </Svg>
            </View>
            <Text style={styles.impactValue}>{stats.recycled}kg</Text>
            <Text style={styles.impactLabel}>{t('kgRecycled')}</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
