import React, { useState } from 'react';
import {
    Modal,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';

const USER_REPORT_REASONS = [
    { id: 'harassment', label: 'Harassment or bullying', icon: 'exclamationmark.bubble.fill' },
    { id: 'fake_profile', label: 'Fake profile or impersonation', icon: 'person.fill.questionmark' },
    { id: 'scam', label: 'Scam or fraud', icon: 'indianrupeesign.circle.fill' },
    { id: 'inappropriate', label: 'Inappropriate behaviour', icon: 'hand.raised.fill' },
    { id: 'safety', label: 'Safety concern', icon: 'shield.fill' },
    { id: 'other', label: 'Other', icon: 'ellipsis.circle.fill' },
] as const;

const MESSAGE_REPORT_REASONS = [
    { id: 'harassment', label: 'Abusive or bullying message', icon: 'exclamationmark.bubble.fill' },
    { id: 'scam', label: 'Spam, scam, or suspicious promotion', icon: 'indianrupeesign.circle.fill' },
    { id: 'inappropriate', label: 'Sexual or inappropriate content', icon: 'hand.raised.fill' },
    { id: 'reselling', label: 'Reselling or commercial message', icon: 'indianrupeesign.circle.fill' },
    { id: 'safety', label: 'Threat, intimidation, or safety risk', icon: 'shield.fill' },
    { id: 'other', label: 'Other message issue', icon: 'ellipsis.circle.fill' },
] as const;

type ReasonId =
    | typeof USER_REPORT_REASONS[number]['id']
    | typeof MESSAGE_REPORT_REASONS[number]['id'];
type ReportContext = 'user' | 'message';

export interface ReportPayload {
    reasonId: ReasonId;
    reasonLabel: string;
    details: string;
    reportedUserId: number;
    reportedUserName?: string | null;
    reporterUserId?: number | null;
    tripDocumentId?: string | null;
    source: 'trip' | 'profile' | 'community_chat' | 'trip_chat' | 'community_group_chat';
    targetType?: 'USER' | 'MESSAGE';
    messageDocumentId?: string | null;
    messagePreview?: string | null;
}

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (payload: ReportPayload) => Promise<void>;
    reportedUserId: number;
    reportedUserName?: string | null;
    reporterUserId?: number | null;
    tripDocumentId?: string | null;
    source: 'trip' | 'profile' | 'community_chat' | 'trip_chat' | 'community_group_chat';
    context?: ReportContext;
    targetType?: 'USER' | 'MESSAGE';
    messageDocumentId?: string | null;
    messagePreview?: string | null;
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
    context = 'user',
    targetType,
    messageDocumentId,
    messagePreview,
}: ReportModalProps) {
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');
    const dangerColor = useThemeColor({}, 'danger');
    const reportReasons = context === 'message' ? MESSAGE_REPORT_REASONS : USER_REPORT_REASONS;
    const title = context === 'message' ? 'Report Content' : 'Report Member';
    const subtitlePrefix = context === 'message' ? 'Sent by' : 'Reporting';
    const questionLabel = context === 'message'
        ? 'What is wrong with this message?'
        : 'Why are you reporting this member?';
    const detailsPlaceholder = context === 'message'
        ? 'Tell us what was wrong with this message...'
        : 'Describe what happened...';

    const [selectedReason, setSelectedReason] = useState<ReasonId | null>(null);
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const isOtherReason = selectedReason === 'other';
    const trimmedDetails = details.trim();
    const isDetailsRequiredMissing = isOtherReason && !trimmedDetails;

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
        if (!selectedReason || isDetailsRequiredMissing) return;
        const reason = reportReasons.find(r => r.id === selectedReason)!;
        setSubmitting(true);
        try {
            await onSubmit({
                reasonId: selectedReason,
                reasonLabel: reason.label,
                details: trimmedDetails,
                reportedUserId,
                reportedUserName,
                reporterUserId,
                tripDocumentId,
                source,
                targetType: targetType ?? (context === 'message' ? 'MESSAGE' : 'USER'),
                messageDocumentId,
                messagePreview,
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
            <Box className="flex-1 justify-end bg-black/60">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="w-full"
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    <Box 
                        className="rounded-t-[40px] px-8 pt-8 pb-10 max-h-[88%]" 
                        style={{ backgroundColor: cardColor }}
                    >
                        {submitted ? (
                            <Box className="items-center py-10">
                                <Box className="w-24 h-24 rounded-[36px] items-center justify-center mb-8 rotate-3 shadow-2xl" style={{ backgroundColor: `${primaryColor}15` }}>
                                    <IconSymbol name="checkmark.shield.fill" size={48} color={primaryColor} />
                                </Box>
                                <Text className="text-2xl font-extrabold text-center uppercase tracking-widest mb-3" style={{ color: textColor }}>
                                    Report Logged
                                </Text>
                                <Text className="text-sm font-medium leading-6 text-center opacity-80 mb-10 px-4" style={{ color: subtextColor }}>
                                    Your safety is our priority. We will investigate this report and take appropriate action immediately.
                                </Text>
                                <Button 
                                    className="w-full h-16 rounded-[24px] shadow-xl"
                                    style={{ backgroundColor: primaryColor }}
                                    onPress={handleClose}
                                >
                                    <ButtonText className="text-xs font-extrabold uppercase tracking-widest">Understood</ButtonText>
                                </Button>
                            </Box>
                        ) : (
                            <>
                                <HStack className="items-start justify-between mb-8">
                                    <VStack >
                                        <Text className="text-2xl font-extrabold uppercase tracking-widest" style={{ color: textColor }}>{title}</Text>
                                        {reportedUserName ? (
                                            <Text className="text-[10px] font-extrabold uppercase tracking-widest mt-1" style={{ color: primaryColor }}>
                                                {subtitlePrefix} {reportedUserName}
                                            </Text>
                                        ) : null}
                                    </VStack>
                                    <Pressable 
                                        onPress={handleClose} 
                                        className="w-10 h-10 rounded-full items-center justify-center bg-gray-50 border shadow-xs"
                                        style={{ borderColor }}
                                    >
                                        <IconSymbol name="xmark" size={20} color={subtextColor} />
                                    </Pressable>
                                </HStack>

                                <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1 mb-4" style={{ color: subtextColor }}>
                                    {questionLabel}
                                </Text>

                                <ScrollView 
                                    showsVerticalScrollIndicator={false} 
                                    contentContainerStyle={{ paddingBottom: 24 }}
                                    className="max-h-[400px]"
                                >
                                    <VStack space="sm">
                                        {reportReasons.map(reason => {
                                            const active = selectedReason === reason.id;
                                            return (
                                                <Pressable
                                                    key={reason.id}
                                                    className="flex-row items-center p-4 rounded-[20px] border-2 shadow-sm"
                                                    style={{
                                                        borderColor: active ? primaryColor : borderColor,
                                                        backgroundColor: active ? `${primaryColor}08` : 'transparent',
                                                    }}
                                                    onPress={() => setSelectedReason(reason.id)}
                                                >
                                                    <Box className="w-10 h-10 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: active ? `${primaryColor}15` : `${subtextColor}08` }}>
                                                        <IconSymbol
                                                            name={reason.icon as any}
                                                            size={18}
                                                            color={active ? primaryColor : subtextColor}
                                                        />
                                                    </Box>
                                                    <Text className="flex-1 text-[13px] font-extrabold uppercase tracking-tight" style={{ color: active ? primaryColor : textColor }}>
                                                        {reason.label}
                                                    </Text>
                                                    {active && (
                                                        <IconSymbol name="checkmark.circle.fill" size={20} color={primaryColor} />
                                                    )}
                                                </Pressable>
                                            );
                                        })}
                                    </VStack>

                                    <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1 mt-8 mb-4" style={{ color: subtextColor }}>
                                        {isOtherReason ? 'Case Details (Required)' : 'Case Details (Optional)'}
                                    </Text>
                                    
                                    <Box className="rounded-[24px] border-2 shadow-sm p-4 h-32" style={{ backgroundColor: `${subtextColor}05`, borderColor: isDetailsRequiredMissing ? dangerColor : borderColor }}>
                                        <TextInput
                                            className="flex-1 text-[15px] font-medium"
                                            style={{ color: textColor, textAlignVertical: 'top' }}
                                            placeholder={detailsPlaceholder}
                                            placeholderTextColor={subtextColor}
                                            multiline
                                            value={details}
                                            onChangeText={setDetails}
                                            maxLength={500}
                                        />
                                        <Text className="text-[9px] font-extrabold uppercase tracking-widest text-right mt-2" style={{ color: subtextColor }}>
                                            {details.length} / 500
                                        </Text>
                                    </Box>
                                    
                                    {isDetailsRequiredMissing ? (
                                        <Text className="text-[10px] font-bold mt-2 ml-1" style={{ color: dangerColor }}>
                                            Please provide details for the &quot;Other&quot; category.
                                        </Text>
                                    ) : null}
                                </ScrollView>

                                <HStack className="mt-8" space="md">
                                    <Button 
                                        variant="outline"
                                        className="flex-1 h-16 rounded-[24px] border-2 shadow-sm"
                                        style={{ borderColor }}
                                        onPress={handleClose}
                                    >
                                        <ButtonText className="text-xs font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Cancel</ButtonText>
                                    </Button>
                                    <Button 
                                        className="flex-[2] h-16 rounded-[24px] shadow-xl"
                                        style={{ 
                                            backgroundColor: selectedReason && !isDetailsRequiredMissing ? dangerColor : `${subtextColor}20`,
                                        }}
                                        onPress={handleSubmit}
                                        disabled={!selectedReason || isDetailsRequiredMissing || submitting}
                                    >
                                        {submitting ? (
                                            <ButtonSpinner color="#fff" />
                                        ) : (
                                            <ButtonText className="text-xs font-extrabold uppercase tracking-widest">Submit Case</ButtonText>
                                        )}
                                    </Button>
                                </HStack>
                            </>
                        )}
                    </Box>
                </KeyboardAvoidingView>
            </Box>
        </Modal>
    );
}
