import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Platform, Linking } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { centersService } from '@/services/api';
import { ThemeColors, useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { ECO_MAP_STYLE } from '@/constants/map-style';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { OfflineView } from '@/components/OfflineView';

import * as SecureStore from 'expo-secure-store';

// v2: invalida caché anterior que guardaba descripcion vacía
const CACHE_KEY = 'cached_centers_v2';

const CDMX_REGION: Region = {
  latitude: 19.4326,
  longitude: -99.1332,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

type Category = 'todos' | 'centro' | 'medicamentos' | 'vidrio' | 'plastico' | 'electronicos' | 'ropa';

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
  { id: 'centro', label: 'Centros', icon: 'business', color: '#43A047' },
  { id: 'medicamentos', label: 'Medicinas', icon: 'medical', color: '#E91E63' },
  { id: 'vidrio', label: 'Vidrio', icon: 'wine', color: '#00897B' },
  { id: 'plastico', label: 'Plásticos', icon: 'water', color: '#2196F3' },
  { id: 'electronicos', label: 'E-Waste / Pilas', icon: 'battery-dead', color: '#FF9800' },
  { id: 'ropa', label: 'Ropa', icon: 'shirt', color: '#8E24AA' },
];

const ICON_BY_CATEGORY: Record<Category, string> = {
  todos: 'location',
  centro: 'business',
  medicamentos: 'medical',
  vidrio: 'wine',
  plastico: 'water',
  electronicos: 'battery-dead',
  ropa: 'shirt',
};

// ── Clasificación de resultados de OpenStreetMap (Overpass) ───────────────────
type OsmTags = Record<string, string | undefined>;
const yes = (tags: OsmTags, key: string) => tags[key] === 'yes' || tags[key] === 'only';

function classifyOsm(tags: OsmTags): Category {
  if (tags.amenity === 'pharmacy') return 'medicamentos';
  if (tags.shop === 'charity' || tags.shop === 'second_hand') return 'ropa';
  if (tags.shop === 'scrap_yard' || tags.industrial === 'scrap_yard') return 'centro';

  const glass = yes(tags, 'recycling:glass') || yes(tags, 'recycling:glass_bottles');
  const plastic =
    yes(tags, 'recycling:plastic') ||
    yes(tags, 'recycling:plastic_bottles') ||
    yes(tags, 'recycling:plastic_packaging') ||
    yes(tags, 'recycling:PET');
  const ewaste =
    yes(tags, 'recycling:electrical_appliances') ||
    yes(tags, 'recycling:electronics') ||
    yes(tags, 'recycling:small_appliances') ||
    yes(tags, 'recycling:computers') ||
    yes(tags, 'recycling:batteries');
  const clothes = yes(tags, 'recycling:clothes') || yes(tags, 'recycling:shoes');

  // Un centro general (o que acepta 2+ materiales) se queda como "centro".
  const count = [glass, plastic, ewaste, clothes].filter(Boolean).length;
  if (tags.recycling_type === 'centre' || count >= 2) return 'centro';

  if (clothes) return 'ropa';
  if (ewaste) return 'electronicos';
  if (glass) return 'vidrio';
  if (plastic) return 'plastico';
  return 'centro';
}

// Construye un texto "¿Qué acepta?" legible a partir de las etiquetas recycling:*
function describeMaterials(tags: OsmTags): string | undefined {
  const m: string[] = [];
  if (yes(tags, 'recycling:glass') || yes(tags, 'recycling:glass_bottles')) m.push('Vidrio');
  if (yes(tags, 'recycling:plastic') || yes(tags, 'recycling:plastic_bottles') || yes(tags, 'recycling:PET')) m.push('Plástico');
  if (yes(tags, 'recycling:paper') || yes(tags, 'recycling:cardboard') || yes(tags, 'recycling:newspaper')) m.push('Papel/Cartón');
  if (yes(tags, 'recycling:cans') || yes(tags, 'recycling:scrap_metal') || yes(tags, 'recycling:metal') || yes(tags, 'recycling:aluminium')) m.push('Metal/Latas');
  if (yes(tags, 'recycling:electrical_appliances') || yes(tags, 'recycling:electronics') || yes(tags, 'recycling:computers')) m.push('Electrónicos');
  if (yes(tags, 'recycling:batteries')) m.push('Pilas');
  if (yes(tags, 'recycling:clothes') || yes(tags, 'recycling:shoes')) m.push('Ropa');
  if (yes(tags, 'recycling:cooking_oil') || yes(tags, 'recycling:oil')) m.push('Aceite de cocina');
  if (yes(tags, 'recycling:organic') || yes(tags, 'recycling:green_waste')) m.push('Orgánico');
  return m.length ? `Acepta: ${m.join(', ')}` : undefined;
}

// Pin personalizado: gota con icono de categoría. Mucho más limpio que el pin nativo.
const MarkerPin = memo(function MarkerPin({ color, icon }: { color: string; icon: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.pinWrapper}>
      <View style={[styles.pinBubble, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={16} color={'#FFFFFF'} />
      </View>
      <View style={[styles.pinTail, { borderTopColor: color }]} />
    </View>
  );
});

// Marcador optimizado. tracksViewChanges arranca en true para que el pin
// personalizado se rasterice una vez (necesario en Android) y luego se apaga
// para no recalcular en cada gesto del mapa → desplazamiento fluido.
const OptimizedMarker = memo(function OptimizedMarker({ point, color, onNav }: { point: Point; color: string; onNav: (p: Point) => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [tracks, setTracks] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setTracks(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <Marker
      coordinate={{ latitude: point.latitud, longitude: point.longitud }}
      tracksViewChanges={tracks}
      anchor={{ x: 0.5, y: 1 }}
      calloutAnchor={{ x: 0.5, y: 0.1 }}
    >
      <MarkerPin color={color} icon={ICON_BY_CATEGORY[point.tipo]} />
      <Callout
        tooltip
        onPress={() => onNav(point)}
      >
        <View style={styles.calloutContainer}>
          <View style={styles.calloutContent}>
            <Text style={styles.calloutTitle}>{point.nombre}</Text>

            <View style={[styles.badge, { backgroundColor: color + '20', marginBottom: 10 }]}>
              <Text style={[styles.badgeText, { color: color }]}>
                {CATEGORIES.find(c => c.id === point.tipo)?.label || 'Centro'}
              </Text>
            </View>

            <View style={styles.addressContainer}>
              <Ionicons name="location" size={14} color={colors.grayLabel} style={{ marginRight: 4 }} />
              <Text style={styles.calloutAddressText} numberOfLines={2}>
                {point.direccion}
              </Text>
            </View>

            {point.horario && (
              <View style={styles.addressContainer}>
                <Ionicons name="time" size={14} color={colors.grayLabel} style={{ marginRight: 4 }} />
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
                <Ionicons name="call" size={14} color={colors.grayLabel} style={{ marginRight: 4 }} />
                <Text style={styles.calloutAddressText}>{point.contacto}</Text>
              </View>
            )}

            <View style={styles.navButton}>
              <Ionicons name="navigate" size={16} color={'#FFFFFF'} />
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
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const mapRef = useRef<MapView | null>(null);
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

  const animateToRegion = useCallback((lat: number, lon: number, delta = 0.03) => {
    mapRef.current?.animateToRegion(
      { latitude: lat, longitude: lon, latitudeDelta: delta, longitudeDelta: delta },
      700,
    );
  }, []);

  const recenter = useCallback(() => {
    if (location) {
      animateToRegion(location.coords.latitude, location.coords.longitude);
    }
  }, [location, animateToRegion]);

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
      // Encuadrar suavemente en la posición real del usuario
      setTimeout(() => animateToRegion(location.coords.latitude, location.coords.longitude), 400);
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

        // Búsqueda externa solo en modo online. Radio 5km y se incluyen
        // contenedores/centros de reciclaje, farmacias, chatarrerías y donación.
        try {
          const R = 5000;
          const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
            `[out:json][timeout:25];(
              node["amenity"="pharmacy"](around:${R},${lat},${lon});
              node["amenity"="recycling"](around:${R},${lat},${lon});
              way["amenity"="recycling"](around:${R},${lat},${lon});
              node["shop"="scrap_yard"](around:${R},${lat},${lon});
              node["industrial"="scrap_yard"](around:${R},${lat},${lon});
              node["shop"="second_hand"](around:${R},${lat},${lon});
              node["shop"="charity"](around:${R},${lat},${lon});
            );out center;`
          )}`;

          const response = await fetch(overpassUrl);
          const data = await response.json();

          const labelFor: Partial<Record<Category, string>> = {
            medicamentos: 'Farmacia',
            vidrio: 'Contenedor de vidrio',
            plastico: 'Contenedor de plástico',
            electronicos: 'Punto de e-waste / pilas',
            ropa: 'Contenedor de ropa',
            centro: 'Punto de reciclaje',
          };

          const seen = new Set<string>();
          for (const e of data.elements) {
            const tags: OsmTags = e.tags || {};
            const ladd = e.lat ?? e.center?.lat;
            const lonn = e.lon ?? e.center?.lon;
            if (ladd == null || lonn == null) continue;

            // Evitar duplicados muy cercanos sin nombre
            const dedupeKey = tags.name || `${ladd.toFixed(5)},${lonn.toFixed(5)}`;
            if (seen.has(dedupeKey)) continue;
            seen.add(dedupeKey);

            const tipo = classifyOsm(tags);
            osmPoints.push({
              id: `osm-${e.type?.[0] ?? 'n'}-${e.id}`,
              nombre: tags.name || labelFor[tipo] || 'Punto de reciclaje',
              direccion: tags['addr:street']
                ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}`.trim()
                : 'Ubicación OSM',
              latitud: ladd,
              longitud: lonn,
              tipo,
              descripcion: describeMaterials(tags) || tags.description,
              contacto: tags.phone || tags['contact:phone'],
              horario: tags.opening_hours,
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
    return CATEGORIES.find(c => c.id === tipo)?.color || '#9E9E9E';
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.green} />
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
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={ECO_MAP_STYLE}
        initialRegion={{
          latitude: location?.coords.latitude || CDMX_REGION.latitude,
          longitude: location?.coords.longitude || CDMX_REGION.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        loadingEnabled={true}
        loadingBackgroundColor={colors.grayBg}
        loadingIndicatorColor={colors.green}
        pitchEnabled={false}
        rotateEnabled={false}
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
                  color={isActive ? '#FFFFFF' : colors.grayLabel}
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

      {/* Contador de resultados */}
      <View style={styles.countChip}>
        <Ionicons name="locate" size={14} color={colors.green} style={{ marginRight: 6 }} />
        <Text style={styles.countText}>
          {filteredPoints.length} {filteredPoints.length === 1 ? 'lugar' : 'lugares'}
        </Text>
      </View>

      {/* Botón flotante para recentrar en mi ubicación */}
      <TouchableOpacity
        style={styles.recenterFab}
        activeOpacity={0.85}
        onPress={recenter}
        disabled={!location}
      >
        <Ionicons name="navigate" size={22} color={location ? colors.green : colors.grayLabel} />
      </TouchableOpacity>

      {errorMsg && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={16} color={'#FFFFFF'} style={{ marginRight: 8 }} />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.white,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: c.grayBg,
  },
  loadingText: {
    marginTop: 12,
    color: c.grayLabel,
    fontSize: 15,
    fontWeight: '500',
  },

  // ── Pin personalizado ──────────────────────────────────────────────────────
  pinWrapper: {
    alignItems: 'center',
    width: 40,
  },
  pinBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: c.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  pinTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },

  calloutContainer: {
    alignItems: 'center',
    width: 260,
  },
  calloutContent: {
    backgroundColor: c.white,
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
    borderTopColor: c.white,
    borderWidth: 12,
    alignSelf: 'center',
    marginTop: -1,
  },
  calloutTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: c.textTitle,
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
    color: c.green,
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
    backgroundColor: c.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 5,
  },
  navButtonText: {
    color: c.white,
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
    backgroundColor: c.white,
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
    color: c.white,
  },

  // ── Contador de resultados ─────────────────────────────────────────────────
  countChip: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: c.textTitle,
  },

  // ── Botón recentrar ────────────────────────────────────────────────────────
  recenterFab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: c.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },

  errorBanner: {
    position: 'absolute',
    bottom: 90,
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
    color: c.white,
    fontWeight: '600',
    fontSize: 13,
  },
});
