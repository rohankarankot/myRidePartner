import React from 'react';
import { Modal } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';

type NotificationsConfirmModalProps = {
  backgroundColor: string;
  borderColor: string;
  confirmLabel: string;
  dangerColor: string;
  icon: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  pending: boolean;
  subtextColor: string;
  textColor: string;
  title: string;
  visible: boolean;
};

export function NotificationsConfirmModal({
  backgroundColor,
  borderColor,
  confirmLabel,
  dangerColor,
  icon,
  message,
  onCancel,
  onConfirm,
  pending,
  subtextColor,
  textColor,
  title,
  visible,
}: NotificationsConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Box className="flex-1 bg-black/60 justify-center items-center px-6">
        <Box className="w-full rounded-[32px] p-8 items-center border-2 border-white shadow-2xl" style={{ backgroundColor }}>
          <Box className="w-16 h-16 rounded-full items-center justify-center mb-6 border-4" style={{ backgroundColor: `${dangerColor}10`, borderColor: `${dangerColor}20` }}>
            <IconSymbol name={icon as any} size={32} color={dangerColor} />
          </Box>
          <Text className="text-2xl font-extrabold mb-2 text-center" style={{ color: textColor }}>
            {title}
          </Text>
          <Text className="text-sm font-medium text-center leading-6 mb-8" style={{ color: subtextColor }}>
            {message}
          </Text>
          <HStack className="w-full" space="md">
            <Button
              className="flex-1 h-14 rounded-2xl border-2 shadow-sm"
              variant="outline"
              style={{ borderColor }}
              onPress={onCancel}
            >
              <ButtonText className="text-xs font-extrabold uppercase tracking-widest" style={{ color: textColor }}>Cancel</ButtonText>
            </Button>
            <Button
              className="flex-1 h-14 rounded-2xl shadow-lg"
              style={{ backgroundColor: dangerColor }}
              onPress={onConfirm}
              disabled={pending}
            >
              {pending ? (
                <Spinner color="#fff" size="small" />
              ) : (
                <HStack space="xs" className="items-center">
                  <ButtonText className="text-xs font-extrabold uppercase tracking-widest text-white">{confirmLabel}</ButtonText>
                  <IconSymbol name="trash.fill" size={12} color="white" />
                </HStack>
              )}
            </Button>
          </HStack>
        </Box>
      </Box>
    </Modal>
  );
}
