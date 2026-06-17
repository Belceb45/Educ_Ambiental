import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, TextInput, Modal, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { ThemeColors, useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { scannerService } from '@/services/api';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { OfflineView } from '@/components/OfflineView';

const { width, height } = Dimensions.get('window');
const frameWidth = width * 0.8;
const frameHeight = height * 0.25;

interface ProductInfo {
  nombreProducto: string;
  imagenUrl: string;
  materialesDetectados: string[];
  instruccionesSugeridas: string;
  categoriaSugerida: string;
  encontrado: boolean;
}

export default function ScanScreen() {
  const { user, loading: authLoading } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  // Cerrojo síncrono: setScanned es asíncrono y la cámara dispara muchos frames
  // antes del re-render, por lo que sin esto se lanzan decenas de peticiones.
  const isProcessingRef = useRef(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [manualInputVisible, setManualInputVisible] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<ProductInfo | null>(null);
  const [resultVisible, setResultVisible] = useState(false);
  const { isOnline } = useNetworkStatus();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const router = useRouter();

  // Las pestañas permanecen montadas al navegar: si la cámara quedara montada,
  // seguiría encendida (incluida la linterna) en segundo plano. Solo se renderiza
  // con la pestaña enfocada y al salir se apaga la linterna y se resetea el escaneo.
  const isFocused = useIsFocused();

  // Libera el cerrojo y permite volver a escanear.
  const resetScan = useCallback(() => {
    isProcessingRef.current = false;
    setScanned(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setFlash('off');
        isProcessingRef.current = false;
        setScanned(false);
        setResultVisible(false);
        setManualInputVisible(false);
      };
    }, [])
  );

  if (authLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  if (!user) return null;

  if (!permission) {
    return <View />;
  }

  if (!isOnline) {
    return <OfflineView />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>Necesitamos tu permiso para usar la cámara</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Otorgar Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fetchProductInfo = async (code: string) => {
    setLoading(true);
    try {
      const response = await scannerService.getProduct(code);
      if (response.encontrado) {
        setProductData(response);
        setResultVisible(true);
      } else {
        Alert.alert(
          'No encontrado',
          'No se encontró información para este producto.',
          [{ text: 'OK', onPress: resetScan }]
        );
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      const errorMessage = error.message || 'Error desconocido';
      Alert.alert(
        'Error de Escaneo',
        `No pudimos procesar el código. Detalle: ${errorMessage}`,
        [{ text: 'OK', onPress: resetScan }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    // El ref bloquea de forma inmediata; el estado se actualiza en el siguiente render.
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setScanned(true);
    fetchProductInfo(data);
  };

  const toggleFlash = () => {
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  };

  const handleManualSubmit = () => {
    if (barcodeValue.trim().length > 0) {
      isProcessingRef.current = true;
      setScanned(true);
      setManualInputVisible(false);
      fetchProductInfo(barcodeValue);
    } else {
      Alert.alert('Error', 'Por favor ingresa un código válido');
    }
  };

  return (
    <View style={styles.container}>
      {isFocused && <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={flash === 'on'}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            "aztec", "ean13", "ean8", "qr", "pdf417", "upc_e", "datamatrix", "code39", "code93", "itf14", "codabar", "code128", "upc_a"
          ],
        }}
      >
        {/* Botón para salir (arriba a la izquierda) */}
        <TouchableOpacity 
          style={styles.exitButton} 
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="close-circle" size={40} color={'#FFFFFF'} />
        </TouchableOpacity>

        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            {/* Texto de guía sobre el recuadro */}
            <Text style={styles.scanText}>Escanea el código de barras</Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleFlash}>
            <Ionicons name={flash === 'on' ? "flash" : "flash-off"} size={24} color={'#FFFFFF'} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.manualButton]} 
            onPress={() => setManualInputVisible(true)}
          >
            <Ionicons name="keypad" size={24} color={'#FFFFFF'} />
            <Text style={styles.manualButtonText}>Ingreso Manual</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.green} />
            <Text style={styles.loadingText}>Buscando producto...</Text>
          </View>
        )}
      </CameraView>}

      {/* Modal para ingreso manual */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={manualInputVisible}
        onRequestClose={() => setManualInputVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ingreso Manual</Text>
            <Text style={styles.modalLabel}>Digita el código de barras del producto:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 750123456789"
              keyboardType="numeric"
              value={barcodeValue}
              onChangeText={setBarcodeValue}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setManualInputVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]} 
                onPress={handleManualSubmit}
              >
                <Text style={styles.submitButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para resultado del escaneo */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={resultVisible}
        onRequestClose={() => setResultVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.closeResultButton}
                onPress={() => {
                  setResultVisible(false);
                  resetScan();
                }}
              >
                <Ionicons name="close" size={24} color={colors.textTitle} />
              </TouchableOpacity>

              {productData?.imagenUrl && (
                <Image 
                  source={{ uri: productData.imagenUrl }} 
                  style={styles.productImage} 
                  resizeMode="contain"
                />
              )}

              <Text style={styles.productName}>{productData?.nombreProducto}</Text>
              
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{productData?.categoriaSugerida}</Text>
              </View>

              <View style={styles.sectionDivider} />

              <Text style={styles.sectionTitle}>Materiales Detectados</Text>
              <View style={styles.tagsContainer}>
                {productData?.materialesDetectados.map((item, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{item.toUpperCase()}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Instrucciones de Reciclaje</Text>
              <Text style={styles.instructionsText}>{productData?.instruccionesSugeridas}</Text>

              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => {
                  setResultVisible(false);
                  resetScan();
                }}
              >
                <Text style={styles.doneButtonText}>Entendido</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    color: '#FFFFFF',
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: c.green,
    padding: 15,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  scanFrame: {
    width: frameWidth,
    height: frameHeight,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  scanText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    position: 'absolute',
    top: -40,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  manualButton: {
    flexDirection: 'row',
    width: 'auto',
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  manualButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: c.white,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: c.textTitle,
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 15,
    color: c.grayLabel,
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 55,
    borderWidth: 1.5,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 20,
    marginBottom: 30,
    backgroundColor: '#FAFAFA',
    textAlign: 'center',
    letterSpacing: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 7,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  submitButton: {
    backgroundColor: c.green,
  },
  cancelButtonText: {
    color: c.grayLabel,
    fontWeight: '700',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: c.white,
    borderRadius: 24,
    padding: 24,
    elevation: 10,
  },
  closeResultButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  productImage: {
    width: '100%',
    height: 180,
    marginBottom: 16,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: c.textTitle,
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'center',
    backgroundColor: c.greenLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryText: {
    color: c.green,
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    width: '100%',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: c.textTitle,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: c.grayLabel,
    fontWeight: '600',
  },
  instructionsText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
  },
  doneButton: {
    backgroundColor: c.green,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
