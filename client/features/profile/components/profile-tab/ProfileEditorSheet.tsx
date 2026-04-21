import React from 'react';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { ScrollView } from 'react-native';
import { CITIES } from '@/constants/cities';
import { FormField as FormFieldTokens } from '@/constants/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type ProfileEditorSheetProps = {
  backgroundColor: string;
  borderColor: string;
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
  cardColor: string;
  city: string;
  citySearch: string;
  dangerColor: string;
  fieldErrors: {
    fullName?: string;
    phoneNumber?: string;
    city?: string;
  };
  fullName: string;
  gender: 'men' | 'women';
  isPending: boolean;
  onBackdrop: (props: any) => React.ReactNode;
  onChange?: (index: number) => void;
  onClose: () => void;
  onSheetDismiss?: () => void;
  onSelectCity: (city: string) => void;
  onSubmit: () => void;
  phoneNumber: string;
  primaryColor: string;
  profileExists: boolean;
  setCitySearch: (value: string) => void;
  setFullName: (value: string) => void;
  setGender: (value: 'men' | 'women') => void;
  setPhoneNumber: (value: string) => void;
  setShowCityPicker: (value: boolean) => void;
  showCityPicker: boolean;
  snapPoints: string[];
  communityConsent: boolean;
  onConsentToggle: () => void;
  subtextColor: string;
  textColor: string;
};

export function ProfileEditorSheet({
  backgroundColor,
  borderColor,
  bottomSheetModalRef,
  cardColor,
  city,
  citySearch,
  dangerColor,
  fieldErrors,
  fullName,
  gender,
  isPending,
  onBackdrop,
  onChange,
  onClose,
  onSheetDismiss,
  onSelectCity,
  onSubmit,
  phoneNumber,
  primaryColor,
  profileExists,
  setCitySearch,
  setFullName,
  setGender,
  setPhoneNumber,
  setShowCityPicker,
  showCityPicker,
  snapPoints,
  subtextColor,
  textColor,
  communityConsent,
  onConsentToggle,
}: ProfileEditorSheetProps) {
  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={onBackdrop as any}
      backgroundStyle={{ backgroundColor: cardColor }}
      handleIndicatorStyle={{ backgroundColor: borderColor }}
      keyboardBehavior="fillParent"
      keyboardBlurBehavior="restore"
      onChange={onChange}
      onDismiss={onSheetDismiss}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <HStack className="justify-between items-center mb-10">
          <Text className="text-2xl font-extrabold" style={{ color: textColor }}>
            {profileExists ? 'Edit Profile' : 'Complete Profile'}
          </Text>
          <Pressable className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center shadow-sm" onPress={onClose}>
            <IconSymbol name="xmark" size={16} color={subtextColor} />
          </Pressable>
        </HStack>

        <VStack space="xl">
          <VStack space="xs">
            <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>Full Name</Text>
            <BottomSheetTextInput
              style={{ height: FormFieldTokens.height, borderWidth: 2, borderRadius: FormFieldTokens.radius, paddingHorizontal: FormFieldTokens.horizontalPadding, fontSize: FormFieldTokens.fontSize, color: textColor, borderColor: fieldErrors.fullName ? dangerColor : borderColor, backgroundColor }}
              placeholder="Enter your legal name"
              placeholderTextColor={subtextColor}
              value={fullName}
              onChangeText={setFullName}
            />
            {fieldErrors.fullName ? (
              <Text className="text-xs font-medium ml-1" style={{ color: dangerColor }}>
                {fieldErrors.fullName}
              </Text>
            ) : null}
          </VStack>

          <VStack space="xs">
            <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>Phone Number</Text>
            <BottomSheetTextInput
              style={{ height: FormFieldTokens.height, borderWidth: 2, borderRadius: FormFieldTokens.radius, paddingHorizontal: FormFieldTokens.horizontalPadding, fontSize: FormFieldTokens.fontSize, color: textColor, borderColor: fieldErrors.phoneNumber ? dangerColor : borderColor, backgroundColor }}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor={subtextColor}
              keyboardType="number-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            {fieldErrors.phoneNumber ? (
              <Text className="text-xs font-medium ml-1" style={{ color: dangerColor }}>
                {fieldErrors.phoneNumber}
              </Text>
            ) : null}
          </VStack>

          <VStack space="xs">
            <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>Gender</Text>
            <HStack space="md">
              <Pressable
                className="flex-1 h-14 rounded-2xl items-center justify-center border-2 shadow-sm"
                style={{
                  borderColor: gender === 'men' ? primaryColor : borderColor,
                  backgroundColor: gender === 'men' ? primaryColor : `${subtextColor}05`,
                }}
                onPress={() => setGender('men')}
              >
                <Text className="text-xs font-extrabold uppercase tracking-widest" style={{ color: gender === 'men' ? '#fff' : textColor }}>Male</Text>
              </Pressable>
              <Pressable
                className="flex-1 h-14 rounded-2xl items-center justify-center border-2 shadow-sm"
                style={{
                  borderColor: gender === 'women' ? primaryColor : borderColor,
                  backgroundColor: gender === 'women' ? primaryColor : `${subtextColor}05`,
                }}
                onPress={() => setGender('women')}
              >
                <Text className="text-xs font-extrabold uppercase tracking-widest" style={{ color: gender === 'women' ? '#fff' : textColor }}>Female</Text>
              </Pressable>
            </HStack>
          </VStack>

          <VStack space="xs">
            <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>Preferred City</Text>
            <Pressable
              className="h-14 border-2 rounded-[24px] px-4 flex-row items-center justify-between"
              style={{ borderColor: fieldErrors.city ? dangerColor : borderColor, backgroundColor }}
              onPress={() => setShowCityPicker(!showCityPicker)}
            >
              <Text style={{ color: city ? textColor : subtextColor }} className="text-base font-medium">
                {city || 'Select your community city'}
              </Text>
              <IconSymbol name="chevron.down" size={16} color={subtextColor} />
            </Pressable>
            {fieldErrors.city ? (
              <Text className="text-xs font-medium ml-1" style={{ color: dangerColor }}>
                {fieldErrors.city}
              </Text>
            ) : null}

            {showCityPicker ? (
              <Box className="mt-2 rounded-[24px] border-2 p-3 shadow-sm" style={{ backgroundColor: `${subtextColor}05`, borderColor: `${borderColor}50` }}>
                <BottomSheetTextInput
                  style={{ height: FormFieldTokens.height, borderWidth: 2, borderRadius: FormFieldTokens.radius, paddingHorizontal: FormFieldTokens.horizontalPadding, fontSize: FormFieldTokens.fontSize, color: textColor, borderColor: `${borderColor}60`, backgroundColor, marginBottom: 12 }}
                  placeholder="Type city name..."
                  placeholderTextColor={subtextColor}
                  value={citySearch}
                  onChangeText={setCitySearch}
                />
                <ScrollView nestedScrollEnabled className="max-h-[200px]">
                  {CITIES.filter((entry) =>
                    entry.toLowerCase().includes(citySearch.toLowerCase())
                  ).map((entry) => (
                    <Pressable
                      key={entry}
                      className="py-3 px-4 rounded-xl flex-row justify-between items-center mb-1"
                      style={{ backgroundColor: city === entry ? `${primaryColor}15` : 'transparent' }}
                      onPress={() => onSelectCity(entry)}
                    >
                      <Text className="text-sm font-bold" style={{ color: city === entry ? primaryColor : textColor }}>{entry}</Text>
                      {city === entry ? <IconSymbol name="checkmark" size={14} color={primaryColor} /> : null}
                    </Pressable>
                  ))}
                </ScrollView>
              </Box>
            ) : null}
          </VStack>

          <VStack space="xs" className="mt-2">
            <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>Community Access</Text>
            <Pressable
              onPress={onConsentToggle}
              className="h-16 rounded-[24px] px-5 border-2 flex-row items-center justify-between shadow-sm"
              style={{
                borderColor: communityConsent ? primaryColor : borderColor,
                backgroundColor: communityConsent ? `${primaryColor}05` : backgroundColor
              }}
            >
              <HStack space="md" className="items-center">
                <Box
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: communityConsent ? `${primaryColor}10` : `${subtextColor}10` }}
                >
                  <IconSymbol
                    name={communityConsent ? 'person.2.fill' : 'person.2'}
                    size={20}
                    color={communityConsent ? primaryColor : subtextColor}
                  />
                </Box>
                <VStack>
                  <Text className="text-sm font-extrabold" style={{ color: communityConsent ? primaryColor : textColor }}>
                    {communityConsent ? 'Active Member' : 'Opt-In to Community'}
                  </Text>
                  <Text className="text-[10px] font-medium" style={{ color: subtextColor }}>
                    {communityConsent ? 'You are visible in the community' : 'Join to find ride partners'}
                  </Text>
                </VStack>
              </HStack>
              <IconSymbol
                name={communityConsent ? 'checkmark.circle.fill' : 'circle'}
                size={22}
                color={communityConsent ? primaryColor : borderColor}
              />
            </Pressable>
          </VStack>

          <Button
            className="h-16 rounded-[24px] mt-6 shadow-lg"
            style={{ backgroundColor: primaryColor }}
            onPress={onSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <Spinner color="#fff" size="small" />
            ) : (
              <ButtonText className="text-white font-extrabold uppercase tracking-widest">
                {profileExists ? 'Update Profile' : 'Save & Continue'}
              </ButtonText>
            )}
          </Button>
        </VStack>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
