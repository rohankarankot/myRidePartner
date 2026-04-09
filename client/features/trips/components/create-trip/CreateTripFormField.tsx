import React, { useState } from 'react';
import { NativeSyntheticEvent, TextInputContentSizeChangeEventData } from 'react-native';
import { FormField as FormFieldTokens } from '@/constants/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type CreateTripFormFieldProps = {
  compactMultiline?: boolean;
  editable?: boolean;
  error?: string;
  icon: any;
  keyboardType?: 'default' | 'numeric';
  label: string;
  multiline?: boolean;
  numberOfLines?: number;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onPress?: () => void;
  placeholder: string;
  value: string;
};

export function CreateTripFormField({
  compactMultiline = false,
  editable = true,
  error,
  icon,
  keyboardType = 'default',
  label,
  multiline = false,
  numberOfLines = 1,
  onChangeText,
  onFocus,
  onPress,
  placeholder,
  value,
}: CreateTripFormFieldProps) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const borderColor = useThemeColor({}, 'border');
  const dangerColor = useThemeColor({}, 'danger');
  const cardColor = useThemeColor({}, 'card');

  const multilinePadding = 14;
  const horizontalPadding = FormFieldTokens.horizontalPadding;
  const iconSpacing = 12;
  const singleLineContentHeight = 24;
  const initialContentHeight = compactMultiline
    ? singleLineContentHeight
    : FormFieldTokens.multilineMinHeight - multilinePadding * 2;
  const [contentHeight, setContentHeight] = useState(initialContentHeight);

  const baseMultilineHeight = compactMultiline
    ? FormFieldTokens.height
    : FormFieldTokens.multilineMinHeight;
  const multilineHeight = Math.max(baseMultilineHeight, contentHeight + multilinePadding * 2);
  const isExpandedMultiline = multiline && multilineHeight > FormFieldTokens.height;

  const handleContentSizeChange = (
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>
  ) => {
    if (!multiline) {
      return;
    }

    setContentHeight(event.nativeEvent.contentSize.height);
  };

  return (
    <VStack space="xs" className="mb-6">
      <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>
        {label}
      </Text>
      <Input
        variant="underlined"
        size="md"
        isDisabled={!editable || !!onPress}
        isInvalid={!!error}
        className="rounded-[24px] border-2 shadow-sm"
        style={{
          borderColor: error ? dangerColor : borderColor,
          backgroundColor: cardColor,
          minHeight: multiline ? multilineHeight : FormFieldTokens.height,
          height: multiline ? undefined : FormFieldTokens.height,
          alignItems: isExpandedMultiline ? 'flex-start' : 'center',
        }}
      >
        <Pressable
          onPress={onPress}
          className="flex-1 w-full flex-row"
          style={{
            minHeight: multiline ? multilineHeight : FormFieldTokens.height,
            alignItems: isExpandedMultiline ? 'flex-start' : 'center',
            paddingHorizontal: horizontalPadding,
          }}
          disabled={!onPress}
        >
          <IconSymbol
            name={icon}
            size={18}
            color={subtextColor}
            style={{
              marginRight: iconSpacing,
              marginTop: isExpandedMultiline ? 16 : 0,
              alignSelf: isExpandedMultiline ? 'flex-start' : 'center',
            }}
          />
          <InputField
            placeholder={placeholder}
            placeholderTextColor={subtextColor}
            className="flex-1 text-[15px] font-medium"
            style={{
              color: textColor,
              lineHeight: FormFieldTokens.fontSize * 1.35,
              textAlignVertical: isExpandedMultiline ? 'top' : 'center',
              paddingTop: isExpandedMultiline ? multilinePadding : 0,
              paddingBottom: isExpandedMultiline ? multilinePadding : 0,
              height: isExpandedMultiline || multiline ? undefined : FormFieldTokens.height,
              minHeight: multiline ? contentHeight : undefined,
            }}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            editable={editable && !onPress}
            multiline={multiline}
            numberOfLines={numberOfLines}
            onFocus={onFocus}
            scrollEnabled={false}
            onContentSizeChange={handleContentSizeChange}
          />
        </Pressable>
      </Input>
      {error ? (
        <Text className="text-[10px] font-bold uppercase tracking-tight ml-1" style={{ color: dangerColor }}>
          {error}
        </Text>
      ) : null}
    </VStack>
  );
}
