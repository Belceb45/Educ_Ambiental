import { StyleSheet, Dimensions, Platform } from 'react-native';
import { GREEN, WHITE, GRAY_BG, GRAY_BORDER, GRAY_LABEL, TEXT_TITLE, GREEN_LIGHT } from './auth-styles';

const { width } = Dimensions.get('window');

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE, // Cambiado a blanco para un look más limpio
  },
  header: {
    backgroundColor: GREEN,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: WHITE,
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  levelCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: WHITE,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '700',
  },
  xpPointsText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: WHITE,
    borderRadius: 4,
  },
  
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_TITLE,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 14,
    color: GREEN,
    fontWeight: '600',
  },
  
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  impactItem: {
    alignItems: 'center',
    width: (width - 48 - 40) / 3, // 3 items con spacing
  },
  impactCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GRAY_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_TITLE,
  },
  impactLabel: {
    fontSize: 11,
    color: GRAY_LABEL,
    textAlign: 'center',
  },
  
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  menuItem: {
    width: (width - 48 - 16) / 2,
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_TITLE,
    marginBottom: 4,
  },
  menuDesc: {
    fontSize: 12,
    color: GRAY_LABEL,
    lineHeight: 16,
  },
  
  tipCard: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tipContentBox: {
    flex: 1,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: TEXT_TITLE,
    lineHeight: 20,
  },
});