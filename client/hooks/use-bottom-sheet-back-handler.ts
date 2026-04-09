import { RefObject, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

type BottomSheetBackHandlerConfig = {
  isOpen: boolean;
  ref: RefObject<BottomSheetModal | null>;
};

export function useBottomSheetBackHandler(sheetConfigs: BottomSheetBackHandlerConfig[]) {
  const sheetConfigsRef = useRef(sheetConfigs);

  useEffect(() => {
    sheetConfigsRef.current = sheetConfigs;
  }, [sheetConfigs]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      for (let index = sheetConfigsRef.current.length - 1; index >= 0; index -= 1) {
        const sheetConfig = sheetConfigsRef.current[index];

        if (!sheetConfig.isOpen) {
          continue;
        }

        sheetConfig.ref.current?.dismiss();
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, []);
}
