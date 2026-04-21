import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';

interface FullScreenImageViewerProps {
  isVisible: boolean;
  imageUrl?: string;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const FullScreenImageViewer = ({
  isVisible,
  imageUrl,
  onClose,
}: FullScreenImageViewerProps) => {
  const primaryColor = useThemeColor({}, 'primary');

  if (!imageUrl) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <IconSymbol name="xmark" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.fullImage}
              contentFit="contain"
              transition={200}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 60,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height * 0.8,
  },
});
