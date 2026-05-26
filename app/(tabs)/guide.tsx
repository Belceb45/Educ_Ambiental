import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GRAY_BG, TEXT_TITLE } from '@/constants/auth-styles';

export default function GuideScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Guía de Reciclaje (Próximamente)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: TEXT_TITLE,
    fontWeight: '600',
  },
});