import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors, useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { useTranslation } from 'react-i18next';

interface OfflineViewProps {
  onRetry?: () => void;
  message?: string;
}

export const OfflineView: React.FC<OfflineViewProps> = ({ onRetry, message }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={80} color={colors.green} />
      <Text style={styles.title}>{t('no_internet_title')}</Text>
      <Text style={styles.message}>
        {message || t('no_internet_message')}
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>{t('retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: c.white,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: c.textTitle,
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: c.grayLabel,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: c.green,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
