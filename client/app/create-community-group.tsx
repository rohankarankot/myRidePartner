import React, { useState } from 'react';
import { ScrollView, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { useThemeColor } from '@/hooks/use-theme-color';
import { communityGroupService } from '@/services/community-group-service';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export default function CreateCommunityGroupScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useMutation({
    mutationFn: () => communityGroupService.createGroup(name.trim(), description.trim() || undefined),
    onSuccess: (group) => {
      Toast.show({
        type: 'success',
        text1: 'Group Created',
        text2: 'Your group is pending admin approval.',
      });
      router.replace(`/community-group/${group.documentId}`);
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Failed to create group',
        text2: 'Please try again later.',
      });
    },
  });

  const canSubmit = name.trim().length >= 3 && !createMutation.isPending;

  return (
    <ScrollView style={{ flex: 1, backgroundColor }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: 'Create Group', headerTitleStyle: { fontWeight: '800' } }} />

      <VStack className="px-6 py-8" space="xs">
        <Text className="text-3xl font-extrabold" style={{ color: textColor }}>Create a Group</Text>
        <Text className="text-sm font-medium" style={{ color: subtextColor }}>
          Start a new community group. Once approved, it will be visible to everyone.
        </Text>
      </VStack>

      <Box className="mx-6 rounded-[32px] p-6 border" style={{ backgroundColor: cardColor, borderColor }}>
        <Text className="mx-2 mb-3 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
          Group Details
        </Text>

        <VStack space="md">
          <VStack space="xs">
            <Text className="text-sm font-bold ml-1" style={{ color: textColor }}>Group Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Bangalore Riders"
              placeholderTextColor={subtextColor}
              maxLength={100}
              style={{
                backgroundColor,
                color: textColor,
                borderColor,
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                fontWeight: '600',
              }}
            />
            <Text className="text-xs font-medium ml-1" style={{ color: subtextColor }}>
              {name.length}/100 characters
            </Text>
          </VStack>

          <VStack space="xs">
            <Text className="text-sm font-bold ml-1" style={{ color: textColor }}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What is this group about?"
              placeholderTextColor={subtextColor}
              maxLength={500}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{
                backgroundColor,
                color: textColor,
                borderColor,
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                fontWeight: '500',
                minHeight: 100,
              }}
            />
            <Text className="text-xs font-medium ml-1" style={{ color: subtextColor }}>
              {description.length}/500 characters (optional)
            </Text>
          </VStack>
        </VStack>
      </Box>

      <Box className="mx-6 mt-6 rounded-[28px] p-5 border" style={{ backgroundColor: cardColor, borderColor }}>
        <HStack space="md" className="items-start">
          <Box
            className="h-10 w-10 rounded-full items-center justify-center"
            style={{ backgroundColor: `${primaryColor}14` }}
          >
            <IconSymbol name="info.circle.fill" size={18} color={primaryColor} />
          </Box>
          <VStack className="flex-1" space="xs">
            <Text className="text-base font-bold" style={{ color: textColor }}>
              Approval Required
            </Text>
            <Text className="text-sm font-medium leading-6" style={{ color: subtextColor }}>
              All new groups need admin approval before being visible. You'll be notified once your group is reviewed.
            </Text>
          </VStack>
        </HStack>
      </Box>

      <VStack className="mx-6 mt-8" space="sm">
        <Pressable
          className="h-14 rounded-[22px] items-center justify-center"
          style={{
            backgroundColor: primaryColor,
            opacity: canSubmit ? 1 : 0.4,
          }}
          disabled={!canSubmit}
          onPress={() => createMutation.mutate()}
        >
          <Text className="text-sm font-extrabold uppercase tracking-widest text-white">
            {createMutation.isPending ? 'Creating...' : 'Create Group'}
          </Text>
        </Pressable>
      </VStack>
    </ScrollView>
  );
}
