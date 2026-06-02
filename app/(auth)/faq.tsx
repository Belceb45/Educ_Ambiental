import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GREEN, WHITE, TEXT_TITLE, GRAY_LABEL, GRAY_BG, GRAY_BORDER } from '@/constants/auth-styles';

export default function HelpCenterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: t('faq_q1') || '¿Qué es EducAmbiental?',
      answer: t('faq_a1') || 'Es una plataforma educativa diseñada para ayudarte a identificar materiales reciclables y encontrar los centros de acopio más cercanos a tu ubicación.'
    },
    {
      id: 2,
      question: t('faq_q2') || '¿Cómo encuentro centros de reciclaje?',
      answer: t('faq_a2') || 'Dirígete a la pestaña "Mapa". Ahí verás centros oficiales marcados en verde y otros puntos de reciclaje externos. Puedes filtrar por tipo de material.'
    },
    {
      id: 3,
      question: t('faq_q3') || '¿Qué materiales puedo reciclar?',
      answer: t('faq_a3') || 'Aceptamos plásticos (PET, HDPE), cartón, papel, vidrio y residuos electrónicos. Consulta la sección "Guía" para aprender a preparar cada material.'
    },
    {
      id: 4,
      question: t('faq_q4') || '¿Cómo contacto a un centro?',
      answer: t('faq_a4') || 'En la sección "Mapa", selecciona el centro de tu interés para ver su dirección y obtener una ruta directa usando el botón "Cómo llegar".'
    },
    {
      id: 5,
      question: t('faq_q5') || 'Olvidé mi contraseña, ¿qué hago?',
      answer: t('faq_a5') || 'En la pantalla de inicio de sesión, selecciona "¿Olvidaste tu contraseña?". Te enviaremos un código de verificación a tu correo para restablecerla.'
    }
  ];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={TEXT_TITLE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('helpCenter')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.introText}>
          {t('faq_intro') || 'Encuentra respuestas rápidas a las dudas más comunes sobre EducAmbiental.'}
        </Text>

        {faqs.map((faq) => (
          <TouchableOpacity 
            key={faq.id} 
            style={[styles.faqCard, expandedId === faq.id && styles.faqCardExpanded]} 
            onPress={() => toggleExpand(faq.id)}
            activeOpacity={0.7}
          >
            <View style={styles.questionRow}>
              <Text style={styles.questionText}>{faq.question}</Text>
              <Ionicons 
                name={expandedId === faq.id ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={GREEN} 
              />
            </View>
            {expandedId === faq.id && (
              <View style={styles.answerBox}>
                <Text style={styles.answerText}>{faq.answer}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>{t('stillHaveQuestions') || '¿Aún tienes dudas?'}</Text>
          <TouchableOpacity style={styles.contactButton} onPress={() => router.push('/contact')}>
            <Ionicons name="mail-outline" size={20} color={WHITE} style={{ marginRight: 8 }} />
            <Text style={styles.contactButtonText}>{t('contactSupport') || 'Contactar Soporte'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: WHITE,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT_TITLE,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  introText: {
    fontSize: 16,
    color: GRAY_LABEL,
    marginTop: 20,
    marginBottom: 24,
    lineHeight: 22,
  },
  faqCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  faqCardExpanded: {
    borderColor: GREEN,
    borderWidth: 1.5,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_TITLE,
    flex: 1,
    paddingRight: 10,
  },
  answerBox: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  answerText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  contactSection: {
    marginTop: 30,
    alignItems: 'center',
    padding: 24,
    backgroundColor: WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_TITLE,
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  contactButtonText: {
    color: WHITE,
    fontWeight: '700',
    fontSize: 15,
  },
});
