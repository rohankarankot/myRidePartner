import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

const REPORT_REASONS = [
    { id: 'harassment', label: 'Harassment or bullying', icon: 'exclamationmark.bubble.fill' },
    { id: 'fake_profile', label: 'Fake profile or impersonation', icon: 'person.fill.questionmark' },
    { id: 'scam', label: 'Scam or fraud', icon: 'indianrupeesign.circle.fill' },
    { id: 'inappropriate', label: 'Inappropriate behaviour', icon: 'hand.raised.fill' },
    { id: 'safety', label: 'Safety concern', icon: 'shield.fill' },
    { id: 'other', label: 'Other', icon: 'ellipsis.circle.fill' },
] as const;

type ReasonId = typeof REPORT_REASONS[number]['id'];

export interface ReportPayload {
    reasonId: ReasonId;
    reasonLabel: string;
    details: string;
    reportedUserId: number;
    reportedUserName?: string | null;
    reporterUserId?: number | null;
    tripDocumentId?: string | null;
    source: 'trip' | 'profile';
}

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (payload: ReportPayload) => Promise<void>;
    reportedUserId: number;
    reportedUserName?: string | null;
    reporterUserId?: number | null;
    tripDocumentId?: string | null;
    source: 'trip' | 'profile';
}

export function ReportModal({
    visible,
    onClose,
    onSubmit,
    reportedUserId,
    reportedUserName,
    reporterUserId,
    tripDocumentId,
    source,
}: ReportModalProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');
    const dangerColor = useThemeColor({}, 'danger');

    const [selectedReason, setSelectedReason] = useState<ReasonId | null>(null);
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const reset = () => {
        setSelectedReason(null);
        setDetails('');
        setSubmitting(false);
        setSubmitted(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        if (!selectedReason) return;
        const reason = REPORT_REASONS.find(r => r.id === selectedReason)!;
        setSubmitting(true);
        try {
            await onSubmit({
                reasonId: selectedReason,
                reasonLabel: reason.label,
                details: details.trim(),
                reportedUserId,
                reportedUserName,
                reporterUserId,
                tripDocumentId,
                source,
            });
            setSubmitted(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={[styles.sheet, { backgroundColor: cardColor }]}>
                    {submitted ? (
                        /* ── Success State ── */
                        <View style={styles.successContainer}>
                            <View style={[styles.successIcon, { backgroundColor: `${primaryColor}15` }]}>
                                <IconSymbol name="checkmark.shield.fill" size={48} color={primaryColor} />
                            </View>
                            <Text style={[styles.successTitle, { color: textColor }]}>Report Submitted</Text>
                            <Text style={[styles.successBody, { color: subtextColor }]}>
                                Thank you for helping keep My Ride Partner safe. We'll review this report and take action if needed.
                            </Text>
                            <TouchableOpacity
                                style={[styles.doneButton, { backgroundColor: primaryColor }]}
                                onPress={handleClose}
                            >
                                <Text style={styles.doneButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        /* ── Questionnaire State ── */
                        <>
                            {/* Header */}
                            <View style={styles.header}>
                                <View>
                                    <Text style={[styles.title, { color: textColor }]}>Report User</Text>
                                    {reportedUserName ? (
                                        <Text style={[styles.subtitle, { color: subtextColor }]}>
                                            Reporting {reportedUserName}
                                        </Text>
                                    ) : null}
                                </View>
                                <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <IconSymbol name="xmark.circle.fill" size={28} color={subtextColor} />
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.sectionLabel, { color: subtextColor }]}>
                                WHY ARE YOU REPORTING THIS USER?
                            </Text>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
                                {REPORT_REASONS.map(reason => {
                                    const active = selectedReason === reason.id;
                                    return (
                                        <TouchableOpacity
                                            key={reason.id}
                                            style={[
                                                styles.reasonRow,
                                                {
                                                    borderColor: active ? primaryColor : borderColor,
                                                    backgroundColor: active ? `${primaryColor}10` : 'transparent',
                                                },
                                            ]}
                                            onPress={() => setSelectedReason(reason.id)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[styles.reasonIcon, { backgroundColor: active ? `${primaryColor}20` : `${subtextColor}15` }]}>
                                                <IconSymbol
                                                    name={reason.icon as any}
                                                    size={18}
                                                    color={active ? primaryColor : subtextColor}
                                                />
                                            </View>
                                            <Text style={[styles.reasonLabel, { color: active ? primaryColor : textColor }]}>
                                                {reason.label}
                                            </Text>
                                            {active && (
                                                <IconSymbol name="checkmark.circle.fill" size={20} color={primaryColor} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}

                                {/* Optional details */}
                                <Text style={[styles.sectionLabel, { color: subtextColor, marginTop: 16 }]}>
                                    ADDITIONAL DETAILS (OPTIONAL)
                                </Text>
                                <TextInput
                                    style={[
                                        styles.detailsInput,
                                        { borderColor, color: textColor, backgroundColor: `${subtextColor}08` },
                                    ]}
                                    placeholder="Describe what happened..."
                                    placeholderTextColor={subtextColor}
                                    multiline
                                    numberOfLines={4}
                                    value={details}
                                    onChangeText={setDetails}
                                    maxLength={500}
                                    textAlignVertical="top"
                                />
                                <Text style={[styles.charCount, { color: subtextColor }]}>{details.length}/500</Text>
                            </ScrollView>

                            {/* Actions */}
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.cancelBtn, { borderColor }]}
                                    onPress={handleClose}
                                >
                                    <Text style={[styles.cancelBtnText, { color: textColor }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.submitBtn,
                                        {
                                            backgroundColor: selectedReason ? dangerColor : `${subtextColor}30`,
                                        },
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={!selectedReason || submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitBtnText}>Submit Report</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        maxHeight: '88%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.6,
        marginBottom: 10,
    },
    reasonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        marginBottom: 8,
    },
    reasonIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reasonLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    detailsInput: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        fontSize: 15,
        minHeight: 100,
        marginBottom: 4,
    },
    charCount: {
        fontSize: 11,
        textAlign: 'right',
        marginBottom: 8,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelBtn: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
    submitBtn: {
        flex: 2,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    // Success state
    successContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    successIcon: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 10,
    },
    successBody: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 28,
        paddingHorizontal: 8,
    },
    doneButton: {
        width: '100%',
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
