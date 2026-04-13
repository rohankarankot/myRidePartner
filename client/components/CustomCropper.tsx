import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Image as RNImage } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface CustomCropperRef {
  crop: () => Promise<void>;
}

interface CustomCropperProps {
  imageUri: string;
  onCropResult: (croppedUri: string) => void;
  cropWidth: number;
  cropHeight: number;
}

export const CustomCropper = forwardRef<CustomCropperRef, CustomCropperProps>(
  ({ imageUri, onCropResult, cropWidth, cropHeight }, ref) => {
    const [imgWidth, setImgWidth] = useState(1);
    const [imgHeight, setImgHeight] = useState(1);

    useEffect(() => {
      if (!imageUri) return;
      RNImage.getSize(
        imageUri,
        (w, h) => {
          setImgWidth(w);
          setImgHeight(h);
        },
        () => {
          // Fallback dimensions in case of error
          setImgWidth(cropWidth);
          setImgHeight(cropHeight);
        }
      );
    }, [imageUri, cropWidth, cropHeight]);

    // Scale image so that it completely covers the crop box
    const scale = Math.max(cropWidth / imgWidth, cropHeight / imgHeight);
    const displayWidth = imgWidth * scale;
    const displayHeight = imgHeight * scale;

    const translationX = useSharedValue(0);
    const translationY = useSharedValue(0);
    const prevTranslationX = useSharedValue(0);
    const prevTranslationY = useSharedValue(0);

    const maxTranslateX = (displayWidth - cropWidth) / 2;
    const maxTranslateY = (displayHeight - cropHeight) / 2;

    const pan = Gesture.Pan()
      .onStart(() => {
        prevTranslationX.value = translationX.value;
        prevTranslationY.value = translationY.value;
      })
      .onUpdate((event) => {
        let nextX = prevTranslationX.value + event.translationX;
        let nextY = prevTranslationY.value + event.translationY;

        // Bounding box limits so user cannot drag the image out of the crop frame
        nextX = Math.min(Math.max(nextX, -maxTranslateX), maxTranslateX);
        nextY = Math.min(Math.max(nextY, -maxTranslateY), maxTranslateY);

        translationX.value = nextX;
        translationY.value = nextY;
      });

    const animatedStyles = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translationX.value },
          { translateY: translationY.value },
        ],
      };
    });

    useImperativeHandle(ref, () => ({
      crop: async () => {
        // Calculate the actual crop coordinates relative to the original image pixels
        const xBase = (displayWidth - cropWidth) / 2 - translationX.value;
        const yBase = (displayHeight - cropHeight) / 2 - translationY.value;

        let originX = xBase / scale;
        let originY = yBase / scale;
        let cropW = cropWidth / scale;
        let cropH = cropHeight / scale;

        // Safety clamps to strictly avoid manipulator errors (out of bounds)
        originX = Math.max(0, originX);
        originY = Math.max(0, originY);
        cropW = Math.min(imgWidth - originX, cropW);
        cropH = Math.min(imgHeight - originY, cropH);

        const result = await manipulateAsync(
          imageUri,
          [{ crop: { originX, originY, width: cropW, height: cropH } }],
          { compress: 0.9, format: SaveFormat.JPEG }
        );
        onCropResult(result.uri);
      },
    }));

    if (imgWidth === 1 && imgHeight === 1) {
      return <View style={{ width: cropWidth, height: cropHeight, backgroundColor: '#e5e5e5', borderRadius: 16 }} />;
    }

    return (
      <View style={{ width: cropWidth, height: cropHeight, overflow: 'hidden', borderRadius: 16 }}>
        <GestureDetector gesture={pan}>
          <Animated.Image
            source={{ uri: imageUri }}
            style={[
              {
                width: displayWidth,
                height: displayHeight,
                position: 'absolute',
                left: -(displayWidth - cropWidth) / 2,
                top: -(displayHeight - cropHeight) / 2,
              },
              animatedStyles,
            ]}
            resizeMode="cover"
          />
        </GestureDetector>
        {/* Overlay grid lines (Optional but nice UX) */}
        <View className="absolute inset-0 border border-white/30 rounded-2xl pointer-events-none flex flex-col justify-between">
           <View className="flex-1 border-b border-dashed border-white/20" />
           <View className="flex-1 border-b border-dashed border-white/20" />
           <View className="flex-1" />
           <View className="absolute inset-0 flex flex-row justify-between">
             <View className="flex-1 border-r border-dashed border-white/20" />
             <View className="flex-1 border-r border-dashed border-white/20" />
             <View className="flex-1" />
           </View>
        </View>
      </View>
    );
  }
);
