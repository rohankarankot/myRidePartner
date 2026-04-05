import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/skeleton';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppCard } from '@/components/ui/app-card';
import { Radius, Spacing } from '@/constants/ui';

export function FindRidesSkeleton() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.safe, { backgroundColor }]}>
      <View style={styles.container}>
        <View style={[styles.searchContainer, { backgroundColor: cardColor, borderColor }]}>
          <Skeleton width={20} height={20} borderRadius={10} />
          <Skeleton width="62%" height={16} borderRadius={8} />
        </View>

        <Skeleton width="56%" height={20} borderRadius={10} style={styles.sectionTitle} />

        <Skeleton width="100%" height={78} borderRadius={18} style={styles.banner} />

        {Array.from({ length: 4 }).map((_, index) => (
          <AppCard
            key={index}
            style={styles.tripCard}
          >
            <View style={styles.cardHeader}>
              <Skeleton width={44} height={44} borderRadius={22} />
              <View style={styles.captainInfo}>
                <Skeleton width={116} height={16} borderRadius={8} />
                <Skeleton width={88} height={12} borderRadius={6} style={styles.timeLine} />
              </View>
            </View>

            <View style={styles.routeRow}>
              <View style={styles.iconColumn}>
                <Skeleton width={10} height={10} borderRadius={5} />
                <Skeleton width={2} height={36} borderRadius={1} />
                <Skeleton width={10} height={10} borderRadius={5} />
              </View>
              <View style={styles.addresses}>
                <Skeleton width={index % 2 === 0 ? '76%' : '68%'} height={15} borderRadius={8} />
                <Skeleton width={index % 2 === 0 ? '72%' : '82%'} height={15} borderRadius={8} style={styles.destinationLine} />
              </View>
              <Skeleton width={54} height={24} borderRadius={12} />
            </View>

            <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />

            <View style={styles.cardFooter}>
              <View style={styles.footerInfo}>
                <Skeleton width={16} height={16} borderRadius={8} />
                <Skeleton width={74} height={13} borderRadius={7} />
              </View>
              <Skeleton width={64} height={18} borderRadius={9} />
            </View>
          </AppCard>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 15,
    height: 54,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 16,
  },
  banner: {
    marginBottom: 16,
  },
  tripCard: {
    marginBottom: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  captainInfo: {
    justifyContent: 'center',
    flex: 1,
  },
  timeLine: {
    marginTop: 6,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconColumn: {
    alignItems: 'center',
    marginRight: Spacing.md,
    paddingVertical: 4,
    gap: 4,
  },
  addresses: {
    flex: 1,
    justifyContent: 'space-between',
  },
  destinationLine: {
    marginTop: 20,
  },
  cardDivider: {
    height: 1,
    marginVertical: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
