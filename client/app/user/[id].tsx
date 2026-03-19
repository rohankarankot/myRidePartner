import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user-service';

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams();
    const userId = Number(id);
    const router = useRouter();

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');

    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data: profile, isLoading, error, refetch } = useQuery({
        queryKey: ['user-profile', userId],
        queryFn: () => userService.getUserProfile(userId),
        enabled: !isNaN(userId),
    });

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    }, [refetch]);

    const getAvatarUrl = () => {
        if (!profile?.avatar) return null;
        if (typeof profile.avatar === 'string') return profile.avatar;
        return profile.avatar.url;
    };

    const avatarUrl = getAvatarUrl();

    if (isLoading && !isRefreshing) {
        return (
            <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
                <Stack.Screen options={{ title: 'Profile', headerShown: true, headerStyle: { backgroundColor }, headerTintColor: textColor, headerShadowVisible: false, headerBackTitle: 'Back' }} />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={primaryColor} />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !profile) {
        return (
            <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
                <Stack.Screen options={{ title: 'Profile', headerShown: true, headerStyle: { backgroundColor }, headerTintColor: textColor, headerShadowVisible: false, headerBackTitle: 'Back' }} />
                <View style={styles.center}>
                    <IconSymbol name="person.fill" size={64} color={subtextColor} style={{ marginBottom: 16 }} />
                    <Text style={[styles.errorText, { color: textColor }]}>User profile not found.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: profile.fullName || 'User Profile',
                    headerShown: true,
                    headerTransparent: false,
                    headerStyle: { backgroundColor },
                    headerTintColor: textColor,
                    headerShadowVisible: false,
                    headerBackTitle: 'Back',
                }}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={primaryColor} />
                }
            >
                {/* Header Section */}
                <View style={[styles.headerCard, { backgroundColor: cardColor, borderColor }]}>
                    <View style={styles.avatarContainer}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: primaryColor }]}>
                                <Text style={styles.avatarPlaceholderText}>
                                    {(profile.fullName || '?').charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        {profile.isVerified && (
                            <View style={[styles.verifiedBadge, { backgroundColor: '#10B981', borderColor: cardColor }]}>
                                <IconSymbol name="checkmark" size={12} color="#fff" />
                            </View>
                        )}
                    </View>

                    <Text style={[styles.userName, { color: textColor }]}>{profile.fullName || 'Unknown User'}</Text>
                    <Text style={[styles.userHandle, { color: subtextColor }]}>Ride Leader</Text>

                    {/* Quick Stats */}
                    <View style={styles.statsRow}>
                        <TouchableOpacity 
                            style={styles.statItem}
                            onPress={() => router.push(`/ratings?userId=${userId}`)}
                        >
                            <View style={[styles.statIconContainer, { backgroundColor: `${primaryColor}15` }]}>
                                <IconSymbol name="star.fill" size={20} color="#F59E0B" />
                            </View>
                            <Text style={[styles.statValue, { color: textColor }]}>
                                {profile.rating ? Number(profile.rating).toFixed(1) : 'New'}
                            </Text>
                            <Text style={[styles.statLabel, { color: subtextColor }]}>Rating</Text>
                        </TouchableOpacity>
                        
                        <View style={styles.statDivider} />
                        
                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: `${primaryColor}15` }]}>
                                <IconSymbol name="car.fill" size={20} color={primaryColor} />
                            </View>
                            <Text style={[styles.statValue, { color: textColor }]}>
                                {profile.completedTripsCount || 0}
                            </Text>
                            <Text style={[styles.statLabel, { color: subtextColor }]}>Completed Rides</Text>
                        </View>

                        <View style={styles.statDivider} />
                        
                        <TouchableOpacity 
                            style={styles.statItem}
                            onPress={() => router.push(`/ratings?userId=${userId}`)}
                        >
                            <View style={[styles.statIconContainer, { backgroundColor: `${primaryColor}15` }]}>
                                <IconSymbol name="person.2.fill" size={20} color={primaryColor} />
                            </View>
                            <Text style={[styles.statValue, { color: textColor }]}>
                                {profile.ratingsCount || 0}
                            </Text>
                            <Text style={[styles.statLabel, { color: subtextColor }]}>Reviews</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info Section */}
                <Text style={[styles.sectionTitle, { color: subtextColor, marginTop: 24 }]}>ABOUT</Text>
                <View style={[styles.infoCard, { backgroundColor: cardColor }]}>
                    <View style={styles.infoRow}>
                        <View style={[styles.infoIcon, { backgroundColor: `${primaryColor}10` }]}>
                            <IconSymbol name="person.fill" size={20} color={primaryColor} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: subtextColor }]}>Gender</Text>
                            <Text style={[styles.infoValue, { color: textColor }]}>
                                {profile.gender === 'men' ? 'Male' : profile.gender === 'women' ? 'Female' : 'Not specified'}
                            </Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        fontWeight: '500',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    headerCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholderText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userHandle: {
        fontSize: 15,
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(150,150,150,0.1)',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(150,150,150,0.2)',
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 16,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    infoCard: {
        borderRadius: 16,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
    },
});
