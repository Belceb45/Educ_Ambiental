import { GRAY_BG, GRAY_BORDER, GRAY_LABEL, GREEN, TEXT_TITLE, WHITE } from '@/constants/auth-styles';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  runOnJS
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

export default function AuthMenu() {
  const [modalVisible, setModalVisible] = useState(false);
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'es';

  // Animación con Reanimated
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  const handleLanguageChange = (newLang: string) => {
    i18n.changeLanguage(newLang);
  };

  const openMenu = () => {
    setModalVisible(true);
    // Pequeño delay para asegurar que el Modal esté montado antes de animar
    // Aunque con useSharedValue y withTiming suele funcionar directo
    translateX.value = withTiming(0, {
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    backdropOpacity.value = withTiming(1, { duration: 300 });
  };

  const closeMenu = () => {
    backdropOpacity.value = withTiming(0, { duration: 200 });
    translateX.value = withTiming(-DRAWER_WIDTH, {
      duration: 300,
      easing: Easing.inOut(Easing.quad),
    }, (finished) => {
      if (finished) {
        runOnJS(setModalVisible)(false);
      }
    });
  };

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <>
      <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
        <Svg width="28" height="28" viewBox="0 0 24 24">
          <Path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill={GREEN} />
        </Svg>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        onRequestClose={closeMenu}
        statusBarTranslucent>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu}>
            <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
          </Pressable>

          <Animated.View style={[styles.menuContainer, animatedDrawerStyle]}>
            {/* Header */}
            <View style={styles.menuHeader}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill={GRAY_LABEL}
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Items */}
            <View style={styles.menuItems}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { console.log('About'); closeMenu(); }}>
                <Svg width="22" height="22" viewBox="0 0 24 24" style={styles.icon}>
                  <Path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                    fill={GREEN}
                  />
                </Svg>
                <Text style={styles.menuItemText}>{t('about')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { console.log('Contact Us'); closeMenu(); }}>
                <Svg width="22" height="22" viewBox="0 0 24 24" style={styles.icon}>
                  <Path
                    d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                    fill={GREEN}
                  />
                </Svg>
                <Text style={styles.menuItemText}>{t('contact')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { console.log('Share'); closeMenu(); }}>
                <Svg width="22" height="22" viewBox="0 0 24 24" style={styles.icon}>
                  <Path
                    d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
                    fill={GREEN}
                  />
                </Svg>
                <Text style={styles.menuItemText}>{t('share')}</Text>
              </TouchableOpacity>
            </View>

            {/* Footer: selector de idioma */}
            <View style={styles.menuFooter}>
              <Text style={styles.footerLabel}>{t('language')}</Text>
              <View style={styles.langToggle}>
                <TouchableOpacity
                  style={[styles.langBtn, lang.startsWith('es') && styles.langBtnActive]}
                  onPress={() => handleLanguageChange('es')}>
                  <Text style={[styles.langText, lang.startsWith('es') && styles.langTextActive]}>
                    {t('spanish')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.langBtn, lang.startsWith('en') && styles.langBtnActive]}
                  onPress={() => handleLanguageChange('en')}>
                  <Text style={[styles.langText, lang.startsWith('en') && styles.langTextActive]}>
                    {t('english')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  menuContainer: {
    width: DRAWER_WIDTH,
    maxWidth: 320,
    backgroundColor: WHITE,
    height: '100%',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  closeButton: {
    padding: 5,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GRAY_BG,
  },
  icon: {
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 17,
    color: TEXT_TITLE,
    fontWeight: '400',
  },
  menuFooter: {
    marginTop: 'auto',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: GRAY_BORDER,
    paddingTop: 24,
  },
  footerLabel: {
    fontSize: 13,
    color: GRAY_LABEL,
    marginBottom: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: GRAY_BG,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  langBtnActive: {
    backgroundColor: WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  langText: {
    fontSize: 15,
    color: GRAY_LABEL,
    fontWeight: '500',
  },
  langTextActive: {
    color: GREEN,
    fontWeight: '700',
  },
});