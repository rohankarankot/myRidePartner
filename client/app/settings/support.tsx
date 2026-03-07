import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HelpSupportScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');

    const handleEmailSupport = () => {
        Linking.openURL('mailto:rohan.alwayscodes@gmail.com');
    };

    const FaqItem = ({ question, answer }: { question: string, answer: string }) => (
        <View style={[styles.faqItem, { borderBottomColor: borderColor }]}>
            <Text style={[styles.faqQuestion, { color: textColor }]}>{question}</Text>
            <Text style={[styles.faqAnswer, { color: subtextColor }]}>{answer}</Text>
        </View>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor }]}>
            <Stack.Screen options={{ title: 'Help & Support' }} />
            <View style={styles.content}>

                <Text style={[styles.sectionTitle, { color: subtextColor }]}>Contact Us</Text>
                <View style={[styles.card, { backgroundColor: cardColor }]}>
                    <TouchableOpacity style={styles.contactRow} onPress={handleEmailSupport} activeOpacity={0.7}>
                        <View style={[styles.iconWrap, { backgroundColor: primaryColor + '15' }]}>
                            <IconSymbol name="envelope.fill" size={20} color={primaryColor} />
                        </View>
                        <View style={styles.contactTextWrap}>
                            <Text style={[styles.contactTitle, { color: textColor }]}>Email Support</Text>
                            <Text style={[styles.contactSubtitle, { color: subtextColor }]}>rohan.alwayscodes@gmail.com</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color={subtextColor} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, { color: subtextColor }]}>Frequently Asked Questions</Text>
                <View style={[styles.card, { backgroundColor: cardColor, padding: 0 }]}>
                    <FaqItem
                        question="How do I create a ride?"
                        answer="Tap the 'Create' tab at the bottom of the screen, fill in your trip details, vehicle info, and price, then hit publish."
                    />
                    <FaqItem
                        question="How do I join a ride?"
                        answer="Find a suitable ride on the 'Find' or 'Explore' page, tap to view details, and hit the 'Request to Join' button."
                    />
                    <FaqItem
                        question="How are prices determined?"
                        answer="Drivers set the price per seat based on the distance and travel costs to ensure a fair split among riders."
                    />
                    <FaqItem
                        question="Can I cancel a request?"
                        answer="Yes, you can cancel a pending or approved join request from the trip details page before the trip starts."
                    />
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
        padding: 16,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginTop: 24,
        marginBottom: 8,
        marginLeft: 8,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        overflow: 'hidden',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    contactTextWrap: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    contactSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    faqItem: {
        padding: 16,
        borderBottomWidth: 1,
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    faqAnswer: {
        fontSize: 14,
        lineHeight: 20,
    }
});
