import React from 'react';
import { RefreshControl, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ProfileSkeleton } from '@/features/profile/components/ProfileSkeleton';
import { CustomAlert } from '@/components/CustomAlert';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  ProfileAccountDetailsCard,
  ProfileActionsCard,
  ProfileEditorSheet,
  ProfileHeaderCard,
  ProfilePerformanceCard,
} from '@/features/profile/components/profile-tab';
import { useProfileScreen } from '@/features/profile/hooks/use-profile-screen';
import { getProfileAvatarUrl, maskAadhaarNumber } from '@/features/profile/utils/profile-screen';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FullScreenImageViewer } from '@/components/FullScreenImageViewer';

export default function ProfileScreen() {
  const {
    authUser,
    bottomSheetModalRef,
    borderBackdrop,
    city,
    citySearch,
    error,
    fieldErrors,
    fullName,
    gender,
    handleEditorSheetChange,
    handleEditorSheetDismiss,
    handlePickImage,
    handlePresentModalPress,
    handleRefresh,
    handleSubmit,
    handleVerifyNowClick,
    handlePickAadhaarImage,
    handleUploadAadhaar,
    isLoading,
    isPending,
    isRefreshing,
    isUploadingAvatar,
    isVerifyingGovernmentId,
    phoneNumber,
    profile,
    refetch,
    router,
    selectCity,
    setCitySearch,
    setFullName,
    setGender,
    setPhoneNumber,
    communityConsent,
    setCommunityConsent,
    setShowCityPicker,
    setShowConsentAlert,
    setShowSignOutModal,
    showVerificationAlert,
    setShowVerificationAlert,
    selectedAadhaarImageUri,
    setSelectedAadhaarImageUri,
    showCityPicker,
    showConsentAlert,
    handleConsentToggle,
    showSignOutModal,
    signOut,
    snapPoints,
  } = useProfileScreen();

  const [showFullImage, setShowFullImage] = React.useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const successBgColor = useThemeColor({}, 'successBg');
  const dangerColor = useThemeColor({}, 'danger');
  const dangerBgColor = useThemeColor({}, 'dangerBg');
  const borderColor = useThemeColor({}, 'border');

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error && !profile) {
    return (
      <Box className="flex-1 items-center justify-center px-10" style={{ backgroundColor }}>
        <VStack className="items-center" space="md">
          <Box className="w-20 h-20 rounded-full bg-gray-50 items-center justify-center mb-2">
            <IconSymbol name="person.crop.circle.badge.exclamationmark" size={40} color={subtextColor} />
          </Box>
          <Text className="text-xl font-extrabold text-center" style={{ color: textColor }}>
            Failed to load profile
          </Text>
          <Button className="rounded-full shadow-sm" onPress={() => refetch()}>
            <ButtonText className="font-extrabold uppercase tracking-widest px-4">Retry</ButtonText>
          </Button>
        </VStack>
      </Box>
    );
  }

  const user = profile?.user || authUser;
  const avatarUrl = getProfileAvatarUrl(profile?.avatar);
  const name = profile?.fullName || 'No Name Set';
  const phone = profile?.phoneNumber || 'N/A';
  const profileGender = profile?.gender;
  const aadhaarNumber = profile?.aadhaarNumber;
  const rating = profile?.rating || 0;
  const completedTripsCount = profile?.completedTripsCount || 0;
  const isVerified = profile?.isVerified || false;
  const isGovernmentIdVerified = profile?.governmentIdVerified || false;
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      >
        <ProfileHeaderCard
          avatarUrl={avatarUrl}
          cardColor={cardColor}
          dangerBgColor={dangerBgColor}
          dangerColor={dangerColor}
          email={user?.email}
          hasProfile={Boolean(profile)}
          initials={initials}
          isGovernmentIdVerified={isGovernmentIdVerified}
          isUploadingAvatar={isUploadingAvatar}
          isVerified={isVerified}
          isVerifyingGovernmentId={isVerifyingGovernmentId}
          name={name}
          onCompleteProfile={handlePresentModalPress}
          onPickImage={handlePickImage}
          onViewImage={() => setShowFullImage(true)}
          onVerifyNow={handleVerifyNowClick}
          primaryColor={primaryColor}
          profileCity={profile?.city}
          successBgColor={successBgColor}
          successColor={successColor}
          subtextColor={subtextColor}
          textColor={textColor}
        />

        <ProfilePerformanceCard
          borderColor={borderColor}
          cardColor={cardColor}
          completedTripsCount={completedTripsCount}
          onOpenAnalytics={() => router.push('/profile-analytics')}
          onOpenCompletedTrips={() => router.push({ pathname: '/my-activity', params: { tab: 'completed' } })}
          onOpenRatings={() => router.push('/ratings')}
          primaryColor={primaryColor}
          rating={rating}
          subtextColor={subtextColor}
          textColor={textColor}
        />

        <ProfileAccountDetailsCard
          aadhaarNumber={aadhaarNumber ? maskAadhaarNumber(aadhaarNumber) : null}
          cardColor={cardColor}
          gender={profileGender}
          phone={phone}
          subtextColor={subtextColor}
          successColor={successColor}
          textColor={textColor}
          username={user?.username}
        />

        <ProfileActionsCard
          borderColor={borderColor}
          cardColor={cardColor}
          dangerColor={dangerColor}
          hasProfile={Boolean(profile)}
          onEditProfile={handlePresentModalPress}
          onNotifications={() => router.push('/notifications')}
          onSignOut={() => setShowSignOutModal(true)}
          primaryColor={primaryColor}
          subtextColor={subtextColor}
          textColor={textColor}
        />

        <VStack className="items-center py-12" space="xs">
          <Divider className="w-12 mb-4" style={{ backgroundColor: borderColor }} />
          <Text className="text-[8px] font-extrabold uppercase tracking-widest text-center" style={{ color: subtextColor }}>
            Joining since 2026 • My Ride Partner Community
          </Text>
        </VStack>
      </ScrollView>

      <CustomAlert
        visible={showConsentAlert}
        title="Community 30-Day Policy"
        message="Opting out starts a 30-day grace period. After 30 days, all your messages and groups will be permanently deleted as per our community privacy policy. Opt back in anytime within 30 days to restore everything."
        icon="person.2.slash.fill"
        onClose={() => setShowConsentAlert(false)}
        primaryButton={{
          text: 'Restore Later',
          onPress: () => {
            setShowConsentAlert(false);
            // We keep it true or just close
          },
        }}
        secondaryButton={{
          text: 'Opt Out',
          onPress: () => {
            setShowConsentAlert(false);
            setCommunityConsent(false);
          },
        }}
      />

      <CustomAlert
        visible={showSignOutModal}
        title="Sign Out?"
        message="You'll need to log back in to access your account."
        icon="rectangle.portrait.and.arrow.right"
        onClose={() => setShowSignOutModal(false)}
        primaryButton={{
          text: 'Sign Out',
          onPress: () => {
            setShowSignOutModal(false);
            signOut();
          },
        }}
        secondaryButton={{
          text: 'Cancel',
          onPress: () => setShowSignOutModal(false),
        }}
      />

      <CustomAlert
        visible={showVerificationAlert}
        title="Verify Identity"
        message={
          selectedAadhaarImageUri 
            ? "Review the image below. Make sure your name and Aadhaar number are clearly visible before submitting."
            : "Please choose a clear Aadhaar image from your files. Ensure your name and the 12-digit Aadhaar number are clearly visible so that we can match your profile information."
        }
        icon="person.text.rectangle"
        onClose={() => {
          setShowVerificationAlert(false);
          setSelectedAadhaarImageUri(null);
        }}
        loading={isVerifyingGovernmentId}
        disabled={isVerifyingGovernmentId}
        primaryButton={
          selectedAadhaarImageUri
            ? {
                text: 'Verify Now',
                onPress: () => handleUploadAadhaar(selectedAadhaarImageUri),
              }
            : {
                text: 'Choose Image',
                onPress: handlePickAadhaarImage,
              }
        }
        secondaryButton={
          selectedAadhaarImageUri
            ? {
                text: 'Retake',
                onPress: handlePickAadhaarImage,
              }
            : {
                text: 'Cancel',
                onPress: () => {
                  setShowVerificationAlert(false);
                  setSelectedAadhaarImageUri(null);
                },
              }
        }
      >
        {selectedAadhaarImageUri ? (
          <Box className="w-full items-center">
            <Image
              source={{ uri: selectedAadhaarImageUri }}
              style={{ width: 320, height: 200, borderRadius: 16 }}
              resizeMode="contain"
            />
          </Box>
        ) : null}
      </CustomAlert>

      <ProfileEditorSheet
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        bottomSheetModalRef={bottomSheetModalRef}
        cardColor={cardColor}
        city={city}
        citySearch={citySearch}
        dangerColor={dangerColor}
        fieldErrors={fieldErrors}
        fullName={fullName}
        gender={gender}
        isPending={isPending}
        onBackdrop={borderBackdrop}
        onChange={handleEditorSheetChange}
        onClose={() => bottomSheetModalRef.current?.dismiss()}
        onSheetDismiss={handleEditorSheetDismiss}
        onSelectCity={selectCity}
        onSubmit={handleSubmit}
        phoneNumber={phoneNumber}
        primaryColor={primaryColor}
        profileExists={Boolean(profile)}
        setCitySearch={setCitySearch}
        setFullName={setFullName}
        setGender={setGender}
        setPhoneNumber={setPhoneNumber}
        setShowCityPicker={setShowCityPicker}
        showCityPicker={showCityPicker}
        snapPoints={snapPoints}
        subtextColor={subtextColor}
        textColor={textColor}
        communityConsent={communityConsent}
        onConsentToggle={handleConsentToggle}
      />

      <FullScreenImageViewer
        isVisible={showFullImage}
        imageUrl={avatarUrl}
        onClose={() => setShowFullImage(false)}
      />
    </SafeAreaView>
  );
}
