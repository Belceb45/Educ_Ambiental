import { useRouter } from 'expo-router';
import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useAuth } from '@/context/AuthContext';
import { homeStyles as styles } from '@/constants/home-styles';
import { WHITE, TEXT_TITLE } from '@/constants/auth-styles';

export default function DashboardHeader() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.topHeader}>
      <Text style={styles.brandText}>EducAmbiental</Text>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill={TEXT_TITLE} />
          </Svg>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => router.push('/settings')}
        >
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41l-0.36,2.54c-0.59,0.24-1.13,0.57-1.62,0.94L5.24,5.33c-0.22-0.07-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.81,11.69,4.81,12c0,0.31,0.02,0.65,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.07,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" fill={TEXT_TITLE} />
          </Svg>
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarSmall} onPress={() => router.push('/profile')}>
          <Text style={{ color: WHITE, fontWeight: 'bold', fontSize: 14 }}>
            {user?.nombre?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
