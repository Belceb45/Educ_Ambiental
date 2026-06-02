import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView, Platform, Linking } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { centersService } from '@/services/api';
import { GREEN, WHITE, TEXT_TITLE, GRAY_LABEL, GRAY_BG } from '@/constants/auth-styles';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { OfflineView } from '@/components/OfflineView';

type Category = 'todos' | 'centro' | 'medicamentos' | 'electronicos' | 'plastico';

interface Point {
  id: string | number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  tipo: Category;
  descripcion: string;
}

const CATEGORIES: { id: Category; label: string; icon: string; color: string }[] = [
  { id: 'todos', label: 'Todos', icon: 'apps', color: '#666' },
  { id: 'centro', label: 'Centros', icon: 'business', color: GREEN },
  { id: 'medicamentos', label: 'Medicinas', icon: 'medical', color: '#E91E63' },
  { id: 'electronicos', label: 'E-Waste', icon: 'battery-dead', color: '#FF9800' },
  { id: 'plastico', label: 'Plásticos', icon: 'water', color: '#2196F3' },
];

// Componente de Marcador optimizado para evitar re-renders innecesarios
const OptimizedMarker = memo(({ point, color, onNav }: { point: Point; color: string; onNav: (p: Point) => void }) => {
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
            <Text style={styles.calloutTitle}>{point.nombre}</Text>
            
            <View style={[styles.badge, { backgroundColor: color + '20', marginBottom: 10 }]}>
              <Text style={[styles.badgeText, { color: color }]}>
                {CATEGORIES.find(c => c.id === point.tipo)?.label}
              </Text>
            </View>

            <View style={styles.addressContainer}>
              <Ionicons name="location" size={14} color={GRAY_LABEL} style={{ marginRight: 4 }} />
              <Text style={styles.calloutAddressText} numberOfLines={2}>
                {point.direccion}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.calloutInfoTitle}>¿Qué recibir?:</Text>
            <Text style={styles.calloutInfo}>{point.descripcion}</Text>
            
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
    if (!authLoading && user && isOnline) {
      initMap();
    } else if (!authLoading && !user) {
      setLoading(false);
    } else if (!isOnline && points.length === 0) {
      setLoading(false);
    }
  }, [isOnline, user, authLoading]);

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
      setErrorMsg('Error al obtener la ubicación');
    } finally {
      setLoading(false);
    }
  };

  const fetchPoints = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const getDetailedAddress = async (lat: number, lon: number, fallback: string) => {
        if (!lat || !lon || isNaN(lat) || isNaN(lon)) return fallback;
        try {
          // Retraso artificial para no saturar la API (Evitar Rate Limit)
          await new Promise(resolve => setTimeout(resolve, 300));
          const [address] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
          if (address) {
            const parts = [
              address.street ? `${address.street} ${address.streetNumber || ''}` : '',
              address.district || address.subregion || '',
              address.city || '',
              address.postalCode ? `CP ${address.postalCode}` : ''
            ].filter(p => p.trim() !== '');
            
            return parts.join(', ') || fallback;
          }
        } catch (e) {
          console.warn(`Geocoding skipped/failed for ${lat},${lon}`);
        }
        return fallback;
      };

      // 1. Centros de nuestra API
      let apiPoints: Point[] = [];
      try {
        const centrosData = await centersService.getCentros();
        // Procesamos un máximo de 10 puntos de la API para geocodificar y evitar bloqueos
        const limitedCenters = centrosData.slice(0, 15);
        for (const c of limitedCenters) {
          const lat_c = parseFloat(c.latitud);
          const lon_c = parseFloat(c.longitud);
          
          let finalDir = c.direccion || 'Dirección no disponible';
          if (!c.direccion || c.direccion.length < 15) {
            finalDir = await getDetailedAddress(lat_c, lon_c, finalDir);
          }

          apiPoints.push({
            id: c.id || `api-${Math.random()}`,
            nombre: c.nombre,
            direccion: finalDir,
            latitud: lat_c,
            longitud: lon_c,
            tipo: 'centro',
            descripcion: c.descripcion || 'Centro de acopio de materiales reciclables.',
          });
        }
        
        // Agregar el resto sin forzar geocodificación
        if (centrosData.length > 15) {
            for (const c of centrosData.slice(15)) {
                apiPoints.push({
                    id: c.id || `api-${Math.random()}`,
                    nombre: c.nombre,
                    direccion: c.direccion && c.direccion.length > 5 ? c.direccion : 'Centro registrado en el mapa',
                    latitud: parseFloat(c.latitud),
                    longitud: parseFloat(c.longitud),
                    tipo: 'centro',
                    descripcion: c.descripcion || 'Centro de acopio de materiales reciclables.',
                });
            }
        }
      } catch (e) { console.warn('API Error:', e); }

      // 2. Búsqueda expandida vía Overpass
      // Reducimos el radio a 3000 metros para no traer cientos de resultados de golpe
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(
        node["amenity"="pharmacy"](around:3000,${lat},${lon});
        node["amenity"="recycling"](around:3000,${lat},${lon});
        node["industrial"="scrap_yard"](around:3000,${lat},${lon});
        way["amenity"="recycling"](around:3000,${lat},${lon});
        way["industrial"="scrap_yard"](around:3000,${lat},${lon});
      );out center;`;
      
      const response = await fetch(overpassUrl);
      const data = await response.json();
      
      const osmPoints: Point[] = [];
      for (const e of data.elements) {
        const lat_pos = e.lat || e.center?.lat;
        const lon_pos = e.lon || e.center?.lon;
        const tags = e.tags || {};
        
        let tipo: Category = 'centro';
        let desc = 'Punto de reciclaje o acopio.';
        
        if (tags.amenity === 'pharmacy') {
          tipo = 'medicamentos';
          desc = 'Recibe medicamentos caducados y envases.';
        } else if (tags['recycling:electronic_waste'] === 'yes' || tags['recycling:batteries'] === 'yes') {
          tipo = 'electronicos';
          desc = 'Especializado en residuos electrónicos y baterías.';
        } else if (tags['recycling:plastic'] === 'yes' || tags['recycling:glass'] === 'yes') {
          tipo = 'plastico';
          desc = 'Contenedor o centro para plásticos, PET y vidrio.';
        } else if (tags.industrial === 'scrap_yard') {
          desc = 'Centro de reciclaje de metales y materiales industriales.';
        }

        // NO usamos reverseGeocodeAsync aquí para evitar el RATE LIMIT de Apple/Google.
        // Construimos la dirección solo con la metadata que ya trae el mapa.
        let osmAddr = 'Ubicación localizable por GPS';
        if (tags['addr:street']) {
          osmAddr = `${tags['addr:street']} ${tags['addr:housenumber'] || ''}`;
          if (tags['addr:suburb'] || tags['addr:neighbourhood']) {
              osmAddr += `, ${tags['addr:suburb'] || tags['addr:neighbourhood']}`;
          }
          osmAddr = osmAddr.trim().replace(/^,|,$/g, '');
        }

        osmPoints.push({
          id: `osm-${e.id}`,
          nombre: tags.name || (tipo === 'medicamentos' ? 'Farmacia' : 'Centro de Reciclaje'),
          direccion: osmAddr,
          latitud: lat_pos,
          longitud: lon_pos,
          tipo,
          descripcion: desc,
        });
      }

      setPoints([...apiPoints, ...osmPoints]);
    } catch (error) {
      console.error('Error fetching points:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
