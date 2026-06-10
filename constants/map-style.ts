// Estilo de mapa personalizado para Google Maps.
// Objetivo: aspecto limpio y "eco" — menos ruido de POIs, agua y áreas verdes
// suavizadas, carreteras claras. Mejora la legibilidad de los marcadores propios.
export const ECO_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f5f7f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b6b6b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },

  // Ocultar POIs comerciales para reducir ruido visual
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },

  // Parques en verde suave (coherente con la marca)
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#dcefe0' }, { visibility: 'on' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4caf7d' }],
  },

  // Carreteras limpias
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e9e9e9' }] },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#fef3d8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#f2e2b8' }],
  },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9aa0a6' }] },

  // Agua en azul suave
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c5e3f0' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#7aafc4' }] },

  // Tierra / paisaje
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#eef1ee' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
];
