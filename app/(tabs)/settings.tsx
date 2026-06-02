import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Share, Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GREEN, WHITE, TEXT_TITLE, GRAY_LABEL, GRAY_BG, GRAY_BORDER } from '@/constants/auth-styles';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  const handleInviteFriends = async () => {
    try {
      await Share.share({
        message: t('inviteMessage') || '¡Únete a EducAmbiental y ayúdanos a salvar el planeta! Descarga la app aquí: https://educambiental.com',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const SettingItem = ({ icon, label, value, onPress, type = 'chevron' }: any) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: icon === 'exit-outline' ? '#FFEBEE' : GRAY_BG }]}>
          <Ionicons name={icon} size={22} color={icon === 'exit-outline' ? '#F44336' : GREEN} />
        </View>
        <Text style={[styles.label, icon === 'exit-outline' && { color: '#F44336' }]}>{label}</Text>
      </View>
      
      <View style={styles.itemRight}>
        {value && <Text style={styles.value}>{value}</Text>}
        {type === 'chevron' && <Ionicons name="chevron-forward" size={20} color={GRAY_LABEL} />}
        {type === 'switch' && (
          <Switch 
            value={isDarkMode} 
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#D1D1D1', true: GREEN + '80' }}
            thumbColor={isDarkMode ? GREEN : '#F4F3F4'}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const handleDeleteAccount = () => {
    Alert.alert(
      t('deleteAccountTitle') || 'Eliminar Cuenta',
      t('deleteAccountConfirm1') || '¿Estás completamente seguro? Esta acción no se puede deshacer.',
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('delete'), 
          style: 'destructive',
          onPress: () => {
            // Segunda confirmación
            Alert.alert(
              t('finalWarning') || 'Confirmación Final',
              t('deleteAccountConfirm2') || 'Se perderán todos tus Eco-Puntos e insignias de forma permanente. ¿Confirmar eliminación?',
              [
                { text: t('cancel'), style: 'cancel' },
                { 
                  text: t('deletePermanently') || 'Eliminar Permanentemente', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await userService.deleteMyAccount();
                      Alert.alert(t('success'), t('accountDeleted') || 'Cuenta eliminada correctamente.');
                      router.replace('/login');
                    } catch (error) {
                      Alert.alert('Error', t('deleteError') || 'No se pudo eliminar la cuenta. Inténtalo más tarde.');
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings') || 'Configuración'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('preferences') || 'Preferencias'}</Text>
        <View style={styles.card}>
          <SettingItem 
            icon="language-outline" 
            label={t('changeLanguage') || 'Cambiar Idioma'} 
            value={i18n.language === 'es' ? 'Español' : 'English'}
            onPress={toggleLanguage}
          />
          <View style={styles.separator} />
          <SettingItem 
            icon="moon-outline" 
            label={t('darkMode') || 'Modo Oscuro'} 
            type="switch"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('support') || 'Ayuda y Soporte'}</Text>
        <View style={styles.card}>
          <SettingItem 
            icon="help-circle-outline" 
            label={t('helpCenter') || 'Centro de Ayuda'} 
            onPress={() => router.push('/faq')}
          />
          <View style={styles.separator} />
          <SettingItem 
            icon="mail-outline" 
            label={t('contactUs') || 'Contáctanos'} 
            onPress={() => router.push('/contact')}
          />
          <View style={styles.separator} />
          <SettingItem 
            icon="person-add-outline" 
            label={t('inviteFriends') || 'Invitar Amigos'} 
            onPress={handleInviteFriends}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('appInfo') || 'Información de la App'}</Text>
        <View style={styles.card}>
          <SettingItem 
            icon="document-text-outline" 
            label={t('termsAndConditions') || 'Términos y Condiciones'} 
            onPress={() => router.push('/terms')}
          />
          <View style={styles.separator} />
          <SettingItem 
            icon="shield-checkmark-outline" 
            label={t('privacyPolicy')} 
            onPress={() => Alert.alert(t('privacyTitle'), t('privacyContent'))}
          />
          <View style={styles.separator} />
          <SettingItem 
            icon="information-circle-outline" 
            label={t('version') || 'Versión'} 
            value="1.0.0"
            type="none"
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { borderColor: '#FFEBEE', marginTop: 20 }]}
        onPress={handleDeleteAccount}
      >
        <Ionicons name="trash-outline" size={22} color="#F44336" style={{ marginRight: 10 }} />
        <Text style={styles.logoutText}>{t('deleteAccountTitle') || 'Eliminar Cuenta'}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => Alert.alert(t('logoutConfirm'), '', [
          { text: t('cancel'), style: 'cancel' },
          { text: t('confirm'), onPress: () => router.replace('/login'), style: 'destructive' }
        ])}
      >
        <Ionicons name="exit-outline" size={22} color="#F44336" style={{ marginRight: 10 }} />
        <Text style={styles.logoutText}>{t('logout') || 'Cerrar Sesión'}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY_BG,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: WHITE,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT_TITLE,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GRAY_LABEL,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GRAY_BORDER,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_TITLE,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 14,
    color: GRAY_LABEL,
    marginRight: 8,
  },
  separator: {
    height: 1,
    backgroundColor: GRAY_BORDER,
    marginLeft: 70,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    marginTop: 32,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFEBEE',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F44336',
  },
});
