import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      about: 'Acerca de',
      contact: 'Contáctanos',
      share: 'Compartir',
      language: 'Idioma / Language',
      spanish: 'Español',
      english: 'English',
      loginTitle: 'Iniciar Sesión',
      registerTitle: 'Crear Cuenta',
      phonePlaceholder: 'Número de Teléfono',
      passwordPlaceholder: 'Contraseña',
      namePlaceholder: 'Nombre Completo',
      emailPlaceholder: 'Correo Electrónico',
      rememberMe: 'Recordarme',
      forgotPassword: '¿Olvidaste tu contraseña?',
      loginButton: 'Iniciar Sesión',
      registerButton: 'Registrarse',
      noAccount: '¿No tienes una cuenta?',
      alreadyHaveAccount: '¿Ya tienes una cuenta?',
      createAccountLink: 'Crear Cuenta',
      loginLink: 'Inicia Sesión',
      passwordRequired: 'La contraseña es requerida.',
      acceptTermsRequired: 'Debe aceptar los términos para continuar.',
      termsAndConditions: 'Términos y Condiciones',
      acceptTerms: 'Acepto los',
      termsTitle: 'Términos y Condiciones',
      termsContent: 'Al descargar, acceder o utilizar la aplicación móvil y los servicios web de EducAmbiental (en adelante, "la App"), usted acepta estar sujeto a los presentes Términos y Condiciones. Si no está de acuerdo con estos términos, le rogamos que no utilice nuestros servicios.\n\n1. Propiedad Intelectual y Uso Personal\nTodos los materiales contenidos en la App (incluyendo, de manera enunciativa mas no limitativa, el diseño de interfaz, logotipos, textos, gráficos, iconografía de insignias, fotografías y contenido educativo) están protegidos por las leyes de derechos de autor y propiedad industrial aplicables. Estos materiales deben ser utilizados única y exclusivamente para fines personales, educativos y no comerciales. Usted puede visualizar el contenido de la App para su uso personal, pero debe conservar todos los avisos de derechos de autor y otros avisos de propiedad adjuntos al material.\n\n2. Restricciones de Copia y Distribución\nQueda ESTRICTAMENTE PROHIBIDA la reproducción, duplicación, descarga, distribución (incluyendo el envío por correo electrónico u otros medios electrónicos), publicación, modificación, copia o transmisión del material de la App, a menos que haya obtenido el consentimiento previo y por escrito del equipo de EducAmbiental. El uso de los materiales de la App en cualquier otro sitio web, aplicación móvil o entorno informático en red está igualmente prohibido.\n\n3. Prohibición de Ingeniería Inversa y Obras Derivadas\nQueda estrictamente prohibida la creación de obras o materiales que deriven o se basen en los materiales y la arquitectura contenidos en la App (incluyendo fuentes, botones, pantallas y mercancía no autorizada). Esta prohibición se aplica independientemente de si los materiales derivados se venden, intercambian o regalan. Asimismo, queda estrictamente prohibido copiar, descompilar, realizar ingeniería inversa o extraer el código fuente de cualquier programa, script, base de datos o API REST (incluyendo los servicios de backend y la aplicación móvil) que conformen la infraestructura de EducAmbiental.\n\n4. Sistema de Gamificación, Puntos y Recompensas\nLa App incluye un sistema de gamificación que otorga "Eco-Puntos", experiencia (XP), niveles e insignias virtuales a los usuarios por realizar acciones de reciclaje (como el escaneo de códigos QR en centros de acopio y la validación de kilogramos entregados). Usted acepta y reconoce expresamente que dichos puntos, niveles e insignias no tienen valor en efectivo, no son dinero real, no son transferibles y no pueden ser canjeados por dinero en curso legal. EducAmbiental se reserva el derecho absoluto de modificar, suspender o eliminar el sistema de puntos, así como de ajustar las equivalencias de recompensas en cualquier momento y sin previo aviso, sin que esto genere derecho a compensación alguna.\n\n5. Modificaciones y Gratuidad del Servicio\nEl acceso a las herramientas de seguimiento, mapas y catálogo de EducAmbiental es un servicio gratuito. No obstante, nos reservamos el derecho de implementar cargos por servicios premium en el futuro. En tal caso, se le notificará con anticipación para que decida si desea suscribirse. Nos reservamos el derecho de modificar los términos de este Acuerdo o de alterar cualquier característica del servicio en cualquier momento. Al continuar utilizando la App después de la publicación de dichos cambios, usted acepta estar sujeto a los mismos.\n\n6. Límite de Responsabilidad e Indemnización\nUsted acepta indemnizar y eximir de responsabilidad a EducAmbiental, sus desarrolladores, administradores, empleados, colaboradores y afiliados, de y contra todas las pérdidas, gastos, daños y costos derivados de cualquier violación de este Acuerdo o del incumplimiento de cualquier obligación relacionada con su cuenta. Los artículos, tips de reciclaje y guías de separación reflejan información general y educativa; no pretenden ser, ni deben interpretarse, como asesoría técnica, legal o sanitaria oficial. Para un manejo de residuos peligrosos o especializados, busque la asistencia de un profesional calificado.\n\n7. Jurisdicción y Legislación Aplicable\nPara la interpretación, cumplimiento y ejecución de los presentes Términos y Condiciones, las partes se someten expresamente a las leyes aplicables y a la jurisdicción de los tribunales competentes en la Ciudad de México, renunciando a cualquier otro fuero que pudiera corresponderles en razón de sus domicilios presentes o futuros.',
    },
  },
  en: {
    translation: {
      about: 'About',
      contact: 'Contact Us',
      share: 'Share',
      language: 'Idioma / Language',
      spanish: 'Español',
      english: 'English',
      loginTitle: 'Log In',
      registerTitle: 'Create Account',
      phonePlaceholder: 'Phone Number',
      passwordPlaceholder: 'Password',
      namePlaceholder: 'Full Name',
      emailPlaceholder: 'Email Address',
      rememberMe: 'Remember Me',
      forgotPassword: 'Forgot password?',
      loginButton: 'Log In',
      registerButton: 'Sign Up',
      noAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      createAccountLink: 'Create Account',
      loginLink: 'Log In',
      passwordRequired: 'Password is required.',
      acceptTermsRequired: 'You must accept the terms to continue.',
      termsAndConditions: 'Terms and Conditions',
      acceptTerms: 'I agree to the',
      termsTitle: 'Terms and Conditions',
      termsContent: 'By downloading, accessing, or using the EducAmbiental mobile application and web services (hereinafter, "the App"), you agree to be bound by these Terms and Conditions. If you do not agree with these terms, please do not use our services.\n\n1. Intellectual Property and Personal Use\nAll materials contained in the App (including, but not limited to, interface design, logos, texts, graphics, badge iconography, photographs, and educational content) are protected by applicable copyright and industrial property laws. These materials must be used solely and exclusively for personal, educational, and non-commercial purposes. You may view the App content for your personal use, but you must retain all copyright and other proprietary notices attached to the material.\n\n2. Copying and Distribution Restrictions\nReproduction, duplication, downloading, distribution (including sending by email or other electronic means), publication, modification, copying, or transmission of App material is STRICTLY PROHIBITED, unless you have obtained prior written consent from the EducAmbiental team. The use of App materials on any other website, mobile application, or networked computer environment is also prohibited.\n\n3. Prohibition of Reverse Engineering and Derivative Works\nThe creation of works or materials derived from or based on the materials and architecture contained in the App (including fonts, buttons, screens, and unauthorized merchandise) is strictly prohibited. This prohibition applies regardless of whether the derivative materials are sold, exchanged, or given away. Likewise, it is strictly prohibited to copy, decompile, reverse engineer, or extract the source code of any program, script, database, or REST API (including backend services and the mobile application) that make up the EducAmbiental infrastructure.\n\n4. Gamification System, Points, and Rewards\nThe App includes a gamification system that awards "Eco-Points," experience (XP), levels, and virtual badges to users for performing recycling actions (such as scanning QR codes at collection centers and validating delivered kilograms). You expressly agree and acknowledge that these points, levels, and badges have no cash value, are not real money, are not transferable, and cannot be exchanged for legal tender. EducAmbiental reserves the absolute right to modify, suspend, or eliminate the points system, as well as adjust reward equivalencies at any time and without prior notice, without this generating any right to compensation.\n\n5. Modifications and Free Service\nAccess to EducAmbiental tracking tools, maps, and catalog is a free service. However, we reserve the right to implement charges for premium services in the future. In such case, you will be notified in advance so you can decide whether you wish to subscribe. We reserve the right to modify the terms of this Agreement or to alter any feature of the service at any time. By continuing to use the App after the publication of such changes, you agree to be bound by them.\n\n6. Limitation of Liability and Indemnification\nYou agree to indemnify and hold harmless EducAmbiental, its developers, administrators, employees, collaborators, and affiliates from and against all losses, expenses, damages, and costs resulting from any violation of this Agreement or the failure to fulfill any obligation related to your account. Articles, recycling tips, and separation guides reflect general and educational information; they are not intended to be, nor should they be construed as, official technical, legal, or health advice. For hazardous or specialized waste management, seek assistance from a qualified professional.\n\n7. Jurisdiction and Applicable Law\nFor the interpretation, compliance, and execution of these Terms and Conditions, the parties expressly submit to the applicable laws and the jurisdiction of the competent courts in Mexico City, waiving any other jurisdiction that might correspond to them by reason of their present or future domiciles.',
    },
  },
};

const language = Localization.getLocales()[0]?.languageTag?.split('-')[0] || 'es';
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: language,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
