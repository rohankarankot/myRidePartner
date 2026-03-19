import React, { useState, useCallback, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Modal,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useAuth } from '@/context/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter, Stack } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user-service';
import Toast from 'react-native-toast-message';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetBackdrop,
    BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/theme';

const DUMMY_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';

export default function ProfileScreen() {
    const { user: authUser, signOut } = useAuth();
    const { profile: storedProfile, isLoading: isStoreLoading, setProfile } = useUserStore();
    const { data: profileData, isLoading: isQueryLoading, error, refetch } = useUserProfile();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    }, [refetch]);

    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState<'men' | 'women'>('men');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [showSignOutModal, setShowSignOutModal] = useState(false);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = ['80%'];



    const profile = storedProfile || profileData;
    const isLoading = isStoreLoading || (isQueryLoading && !storedProfile && !error);
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

    const createProfileMutation = useMutation({
        mutationFn: (data: { fullName: string; phoneNumber: string; gender: 'men' | 'women'; userId: number }) =>
            userService.createProfile(data),
        onSuccess: (data) => {
            setProfile(data);
            queryClient.invalidateQueries({ queryKey: ['user-profile', authUser?.id] });
            refetch();
            bottomSheetModalRef.current?.dismiss();
            Toast.show({
                type: 'success',
                text1: 'Profile Created',
                text2: 'Your profile has been successfully set up!'
            });
        },
        onError: (error) => {
            console.error('Create profile error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to create profile. Please try again.'
            });
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data: { documentId: string; fullName: string; phoneNumber: string; gender: 'men' | 'women'; avatar?: string }) =>
            userService.updateProfile(data.documentId, {
                fullName: data.fullName,
                phoneNumber: data.phoneNumber,
                gender: data.gender,
                avatar: data.avatar,
            }),
        onSuccess: (data) => {
            setProfile(data);
            queryClient.invalidateQueries({ queryKey: ['user-profile', authUser?.id] });
            refetch();
            bottomSheetModalRef.current?.dismiss();
            Toast.show({
                type: 'success',
                text1: 'Profile Updated',
                text2: 'Your profile has been successfully updated!'
            });
        },
        onError: (error) => {
            console.error('Update profile error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update profile. Please try again.'
            });
        }
    });

    const handlePickImage = async () => {
        if (!profile) {
            Toast.show({
                type: 'info',
                text1: 'Complete Profile First',
                text2: 'Please complete your profile before adding an avatar.'
            });
            handlePresentModalPress();
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            uploadAvatar(result.assets[0].uri);
        }
    };

    const uploadAvatar = async (uri: string) => {
        setIsUploadingAvatar(true);
        try {
            const fileId = await userService.uploadFile(uri);
            updateProfileMutation.mutate({
                documentId: profile!.documentId,
                fullName: profile!.fullName,
                phoneNumber: profile!.phoneNumber,
                gender: profile!.gender!,
                avatar: fileId,
            });
        } catch (error) {
            console.error('Upload avatar error:', error);
            Toast.show({
                type: 'error',
                text1: 'Upload Error',
                text2: 'Failed to upload image. Please try again.'
            });
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handlePresentModalPress = useCallback(() => {
        if (profile) {
            setFullName(profile.fullName || '');
            setPhoneNumber(profile.phoneNumber || '');
            setGender(profile.gender || 'men');
        } else {
            setFullName('');
            setPhoneNumber('');
            setGender('men');
        }
        bottomSheetModalRef.current?.present();
    }, [profile]);

    const handleSubmit = () => {
        if (!fullName.trim() || !phoneNumber.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Required Fields',
                text2: 'Please enter both your name and phone number.'
            });
            return;
        }

        if (profile) {
            updateProfileMutation.mutate({
                documentId: profile.documentId,
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                gender,
            });
        } else if (authUser) {
            createProfileMutation.mutate({
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                gender,
                userId: authUser.id,
            });
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor }]}>
                <ActivityIndicator size="large" color={primaryColor} />
            </View>
        );
    }

    if (error && !profile) {
        return (
            <View style={[styles.errorContainer, { backgroundColor }]}>
                <Text style={[styles.errorText, { color: dangerColor }]}>Failed to load profile</Text>
                <TouchableOpacity style={[styles.retryButton, { backgroundColor: primaryColor }]} onPress={() => refetch()}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // fallback info if profile doesn't exist
    const user = profile?.user || authUser;
    const avatarUrl = typeof profile?.avatar === 'string'
        ? profile.avatar
        : profile?.avatar?.url || profile?.avatar?.formats?.small?.url;
    const name = profile?.fullName || 'No Name Set';
    const phone = profile?.phoneNumber || 'N/A';
    const profileGender = profile?.gender;
    const rating = profile?.rating || 0;
    const completedTripsCount = profile?.completedTripsCount || 0;
    const isVerified = profile?.isVerified || false;

    const handleVerifyNow = () => {
        Alert.alert(
            'Verification Strategy',
            'I am thinking to use either PAN or Aadhar for verification. Will check in next phase...',
            [
                {
                    text: 'OK',
                    style: 'cancel',
                },

            ]
        );
    };

    const isPending = createProfileMutation.isPending || updateProfileMutation.isPending;
    const colorScheme = useColorScheme();

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: 'Profile',
                    headerShown: true,
                    headerTransparent: false,
                    headerStyle: { backgroundColor: cardColor },
                    headerTintColor: textColor,
                    headerShadowVisible: false,

                    headerRight: () =>
                        profile ? (
                            <TouchableOpacity
                                style={{ marginRight: 16 }}
                                onPress={() => router.push('/settings')}
                            >
                                <IconSymbol name="gearshape.fill" size={24} color={primaryColor} />
                            </TouchableOpacity>
                        ) : null,
                }}
            />
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={primaryColor}
                        colors={[primaryColor]}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>

                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={handlePickImage}
                        disabled={isUploadingAvatar}
                    >
                        <Image
                            source={
                                avatarUrl
                                    ? { uri: avatarUrl }
                                    : { uri: DUMMY_AVATAR }
                            }
                            style={styles.avatar}
                        />
                        {isUploadingAvatar ? (
                            <View style={styles.avatarOverlay}>
                                <ActivityIndicator color="#fff" size="small" />
                            </View>
                        ) : (
                            <View style={[styles.avatarEditIcon, { backgroundColor: primaryColor }]}>
                                <IconSymbol name="camera.fill" size={14} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={[styles.name, { color: textColor }]}>{name}</Text>
                    <Text style={[styles.email, { color: subtextColor }]}>{user?.email}</Text>

                    {!profile ? (
                        <TouchableOpacity
                            style={[styles.completePrompt, { backgroundColor: `${primaryColor}15` }]}
                            onPress={handlePresentModalPress}
                        >
                            <Text style={[styles.completePromptText, { color: primaryColor }]}>Complete your profile →</Text>
                        </TouchableOpacity>
                    ) : isVerified ? (
                        <View style={[styles.verifiedBadge, { backgroundColor: successBgColor }]}>
                            <Text style={[styles.verifiedText, { color: successColor }]}>Verified</Text>
                        </View>
                    ) : (
                        <>
                            <View style={[styles.unverifiedBadge, { backgroundColor: dangerBgColor }]}>
                                <Text style={[styles.unverifiedText, { color: dangerColor }]}>Unverified</Text>
                            </View>
                            <TouchableOpacity onPress={handleVerifyNow}>
                                <Text style={[styles.verifyNowText, { color: primaryColor }]}>Verify now?</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Stats Card */}
                <View style={[styles.card, { backgroundColor: cardColor }]}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>Statistics</Text>

                    <View style={styles.row}>
                        <View style={styles.labelRow}>
                            <IconSymbol name="star.fill" size={14} color="#F59E0B" />
                            <Text style={[styles.label, { color: subtextColor }]}>Rating</Text>
                        </View>
                        <Text style={[styles.value, { color: textColor }]}>{Number(rating).toFixed(1)}</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.labelRow}>
                            <IconSymbol name="flag.checkered" size={14} color={primaryColor} />
                            <Text style={[styles.label, { color: subtextColor }]}>Completed Trips</Text>
                        </View>
                        <Text style={[styles.value, { color: textColor }]}>{completedTripsCount}</Text>
                    </View>
                </View>

                {/* Account Info Card */}
                <View style={[styles.card, { backgroundColor: cardColor }]}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>Account Information</Text>

                    <View style={styles.row}>
                        <View style={styles.labelRow}>
                            <IconSymbol name="at" size={14} color={subtextColor} />
                            <Text style={[styles.label, { color: subtextColor }]}>Username</Text>
                        </View>
                        <Text style={[styles.value, { color: textColor }]}>{user?.username}</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.labelRow}>
                            <IconSymbol name="phone.fill" size={14} color={subtextColor} />
                            <Text style={[styles.label, { color: subtextColor }]}>Phone</Text>
                        </View>
                        <Text style={[styles.value, { color: textColor }]}>{phone}</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.labelRow}>
                            <IconSymbol name="person.fill" size={14} color={subtextColor} />
                            <Text style={[styles.label, { color: subtextColor }]}>Gender</Text>
                        </View>
                        <Text style={[styles.value, { color: textColor }]}>
                            {profileGender ? (profileGender === 'men' ? 'Male' : 'Female') : 'N/A'}
                        </Text>
                    </View>

                    <View style={[styles.row, { marginBottom: 0 }]}>
                        <View style={styles.labelRow}>
                            <IconSymbol name="envelope.fill" size={14} color={subtextColor} />
                            <Text style={[styles.label, { color: subtextColor }]}>Email</Text>
                        </View>
                        <Text style={[styles.value, { color: textColor }]}>{user?.email}</Text>
                    </View>
                </View>

                {/* Actions Card */}
                <View style={[styles.card, { backgroundColor: cardColor }]}>
                    <TouchableOpacity
                        style={styles.actionRow}
                        onPress={handlePresentModalPress}
                        activeOpacity={0.6}
                    >
                        <View style={styles.actionLeft}>
                            <View style={[styles.actionIcon, { backgroundColor: `${primaryColor}15` }]}>
                                <IconSymbol name="pencil" size={16} color={primaryColor} />
                            </View>
                            <Text style={[styles.actionLabel, { color: textColor }]}>
                                {!profile ? 'Complete Profile' : 'Edit Profile'}
                            </Text>
                        </View>
                        <IconSymbol name="chevron.right" size={16} color={subtextColor} />
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    <TouchableOpacity
                        style={styles.actionRow}
                        onPress={() => setShowSignOutModal(true)}
                        activeOpacity={0.6}
                    >
                        <View style={styles.actionLeft}>
                            <View style={[styles.actionIcon, { backgroundColor: `${dangerColor}15` }]}>
                                <IconSymbol name="rectangle.portrait.and.arrow.right" size={16} color={dangerColor} />
                            </View>
                            <Text style={[styles.actionLabel, { color: dangerColor }]}>Sign Out</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={16} color={subtextColor} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Sign Out Confirmation Modal */}
            <Modal
                visible={showSignOutModal}
                transparent={true}
                statusBarTranslucent={true}
                animationType="fade"
                onRequestClose={() => setShowSignOutModal(false)}
            >
                <View style={styles.signOutOverlay}>
                    <View style={[styles.signOutModal, { backgroundColor: cardColor }]}>
                        <View style={[styles.signOutIconWrap, { backgroundColor: `${dangerColor}12` }]}>
                            <IconSymbol name="rectangle.portrait.and.arrow.right" size={28} color={dangerColor} />
                        </View>
                        <Text style={[styles.signOutTitle, { color: textColor }]}>Sign Out?</Text>
                        <Text style={[styles.signOutSubtitle, { color: subtextColor }]}>
                            You'll need to log back in to access your account.
                        </Text>
                        <View style={styles.signOutActions}>
                            <TouchableOpacity
                                style={[styles.signOutBtn, { borderColor, borderWidth: 1.5 }]}
                                onPress={() => setShowSignOutModal(false)}
                            >
                                <Text style={[styles.signOutBtnText, { color: textColor }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.signOutBtn, { backgroundColor: dangerColor }]}
                                onPress={() => { setShowSignOutModal(false); signOut(); }}
                            >
                                <Text style={[styles.signOutBtnText, { color: '#fff' }]}>Sign Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Complete Profile Bottom Sheet */}

            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={0}
                snapPoints={snapPoints}
                backdropComponent={(props) => (
                    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
                )}
                backgroundStyle={{ backgroundColor: cardColor }}
                handleIndicatorStyle={{ backgroundColor: borderColor }}
                keyboardBehavior="fillParent"
                keyboardBlurBehavior="restore"
            >
                <BottomSheetView style={styles.modalContent}>
                    <View style={styles.modalHeaderRow}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>
                            {profile ? 'Edit Profile' : 'Complete Profile'}
                        </Text>
                        <TouchableOpacity onPress={() => bottomSheetModalRef.current?.dismiss()}>
                            <IconSymbol name="xmark" size={20} color={subtextColor} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.modalLabel, { color: subtextColor }]}>FULL NAME</Text>
                    <BottomSheetTextInput
                        style={[styles.input, { color: textColor, borderColor }]}
                        placeholder="John Doe"
                        placeholderTextColor={subtextColor}
                        value={fullName}
                        onChangeText={setFullName}
                    />

                    <Text style={[styles.modalLabel, { color: subtextColor, marginTop: 16 }]}>PHONE NUMBER</Text>
                    <BottomSheetTextInput
                        style={[styles.input, { color: textColor, borderColor }]}
                        placeholder="+91 9876543210"
                        placeholderTextColor={subtextColor}
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                    />

                    <Text style={[styles.modalLabel, { color: subtextColor, marginTop: 16 }]}>GENDER</Text>
                    <View style={styles.genderRow}>
                        <TouchableOpacity
                            style={[
                                styles.genderButton,
                                { borderColor: borderColor },
                                gender === 'men' && { backgroundColor: primaryColor, borderColor: primaryColor }
                            ]}
                            onPress={() => setGender('men')}
                        >
                            <Text style={[styles.genderButtonText, gender === 'men' ? { color: '#fff' } : { color: textColor }]}>Male</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.genderButton,
                                { borderColor: borderColor },
                                gender === 'women' && { backgroundColor: primaryColor, borderColor: primaryColor }
                            ]}
                            onPress={() => setGender('women')}
                        >
                            <Text style={[styles.genderButtonText, gender === 'women' ? { color: '#fff' } : { color: textColor }]}>Female</Text>
                        </TouchableOpacity>
                    </View>



                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: primaryColor }]}
                        onPress={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.saveButtonText}>
                                {profile ? 'Update Profile' : 'Save Profile'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheetModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginBottom: 16,
        fontSize: 16,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        fontWeight: '600',
        color: '#fff',
    },
    container: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    avatarOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarEditIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
    },
    email: {
        fontSize: 14,
        marginTop: 4,
    },
    verifiedBadge: {
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '600',
    },
    card: {
        borderRadius: 14,
        padding: 16,
        marginBottom: 18,
        // Using light opacity for shadow to work on both modes
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
    },
    primaryButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '600',
    },
    headerEditBtn: {
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginVertical: 4,
    },
    unverifiedBadge: {
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    unverifiedText: {
        fontSize: 12,
        fontWeight: '600',
    },
    verifyNowText: {
        paddingTop: 8,
        fontSize: 12,
        fontWeight: '600',
    },

    completePrompt: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    completePromptText: {
        fontSize: 14,
        fontWeight: '600',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        padding: 24,
        paddingBottom: 40,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    modalLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 1,
    },
    input: {
        height: 56,
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    saveButton: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    genderRow: {
        flexDirection: 'row',
        gap: 12,
    },
    genderButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    genderButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    signOutOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    signOutModal: {
        width: '100%',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
    },
    signOutIconWrap: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    signOutTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    signOutSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 28,
    },
    signOutActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    signOutBtn: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signOutBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
});