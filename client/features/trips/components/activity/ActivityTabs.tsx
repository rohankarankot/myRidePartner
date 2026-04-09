import React from 'react';
import { ScrollView } from 'react-native';
import { ACTIVITY_FILTER_TABS, ActivityFilterTab } from '@/features/trips/constants/activity';
import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';

type ActivityTabsProps = {
  activeTab: ActivityFilterTab;
  borderColor: string;
  onTabChange: (tab: ActivityFilterTab) => void;
  primaryColor: string;
  subtextColor: string;
};

export function ActivityTabs({
  activeTab,
  borderColor,
  onTabChange,
  primaryColor,
  subtextColor,
}: ActivityTabsProps) {
  return (
    <Box style={{ borderBottomColor: borderColor }} className="border-b">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14 }}
      >
        {ACTIVITY_FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              className="rounded-full border px-5 py-2 mr-3 shadow-sm"
              style={{
                backgroundColor: isActive ? primaryColor : 'transparent',
                borderColor: isActive ? primaryColor : borderColor,
              }}
              onPress={() => onTabChange(tab.id)}
            >
              <Text
                className="text-xs font-extrabold uppercase tracking-widest"
                style={{ color: isActive ? '#fff' : subtextColor }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Box>
  );
}
