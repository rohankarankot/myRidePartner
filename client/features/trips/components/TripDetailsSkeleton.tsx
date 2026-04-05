import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/skeleton';
import { AppCard } from '@/components/ui/app-card';
import { Radius, Spacing } from '@/constants/ui';
import { useThemeColor } from '@/hooks/use-theme-color';

export function TripDetailsSkeleton() {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <View style={[styles.safe, { backgroundColor }]}>
      <View style={styles.container}>
        <AppCard style={styles.card}>
          <View style={styles.routeRow}>
            <View style={styles.iconColumn}>
              <View style={[styles.dot, { backgroundColor: primaryColor }]} />
              <View style={[styles.line, { backgroundColor: borderColor }]} />
              <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            </View>
            <View style={styles.routeContent}>
              <View style={styles.addressRow}>
                <Skeleton width="68%" height={18} borderRadius={9} />
                <Skeleton width={82} height={24} borderRadius={12} />
              </View>
              <Skeleton width="74%" height={18} borderRadius={9} style={styles.destinationLine} />
            </View>
          </View>
        </AppCard>

        <AppCard style={styles.card}>
          <View style={styles.infoRow}>
            <InfoSkeleton />
            <InfoSkeleton />
          </View>
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          <View style={styles.infoRow}>
            <InfoSkeleton />
            <InfoSkeleton valueWidth={118} />
          </View>
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          <View style={styles.infoRow}>
            <InfoSkeleton valueWidth={92} />
          </View>
        </AppCard>

        <Skeleton width="100%" height={52} borderRadius={Radius.lg} style={styles.chatButton} />

        <AppCard style={styles.card}>
          <Skeleton width={108} height={18} borderRadius={9} />
          <Skeleton width="100%" height={14} borderRadius={7} style={styles.noteLine} />
          <Skeleton width="84%" height={14} borderRadius={7} style={styles.compactLine} />
        </AppCard>

        <AppCard style={styles.card}>
          <Skeleton width={72} height={18} borderRadius={9} />
          <View style={styles.captainRow}>
            <Skeleton width={54} height={54} borderRadius={27} />
            <View style={styles.captainContent}>
              <Skeleton width={140} height={16} borderRadius={8} />
              <Skeleton width={96} height={13} borderRadius={7} style={styles.compactLine} />
            </View>
          </View>
        </AppCard>

        <AppCard style={styles.card}>
          <Skeleton width={64} height={18} borderRadius={9} />
          <View style={styles.safetyButtons}>
            <Skeleton width="48%" height={48} borderRadius={Radius.md} />
            <Skeleton width="48%" height={48} borderRadius={Radius.md} />
          </View>
        </AppCard>

        <Skeleton width="100%" height={54} borderRadius={Radius.lg} style={styles.primaryAction} />
      </View>
    </View>
  );
}

function InfoSkeleton({ valueWidth = 72 }: { valueWidth?: number }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoLabelRow}>
        <Skeleton width={16} height={16} borderRadius={8} />
        <Skeleton width={52} height={12} borderRadius={6} />
      </View>
      <Skeleton width={valueWidth} height={16} borderRadius={8} style={styles.compactLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    padding: Spacing.xl,
  },
  card: {
    marginBottom: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconColumn: {
    alignItems: 'center',
    marginRight: Spacing.md,
    paddingVertical: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    width: 2,
    height: 44,
    marginVertical: 4,
  },
  routeContent: {
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  destinationLine: {
    marginTop: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  infoItem: {
    flex: 1,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  chatButton: {
    marginBottom: 16,
  },
  noteLine: {
    marginTop: Spacing.md,
  },
  compactLine: {
    marginTop: 8,
  },
  captainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  captainContent: {
    flex: 1,
  },
  safetyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  primaryAction: {
    marginTop: 2,
  },
});
