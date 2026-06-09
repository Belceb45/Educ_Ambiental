import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView, Platform, Linking } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { centersService } from '@/services/api';
import { GREEN, WHITE, TEXT_TITLE, GRAY_LABEL, GRAY_BG } from '@/constants/auth-styles';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { OfflineView } from '@/components/OfflineView';

import * as SecureStore from 'expo-secure-store';

// v2: invalida caché anterior que guardaba descripcion vacía
const CACHE_KEY = 'cached_centers_v2';

type Category = 'todos' | 'centro' | 'medicamentos' | 'electronicos' | 'plastico';

interface Point {
  id: string | number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  tipo: Category;
  descripcion?: string;
  contacto?: string;
  imagenUrl?: string;
  horario?: string;
}

const CATEGORIES: { id: Category; label: string; icon: string; color: string }[] = [
  { id: 'todos', label: 'Todos', icon: 'apps', color: '#666' },
  { id: 'centro', label: 'Centros', icon: 'business', color: GREEN },
  { id: 'medicamentos', label: 'Medicinas', icon: 'medical', color: '#E91E63' },
  { id: 'electronicos', label: 'E-Waste', icon: 'battery-dead', color: '#FF9800' },
  { id: 'plastico', label: 'Plásticos', icon: 'water', color: '#2196F3' },
];

// Componente de Marcador optimizado para evitar re-renders innecesarios
const OptimizedMarker = memo(function OptimizedMarker({ point, color, onNav }: { point: Point; color: string; onNav: (p: Point) => void }) {
  return (
    <Marker
      coordinate={{ latitude: point.latitud, longitude: point.longitud }}
      pinColor={color}
      tracksViewChanges={false}
    >
      <Callout 
        tooltip 
        onPress={() => onNav(point)}
      >
        <View style={styles.calloutContainer}>
          <View style={styles.calloutContent}>
            {point.imagenUrl && (
              <View style={styles.calloutImageContainer}>
                <Text style={{ position: 'absolute', top: '40%', alignSelf: 'center', color: GRAY_LABEL, fontSize: 10 }}>Cargando imagen...</Text>
                {/* Nota: Callout de react-native-maps tiene limitaciones con imágenes remotas en Android, 
                    pero para iOS y navegadores funciona bien. Se recomienda usar una vista previa local si es posible. */}
                <View style={[styles.calloutImage, { backgroundColor: GRAY_BG }]} />
              </View>
            )}
            
            <Text style={styles.calloutTitle}>{point.nombre}</Text>
            
            <View style={[styles.badge, { backgroundColor: color + '20', marginBottom: 10 }]}>
              <Text style={[styles.badgeText, { color: color }]}>
                {CATEGORIES.find(c => c.id === point.tipo)?.label || 'Centro'}
              </Text>
            </View>

            <View style={styles.addressContainer}>
              <Ionicons name="location" size={14} color={GRAY_LABEL} style={{ marginRight: 4 }} />
              <Text style={styles.calloutAddressText} numberOfLines={2}>
                {point.direccion}
              </Text>
            </View>

            {point.horario && (
              <View style={styles.addressContainer}>
                <Ionicons name="time" size={14} color={GRAY_LABEL} style={{ marginRight: 4 }} />
                <Text style={styles.calloutAddressText}>
                  {point.horario}
                </Text>
              </View>
            )}
            
            {(point.descripcion || point.contacto) && <View style={styles.divider} />}

            {!!point.descripcion && (
              <>
                <Text style={styles.calloutInfoTitle}>¿Qué acepta?</Text>
                <Text style={styles.calloutInfo} numberOfLines={4}>{point.descripcion}</Text>
              </>
            )}

            {!!point.contacto && (
              <View style={[styles.addressContainer, { marginTop: point.descripcion ? 6 : 0 }]}>
                <Ionicons name="call" size={14} color={GRAY_LABEL} style={{ marginRight: 4 }} />
                <Text style={styles.calloutAddressText}>{point.contacto}</Text>
              </View>
            )}
            
            <View style={styles.navButton}>
              <Ionicons name="navigate" size={16} color={WHITE} />
              <Text style={styles.navButtonText}>Cómo llegar</Text>
            </View>
          </View>
          <View style={styles.calloutArrow} />
        </View>
      </Callout>
    </Marker>
  );
});

export default function MapScreen() {
  const { user, loading: authLoading } = useAuth();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Category>('todos');
  const { isOnline } = useNetworkStatus();

  const openInMaps = useCallback((point: Point) => {
    const latLng = `${point.latitud},${point.longitud}`;
    const label = encodeURIComponent(point.nombre);
    
    // Esquema universal que funciona mejor en ambos sistemas
    const url = Platform.select({
      ios: `maps://0,0?q=${label}&ll=${latLng}`,
      android: `geo:0,0?q=${latLng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latLng}`
    });

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const browserUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;
        Linking.openURL(browserUrl);
      }
    }).catch(err => console.error('Error abriendo mapas:', err));
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      initMap();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const initMap = async () => {
    if (!user) return;
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(location);
      await fetchPoints(location.coords.latitude, location.coords.longitude);
    } catch (e) {
      console.error(e);
      // Si falla la ubicación, aún intentamos cargar puntos guardados
      await fetchPoints(19.4326, -99.1332);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoints = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    let apiPoints: Point[] = [];
    let osmPoints: Point[] = [];

    try {
      if (isOnline) {
        // MODO ONLINE: Intentar siempre obtener datos frescos
        try {
          const centrosData = await centersService.getCentros();
          console.log('[MAP] PRIMER CENTRO RAW:', JSON.stringify(centrosData[0]));

          for (const c of centrosData) {
            apiPoints.push({
              id: c.id || `api-${Math.random()}`,
              nombre: c.nombre,
              direccion: c.direccion || 'Ubicación registrada',
              latitud: parseFloat(c.latitud),
              longitud: parseFloat(c.longitud),
              tipo: 'centro',
              descripcion: c.descripcion || '',
              imagenUrl: c.imagenUrl,
              horario: c.horario,
              contacto: c.contacto,
            });
          }
          
          // Actualizar caché silenciosamente para el próximo uso offline
          SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(apiPoints)).catch(e => console.warn('Error actualizando caché:', e));
        } catch (e) { 
          console.warn('API falló en modo online, recurriendo a caché como último recurso:', e); 
          const cached = await SecureStore.getItemAsync(CACHE_KEY);
          if (cached) apiPoints = JSON.parse(cached);
        }

        // Búsqueda externa solo en modo online
        try {
          const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(
            node["amenity"="pharmacy"](around:3000,${lat},${lon});
            node["amenity"="recycling"](around:3000,${lat},${lon});
            node["industrial"="scrap_yard"](around:3000,${lat},${lon});
          );out center;`;
          
          const response = await fetch(overpassUrl);
          const data = await response.json();
          
          for (const e of data.elements) {
            const tags = e.tags || {};
            let tipo: Category = 'centro';
            if (tags.amenity === 'pharmacy') tipo = 'medicamentos';
            
            osmPoints.push({
              id: `osm-${e.id}`,
              nombre: tags.name || (tipo === 'medicamentos' ? 'Farmacia' : 'Punto Reciclaje'),
              direccion: tags['addr:street'] ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}` : 'Ubicación OSM',
              latitud: e.lat || e.center?.lat,
              longitud: e.lon || e.center?.lon,
              tipo,
              descripcion: tags.description || (tags['recycling:plastic'] ? 'Acepta materiales reciclables.' : undefined),
              contacto: tags.phone || tags['contact:phone'],
            });
          }
        } catch (e) { console.warn('Error en Overpass API'); }
      } else {
        // MODO OFFLINE ESTRICTO: Solo cargar de caché
        const cached = await SecureStore.getItemAsync(CACHE_KEY);
        if (cached) {
          apiPoints = JSON.parse(cached);
          console.log('Cargados centros desde caché por falta de conexión (RF22)');
        }
      }

      setPoints([...apiPoints, ...osmPoints]);
    } catch (error) {
      console.error('Error general en fetchPoints:', error);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  const filteredPoints = useMemo(() => 
    points.filter(p => filter === 'todos' || p.tipo === filter),
  [points, filter]);

  const getMarkerColor = useCallback((tipo: Category) => {
    return CATEGORIES.find(c => c.id === tipo)?.color || GRAY_LABEL;
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={styles.loadingText}>Sincronizando centros...</Text>
      </View>
    );
  }

  if (!isOnline && points.length === 0) {
    return <OfflineView onRetry={initMap} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || 19.4326,
          longitude: location?.coords.longitude || -99.1332,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        loadingEnabled={true}
      >
        {filteredPoints.map((point) => (
          <OptimizedMarker 
            key={`${point.tipo}-${point.id}`}
            point={point}
            color={getMarkerColor(point.tipo)}
            onNav={openInMaps}
          />
        ))}
      </MapView>

      <View style={styles.headerOverlay}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          decelerationRate="fast"
        >
          {CATEGORIES.map((item) => {
            const isActive = filter === item.id;
            return (
              <TouchableOpacity 
                key={item.id}
                activeOpacity={0.7}
                style={[
                  styles.filterButton, 
                  isActive && { backgroundColor: item.color, borderColor: item.color }
                ]}
                onPress={() => setFilter(item.id)}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={16} 
                  color={isActive ? WHITE : GRAY_LABEL} 
                  style={{ marginRight: 8 }} 
                />
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {errorMsg && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={16} color={WHITE} style={{ marginRight: 8 }} />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GRAY_BG,
  },
  loadingText: {
    marginTop: 12,
    color: GRAY_LABEL,
    fontSize: 15,
    fontWeight: '500',
  },
  calloutContainer: {
    alignItems: 'center',
    width: 260,
  },
  calloutContent: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  calloutArrow: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: WHITE,
    borderWidth: 12,
    alignSelf: 'center',
    marginTop: -1,
  },
  calloutImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: GRAY_BG,
  },
  calloutImage: {
    width: '100%',
    height: '100%',
  },
  calloutTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: TEXT_TITLE,
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  calloutAddressText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    lineHeight: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
  },
  calloutInfoTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: GREEN,
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  calloutInfo: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
    marginBottom: 15,
  },
  navButton: {
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 5,
  },
  navButtonText: {
    color: WHITE,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 8,
  },
  headerOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 20,
    left: 0,
    right: 0,
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  filterTextActive: {
    color: WHITE,
  },
  errorBanner: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 82, 82, 0.95)',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  errorText: {
    color: WHITE,
    fontWeight: '600',
    fontSize: 13,
  },
});
