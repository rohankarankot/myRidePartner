import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Linking, Image, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function AboutScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const { width: screenWidth } = useWindowDimensions();

    const [githubProfile, setGithubProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('https://api.github.com/users/rohankarankot')
            .then(res => res.json())
            .then(data => {
                setGithubProfile(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const handleLink = (url: string) => {
        Linking.openURL(url);
    };

    const creatorAvatar = githubProfile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan';
    const creatorName = githubProfile?.name || 'Rohan Karankot';

    return (
        <ScrollView style={[styles.container, { backgroundColor }]}>
            <Stack.Screen options={{ title: 'About' }} />

            <View style={styles.content}>
                <View style={styles.headerSection}>
                    <View style={[styles.logoContainer, { backgroundColor: primaryColor }]}>
                        <IconSymbol name="car.fill" size={40} color="#fff" />
                    </View>
                    <Text style={[styles.appName, { color: textColor }]}>My Ride Partner</Text>
                    <Text style={[styles.appVersion, { color: subtextColor }]}>Version 1.0.0</Text>
                </View>



                <View style={[styles.card, { backgroundColor: cardColor, marginBottom: 16 }]}>
                    <Text style={[styles.sectionTitle, { color: subtextColor }]}>About Us</Text>
                    <Text style={[styles.infoText, { color: textColor, marginTop: 12 }]}>
                        My Ride Partner is a ridesharing platform designed and  developed to simplify daily commutes and reduce travel costs while fostering a trusted community.
                    </Text>
                    <Text style={[styles.infoText, { color: textColor, marginTop: 12 }]}>
                        Developed with a mission to connect people and solve urban transportation challenges, this app helps users find reliable ride partners within their city or community.
                    </Text>
                </View>
                <View style={[styles.card, { backgroundColor: cardColor, marginBottom: 16 }]}>
                    <Text style={[styles.sectionTitle, { color: subtextColor }]}>TECHNOLOGIES USED</Text>

                    <View style={styles.techStack}>
                        {['React Native', 'Expo', 'NestJS', 'Prisma', 'PostgreSQL', 'Next js', 'TypeScript', 'Zustand', 'Socket.io', 'Cloudinary'].map((tech) => (
                            <View key={tech} style={[styles.techChip, { backgroundColor: borderColor + '40', }]}>
                                <Text style={[styles.techChipText, { color: textColor }]}>{tech}</Text>
                            </View>
                        ))}
                    </View>

                </View>

                <View style={[styles.card, { backgroundColor: cardColor }]}>
                    <Text style={[styles.sectionTitle, { color: subtextColor, marginBottom: 16 }]}>Developer</Text>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color={primaryColor} />
                        </View>
                    ) : (
                        <>
                            {/* LinkedIn Badge */}
                            <TouchableOpacity
                                style={[styles.linkedinBadge, { width: screenWidth - 88 }]}
                                onPress={() => handleLink('https://linkedin.com/in/rohan-karankot/')}
                                activeOpacity={0.9}
                            >
                                <View style={styles.badgeHeader}>
                                    <View style={styles.linkedinLogo}>
                                        <Text style={styles.linkedinIn}>in</Text>
                                    </View>
                                    <Text style={styles.badgeLabel}>LinkedIn</Text>
                                </View>

                                <View style={styles.badgeBody}>
                                    <Image
                                        source={{ uri: creatorAvatar }}
                                        style={styles.badgeAvatar}
                                    />
                                    <View style={styles.badgeInfo}>
                                        <Text style={styles.badgeName}>{creatorName}</Text>
                                        <Text style={styles.badgeRole}>Senior Analyst @ Accenture</Text>
                                    </View>
                                </View>

                                <View style={styles.badgeFooter}>
                                    <Text style={styles.badgeButtonText}>View Profile</Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    )}
                </View>


                <View style={{ display: 'flex', alignItems: 'center', marginVertical: 34 }}>
                    <Text style={{ color: textColor, fontSize: 14 }}>🚩 An initiative by MH13 Community 🚩</Text>
                    <TouchableOpacity onPress={() => Linking.openURL('https://github.com/rohankarankot/myRidePartner')}>
                        <Text style={{ color: primaryColor, fontSize: 12, marginTop: 10, width: '100%', textAlign: 'center', textDecorationLine: 'underline' }}>Contributions are welcomed</Text>
                    </TouchableOpacity>
                    <Text style={[styles.copyright, { color: subtextColor }]}>
                        © 2026 My Ride Partner. All rights reserved.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,


    },
    loadingContainer: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerSection: {
        alignItems: 'center',
        marginVertical: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    appName: {
        fontSize: 24,
        fontWeight: '800',
    },
    appVersion: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500',
    },
    card: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    creatorRow: {
        alignItems: 'center',
        flexDirection: "column",
        marginBottom: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
    },
    creatorInfo: {
        marginLeft: 16,
    },
    creatorName: {
        fontSize: 18,
        fontWeight: '700',
    },
    creatorRole: {
        fontSize: 13,
        fontWeight: '500',
    },

    socialLinks: {
        flexDirection: 'row',
        gap: 10, width: "100%"
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    socialText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        marginVertical: 16,
        opacity: 0.5,
    },
    copyright: {
        fontSize: 12,
        textAlign: 'center',
        marginVertical: 20
    },
    linkedinBadge: {
        backgroundColor: '#0077B5',
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    badgeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    linkedinLogo: {
        backgroundColor: '#fff',
        width: 18,
        height: 18,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    githubLogo: {
        backgroundColor: '#333',
        width: 18,
        height: 18,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    linkedinIn: {
        color: '#0077B5',
        fontSize: 12,
        fontWeight: '900',
        lineHeight: 14,
    },
    badgeLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    badgeBody: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    badgeAvatar: {
        width: 48,
        height: 48,
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    badgeInfo: {
        flex: 1,
    },
    badgeName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    badgeRole: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
    },
    badgeFooter: {
        marginTop: 16,
        paddingTop: 12,
        alignItems: 'center',
        width: "100%",
        textAlign: "center"
    },
    badgeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    techStack: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 16,
        justifyContent: "center", alignItems: "center"
    },
    techChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    techChipText: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});
