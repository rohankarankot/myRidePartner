import React, { useState, useCallback, useRef } from 'react';
import {
    StyleSheet, View, Text, Modal, TouchableOpacity,
    TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from './ui/icon-symbol';

interface LocationSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectLocation: (address: string) => void;
    title: string;
}

export function LocationSearchModal({ visible, onClose, onSelectLocation, title }: LocationSearchModalProps) {
    const [query, setQuery] = useState('');

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');
    const subtextColor = useThemeColor({}, 'subtext');

    const fetchSuggestions = (text: string) => {
        setQuery(text);
    };

    const handleConfirm = () => {
        if (query.trim()) {
            onSelectLocation(query);
            setQuery('');
            onClose();
        }
    };

    const handleClose = () => {
        setQuery('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
            <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <IconSymbol name="xmark" size={22} color={textColor} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                    <View style={{ width: 30 }} />
                </View>
                <View style={{
                    padding: 16, paddingTop: 0, paddingBottom: 8,
                    height: 180,
                    backgroundColor: '#5f5f5fff',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                }}>
                    <Text style={[styles.title, { color: textColor, fontStyle: "italic" }]}>placeholder for map integration</Text>
                    <Text style={[styles.title, { color: textColor, fontStyle: "italic", fontSize: 15 }]}>(I dont have API key)</Text>

                </View>
                {/* Search Box */}
                <View style={[styles.searchBox, { backgroundColor: cardColor, borderColor }]}>
                    <IconSymbol name="magnifyingglass" size={18} color={subtextColor} />
                    <TextInput
                        style={[styles.input, { color: textColor }]}
                        placeholder="Search area, landmark, city..."
                        placeholderTextColor={subtextColor}
                        value={query}
                        onChangeText={fetchSuggestions}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity
                            onPress={() => { setQuery(''); }}
                            style={styles.clearInputButton}
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        >
                            <View style={styles.clearIconCircle}>
                                <IconSymbol name="xmark" size={14} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Confirm Button Area */}
                <View style={styles.confirmArea}>
                    {query.trim().length > 0 && (
                        <TouchableOpacity
                            style={[styles.confirmButton, { backgroundColor: primaryColor }]}
                            onPress={handleConfirm}
                        >
                            <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
                            <Text style={styles.confirmButtonText}>Confirm "{query}"</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.instructionsArea}>
                    <Text style={[styles.instructionsText, { color: subtextColor }]}>
                        Type the location manually and press confirm.
                    </Text>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    closeButton: {
        padding: 4,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        paddingHorizontal: 14,
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    clearInputButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearIconCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#C4C4C4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmArea: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 12,
        gap: 10,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    instructionsArea: {
        padding: 32,
        alignItems: 'center',
    },
    instructionsText: {
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
});
