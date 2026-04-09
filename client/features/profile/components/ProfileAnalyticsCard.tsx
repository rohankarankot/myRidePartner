import React from 'react';
import { UserAnalytics } from '@/types/api';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Divider } from '@/components/ui/divider';

type ProfileAnalyticsCardProps = {
  analytics: UserAnalytics;
};

function MetricTile({
  title,
  value,
  caption,
  icon,
  tint,
}: {
  title: string;
  value: string;
  caption: string;
  icon: any;
  tint: string;
}) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Box className="w-[48%] rounded-[24px] p-4 border shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
      <Box className="w-10 h-10 rounded-2xl items-center justify-center mb-3 shadow-sm" style={{ backgroundColor: tint }}>
        <IconSymbol name={icon} size={18} color="#fff" />
      </Box>
      <VStack space="xs">
        <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>{title}</Text>
        <Text className="text-2xl font-extrabold" style={{ color: textColor }}>{value}</Text>
        <Text className="text-[10px] font-medium leading-4" style={{ color: subtextColor }}>{caption}</Text>
      </VStack>
    </Box>
  );
}

export function ProfileAnalyticsCard({ analytics }: ProfileAnalyticsCardProps) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const postedColor = '#3B82F6';
  const approvedColor = '#10B981';
  const completedColor = '#F59E0B';
  const recoveryColor = '#8B5CF6';

  const summary = analytics.summary;
  const monthlyActivity = analytics.monthlyActivity;
  const maxActivityValue = Math.max(
    1,
    ...monthlyActivity.flatMap((month) => [
      month.ridesPosted,
      month.requestsApproved,
      month.ridesCompleted,
    ]),
  );
  const maxSavedValue = Math.max(1, ...monthlyActivity.map((month) => month.moneySaved));
  const maxRecoveredValue = Math.max(
    1,
    ...monthlyActivity.map((month) => month.costRecovered),
  );

  return (
    <VStack space="lg" className="w-full">
      <Box className="rounded-[32px] p-6 shadow-sm border overflow-hidden" style={{ backgroundColor: cardColor, borderColor }}>
        <HStack className="justify-between items-start mb-6">
          <VStack space="xs">
            <Box className="w-12 h-12 rounded-2xl items-center justify-center mb-2 shadow-sm" style={{ backgroundColor: primaryColor }}>
                <IconSymbol name="chart.bar.fill" size={24} color="#fff" />
            </Box>
            <Text className="text-2xl font-extrabold" style={{ color: textColor }}>Ride Insights</Text>
            <Text className="text-sm font-medium" style={{ color: subtextColor }}>Your performance over 6 months</Text>
          </VStack>
          <Box className="px-4 py-2 rounded-full border-2" style={{ borderColor: `${successColor}40`, backgroundColor: `${successColor}10` }}>
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: successColor }}>
              {summary.completionRate}% Efficiency
            </Text>
          </Box>
        </HStack>

        <HStack className="bg-transparent border border-dashed rounded-[24px] p-4" style={{ borderColor }}>
          <VStack className="flex-1 items-center" space="xs">
            <Text className="text-base font-extrabold" style={{ color: textColor }}>{summary.ridesCompleted}</Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: subtextColor }}>Completed</Text>
          </VStack>
          <Divider className="w-px h-8 self-center mx-2" style={{ backgroundColor: borderColor }} />
          <VStack className="flex-1 items-center" space="xs">
            <Text className="text-base font-extrabold" style={{ color: textColor }}>{summary.requestsApproved}</Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: subtextColor }}>Approved</Text>
          </VStack>
          <Divider className="w-px h-8 self-center mx-2" style={{ backgroundColor: borderColor }} />
          <VStack className="flex-1 items-center" space="xs">
            <Text className="text-base font-extrabold" style={{ color: textColor }}>₹{summary.estimatedMoneySaved}</Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: subtextColor }}>Saved</Text>
          </VStack>
        </HStack>
      </Box>

      <HStack className="flex-wrap justify-between" >
        <MetricTile
          title="Rides Posted"
          value={String(summary.ridesPosted)}
          caption="Total trips you've published"
          icon="car.fill"
          tint={postedColor}
        />
        <MetricTile
          title="Approved"
          value={String(summary.requestsApproved)}
          caption="Passengers you've welcomed"
          icon="checkmark.circle.fill"
          tint={approvedColor}
        />
        <Box className="h-4 w-full" />
        <MetricTile
          title="Completion"
          value={String(summary.ridesCompleted)}
          caption="Succesful rides shared"
          icon="flag.checkered"
          tint={completedColor}
        />
        <MetricTile
          title="Cost Recovery"
          value={`₹${summary.estimatedCostRecovered}`}
          caption="Shared expense recovered"
          icon="wallet.pass.fill"
          tint={recoveryColor}
        />
      </HStack>

      {/* Monthly Activity Chart */}
      <Box className="rounded-[32px] p-6 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
        <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-6" style={{ color: subtextColor }}>Monthly Trends</Text>
        
        <HStack className="items-end justify-between h-[160px] px-2 mb-6" >
          {monthlyActivity.map((month) => (
            <VStack key={month.key} className="items-center" style={{ width: '14%' }} space="md">
              <HStack className="items-end h-[120px]" space="xs">
                <Box 
                  className="w-1.5 rounded-full" 
                  style={{ 
                    backgroundColor: postedColor, 
                    height: `${(month.ridesPosted / maxActivityValue) * 100}%`,
                    minHeight: 4 
                  }} 
                />
                <Box 
                  className="w-1.5 rounded-full" 
                  style={{ 
                    backgroundColor: approvedColor, 
                    height: `${(month.requestsApproved / maxActivityValue) * 100}%`,
                    minHeight: 4 
                  }} 
                />
                <Box 
                  className="w-1.5 rounded-full" 
                  style={{ 
                    backgroundColor: completedColor, 
                    height: `${(month.ridesCompleted / maxActivityValue) * 100}%`,
                    minHeight: 4 
                  }} 
                />
              </HStack>
              <Text className="text-[10px] font-extrabold uppercase" style={{ color: subtextColor }}>{month.label}</Text>
            </VStack>
          ))}
        </HStack>

        <HStack className="justify-center flex-wrap pt-4 border-t border-dashed" style={{ borderColor }} space="lg">
          <HStack className="items-center" space="xs">
            <Box className="w-2 h-2 rounded-full" style={{ backgroundColor: postedColor }} />
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>Posted</Text>
          </HStack>
          <HStack className="items-center" space="xs">
            <Box className="w-2 h-2 rounded-full" style={{ backgroundColor: approvedColor }} />
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>Approved</Text>
          </HStack>
          <HStack className="items-center" space="xs">
            <Box className="w-2 h-2 rounded-full" style={{ backgroundColor: completedColor }} />
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>Completed</Text>
          </HStack>
        </HStack>
      </Box>

      {/* Savings Progress Chart */}
      <Box className="rounded-[32px] p-6 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
        <HStack className="justify-between items-center mb-6">
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Savings Growth</Text>
            <Text className="text-xl font-extrabold" style={{ color: textColor }}>₹{summary.estimatedMoneySaved}</Text>
        </HStack>
        
        <VStack space="lg">
          {monthlyActivity.map((month) => (
            <HStack key={month.key} className="items-center" space="md">
              <Text className="w-8 text-[10px] font-extrabold uppercase" style={{ color: subtextColor }}>{month.label}</Text>
              <Box className="flex-1 h-3 rounded-full bg-gray-50 overflow-hidden">
                <Box
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: primaryColor,
                    width: `${(month.moneySaved / maxSavedValue) * 100}%`,
                  }}
                />
              </Box>
              <Text className="w-12 text-right text-xs font-bold" style={{ color: textColor }}>₹{month.moneySaved}</Text>
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* Recovery Progress Chart */}
      <Box className="rounded-[32px] p-6 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
        <HStack className="justify-between items-center mb-6">
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Cost Recovery</Text>
            <Text className="text-xl font-extrabold" style={{ color: textColor }}>₹{summary.estimatedCostRecovered}</Text>
        </HStack>
        
        <VStack space="lg">
          {monthlyActivity.map((month) => (
            <HStack key={`${month.key}-recovery`} className="items-center" space="md">
              <Text className="w-8 text-[10px] font-extrabold uppercase" style={{ color: subtextColor }}>{month.label}</Text>
              <Box className="flex-1 h-3 rounded-full bg-gray-50 overflow-hidden">
                <Box
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: recoveryColor,
                    width: `${(month.costRecovered / maxRecoveredValue) * 100}%`,
                  }}
                />
              </Box>
              <Text className="w-12 text-right text-xs font-bold" style={{ color: textColor }}>₹{month.costRecovered}</Text>
            </HStack>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
}
