import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GREEN, WHITE } from '@/constants/auth-styles';
import { useTranslation } from 'react-i18next';

interface OfflineViewProps {
  onRetry?: () => void;
  message?: string;
}

export const OfflineView: React.FC<OfflineViewProps> = ({ onRetry, message }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={80} color={GREEN} />
      <Text style={styles.title}>{t('no_internet_title' as any) || 'Sin conexión'}</Text>
      <Text style={styles.message}>
        {message || t('no_internet_message' as any) || 'Necesitas estar conectado a internet para ver este contenido.'}
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>{t('retry' as any) || 'Reintentar'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: WHITE,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: GREEN,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});
