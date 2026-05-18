import { Redirect } from 'expo-router';

export default function Index() {
  // Por ahora, redirigimos siempre a login si no hay lógica de sesión
  return <Redirect href="/(auth)/login" />;
}
