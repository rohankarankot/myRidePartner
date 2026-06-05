import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type ProfileAccountDetailsCardProps = {
  isOrganizationVerified?: boolean;
  isOrganizationVerificationPending?: boolean;
  organizationName?: string | null;
  organizationEmail?: string | null;
  cardColor: string;
  gender?: 'men' | 'women';
  phone: string;
  subtextColor: string;
  successColor: string;
  textColor: string;
  username?: string;
};

export function ProfileAccountDetailsCard({
  isOrganizationVerified,
  isOrganizationVerificationPending,
  organizationName,
  organizationEmail,
  cardColor,
  gender,
  phone,
  subtextColor,
  successColor,
  textColor,
  username,
}: ProfileAccountDetailsCardProps) {
  return (
    <Box className="mx-6 rounded-[32px] p-6 mb-6 shadow-sm border" style={{ backgroundColor: cardColor }}>
      <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-6" style={{ color: subtextColor }}>
        Account Details
      </Text>

      <VStack space="xl">
        <HStack className="justify-between items-center">
          <HStack space="md" className="items-center">
            <Box className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center shadow-sm">
              <IconSymbol name="at" size={16} color={subtextColor} />
            </Box>
            <VStack>
              <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Username</Text>
              <Text className="text-base font-bold" style={{ color: textColor }}>{username}</Text>
            </VStack>
          </HStack>
        </HStack>

        <HStack className="justify-between items-center">
          <HStack space="md" className="items-center">
            <Box className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center shadow-sm">
              <IconSymbol name="phone.fill" size={16} color="#10B981" />
            </Box>
            <VStack>
              <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Phone</Text>
              <Text className="text-base font-bold" style={{ color: textColor }}>{phone}</Text>
            </VStack>
          </HStack>
        </HStack>

        <HStack className="justify-between items-center">
          <HStack space="md" className="items-center">
            <Box className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center shadow-sm">
              <IconSymbol
                name="person.fill"
                size={16}
                color={gender === 'men' ? '#3B82F6' : gender === 'women' ? '#EC4899' : subtextColor}
              />
            </Box>
            <VStack>
              <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Gender</Text>
              <Text className="text-base font-bold capitalize" style={{ color: textColor }}>{gender || 'Not set'}</Text>
            </VStack>
          </HStack>
        </HStack>

        {isOrganizationVerified && organizationName ? (
          <HStack className="justify-between items-center">
            <HStack space="md" className="items-center">
              <Box className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center shadow-sm">
                <IconSymbol name="briefcase.fill" size={16} color={successColor} />
              </Box>
              <VStack>
                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Verified Workspace</Text>
                <Text className="text-base font-bold uppercase" style={{ color: textColor }}>{organizationName}</Text>
                {organizationEmail && (
                  <Text className="text-xs" style={{ color: subtextColor }}>{organizationEmail}</Text>
                )}
              </VStack>
            </HStack>
          </HStack>
        ) : isOrganizationVerificationPending && organizationEmail ? (
          <HStack className="justify-between items-center">
            <HStack space="md" className="items-center">
              <Box className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center shadow-sm">
                <IconSymbol name="clock.fill" size={16} color={successColor} />
              </Box>
              <VStack>
                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Workspace Verification Pending</Text>
                <Text className="text-base font-bold" style={{ color: textColor }}>{organizationEmail}</Text>
              </VStack>
            </HStack>
          </HStack>
        ) : null}
      </VStack>
    </Box>
  );
}
