import React from 'react';
import { Modal, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type WorkspaceVerificationModalProps = {
  visible: boolean;
  email: string;
  otp: string;
  step: 'email' | 'otp';
  isPending: boolean;
  onClose: () => void;
  onChangeEmail: (value: string) => void;
  onChangeOtp: (value: string) => void;
  onRequestOtp: () => void;
  onConfirmOtp: () => void;
  onBackToEmail: () => void;
};

export function WorkspaceVerificationModal({
  visible,
  email,
  otp,
  step,
  isPending,
  onClose,
  onChangeEmail,
  onChangeOtp,
  onRequestOtp,
  onConfirmOtp,
  onBackToEmail,
}: WorkspaceVerificationModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');
  const dangerColor = useThemeColor({}, 'danger');

  const isEmailStep = step === 'email';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 }}>
          <VStack className="flex-1 justify-between" space="xl">
            <VStack space="lg">
              <HStack className="items-center justify-between">
                <Pressable
                  className="w-11 h-11 rounded-full border items-center justify-center"
                  style={{ borderColor, backgroundColor: `${primaryColor}10` }}
                  onPress={onClose}
                >
                  <IconSymbol name="xmark" size={16} color={textColor} />
                </Pressable>
                <Text className="text-[10px] font-extrabold uppercase tracking-[0.35em]" style={{ color: subtextColor }}>
                  Workspace verification
                </Text>
                <Box className="w-11 h-11" />
              </HStack>

              <VStack space="md" className="items-start">
                <Box className="w-20 h-20 rounded-[28px] items-center justify-center border shadow-sm" style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}15` }}>
                  <IconSymbol name="briefcase.fill" size={30} color={primaryColor} />
                </Box>
                <VStack space="xs">
                  <Text className="text-3xl font-extrabold" style={{ color: textColor }}>
                    {isEmailStep ? 'Verify your workspace' : 'Enter your OTP'}
                  </Text>
                  <Text className="text-sm leading-6" style={{ color: subtextColor }}>
                    {isEmailStep
                      ? 'Use a workplace or university email address. We will send a 6-digit code to that inbox.'
                      : `We sent a 6-digit code to ${email}. You can change the email if it was typed incorrectly.`}
                  </Text>
                </VStack>
              </VStack>

              <Box className="rounded-[32px] p-5 border shadow-sm" style={{ backgroundColor: cardColor, borderColor: `${borderColor}80` }}>
                {isEmailStep ? (
                  <VStack space="md">
                    <VStack space="xs">
                      <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>
                        Workspace Email
                      </Text>
                      <TextInput
                        placeholder="e.g. name@company.com"
                        value={email}
                        onChangeText={onChangeEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{
                          width: '100%',
                          padding: 14,
                          borderRadius: 18,
                          borderWidth: 1.5,
                          borderColor,
                          color: textColor,
                          backgroundColor: `${backgroundColor}90`,
                        }}
                      />
                    </VStack>
                  </VStack>
                ) : (
                  <VStack space="md">
                    <VStack space="xs">
                      <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>
                        Email
                      </Text>
                      <TextInput
                        value={email}
                        onChangeText={onChangeEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{
                          width: '100%',
                          padding: 14,
                          borderRadius: 18,
                          borderWidth: 1.5,
                          borderColor,
                          color: textColor,
                          backgroundColor: `${backgroundColor}90`,
                        }}
                      />
                    </VStack>
                    <VStack space="xs">
                      <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>
                        OTP
                      </Text>
                      <TextInput
                        placeholder="123456"
                        value={otp}
                        onChangeText={onChangeOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        style={{
                          width: '100%',
                          padding: 16,
                          borderRadius: 18,
                          borderWidth: 1.5,
                          borderColor,
                          color: textColor,
                          backgroundColor: `${backgroundColor}90`,
                          textAlign: 'center',
                          letterSpacing: 8,
                          fontSize: 22,
                          fontWeight: '700',
                        }}
                      />
                    </VStack>
                  </VStack>
                )}
              </Box>
            </VStack>

            <VStack space="md">
              {isEmailStep ? (
                <Pressable
                  className="h-14 rounded-[24px] items-center justify-center border"
                  style={{ backgroundColor: primaryColor, borderColor: `${primaryColor}40` }}
                  onPress={onRequestOtp}
                  disabled={isPending}
                >
                  {isPending ? (
                    <HStack space="sm" className="items-center">
                      <Spinner size="small" color="#fff" />
                      <Text className="text-xs font-extrabold uppercase tracking-widest text-white">
                        Sending OTP...
                      </Text>
                    </HStack>
                  ) : (
                    <Text className="text-xs font-extrabold uppercase tracking-widest text-white">
                      Send Code
                    </Text>
                  )}
                </Pressable>
              ) : (
                <HStack space="md">
                  <Pressable
                    className="flex-1 h-14 rounded-[24px] items-center justify-center border"
                    style={{ borderColor }}
                    onPress={onBackToEmail}
                    disabled={isPending}
                  >
                    <HStack space="xs" className="items-center">
                      <IconSymbol name="chevron.left" size={12} color={textColor} />
                      <Text className="text-xs font-extrabold uppercase tracking-widest" style={{ color: textColor }}>
                        Change Email
                      </Text>
                    </HStack>
                  </Pressable>
                  <Pressable
                    className="flex-1 h-14 rounded-[24px] items-center justify-center border"
                    style={{ backgroundColor: primaryColor, borderColor: `${primaryColor}40` }}
                    onPress={onConfirmOtp}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <HStack space="sm" className="items-center">
                        <Spinner size="small" color="#fff" />
                        <Text className="text-xs font-extrabold uppercase tracking-widest text-white">
                          Verifying...
                        </Text>
                      </HStack>
                    ) : (
                      <HStack space="xs" className="items-center">
                        <IconSymbol name="checkmark.circle.fill" size={14} color="#fff" />
                        <Text className="text-xs font-extrabold uppercase tracking-widest text-white">
                          Verify
                        </Text>
                      </HStack>
                    )}
                  </Pressable>
                </HStack>
              )}

              <Pressable
                className="h-14 rounded-[24px] items-center justify-center border-2 border-dashed"
                style={{ borderColor }}
                onPress={onClose}
                disabled={isPending}
              >
                <Text className="text-xs font-extrabold uppercase tracking-widest" style={{ color: dangerColor }}>
                  Cancel
                </Text>
              </Pressable>
            </VStack>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
