import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { GREEN, GRAY_LABEL, WHITE } from '@/constants/auth-styles';
import DashboardHeader from '@/components/DashboardHeader';

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: GREEN,
        tabBarInactiveTintColor: GRAY_LABEL,
        headerShown: true,
        header: () => <DashboardHeader />,
        tabBarStyle: {
          backgroundColor: WHITE,
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav_home'),
          tabBarIcon: ({ color }) => (
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill={color} />
            </Svg>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t('nav_map'),
          tabBarIcon: ({ color }) => (
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={color} />
            </Svg>
          ),
        }}
      />
      <Tabs.Screen
        name="guide/index"
        options={{
          title: t('nav_guide'),
          tabBarIcon: ({ color }) => (
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" fill={color} />
            </Svg>
          ),
        }}
      />
      <Tabs.Screen
        name="guide/[id]"
        options={{
          href: null, // Ocultar de la barra de pestañas
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('nav_scan'),
          headerShown: false,
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color }) => (
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill={color} />
              <Path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill={color} />
            </Svg>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="learn/index"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
