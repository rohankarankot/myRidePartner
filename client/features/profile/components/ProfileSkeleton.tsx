import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/skeleton';
import { useThemeColor } from '@/hooks/use-theme-color';

export function ProfileSkeleton() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Skeleton width={110} height={110} borderRadius={55} />
          <Skeleton width={180} height={22} borderRadius={11} style={styles.headerLine} />
          <Skeleton width={120} height={14} borderRadius={7} style={styles.compactLine} />
          <Skeleton width="42%" height={14} borderRadius={7} style={styles.compactLine} />
          <Skeleton width={112} height={28} borderRadius={14} style={styles.badge} />
        </View>

        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Skeleton width={84} height={18} borderRadius={9} />
          <View style={[styles.row, { borderBottomColor: borderColor }]}>
            <Skeleton width="36%" height={14} borderRadius={7} />
            <Skeleton width={48} height={18} borderRadius={9} />
          </View>
          <View style={styles.row}>
            <Skeleton width="44%" height={14} borderRadius={7} />
            <Skeleton width={34} height={18} borderRadius={9} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Skeleton width={150} height={18} borderRadius={9} />
          {Array.from({ length: 5 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.row,
                index < 4 && { borderBottomColor: borderColor },
              ]}
            >
              <Skeleton width="34%" height={14} borderRadius={7} />
              <Skeleton width={index === 0 ? 92 : index === 3 ? 140 : 84} height={16} borderRadius={8} />
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: cardColor }]}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.actionRow,
                index < 3 && { borderBottomColor: borderColor },
              ]}
            >
              <View style={styles.actionLeft}>
                <Skeleton width={42} height={42} borderRadius={14} />
                <Skeleton width={index === 0 ? 110 : index === 1 ? 136 : index === 2 ? 102 : 88} height={16} borderRadius={8} />
              </View>
              <Skeleton width={14} height={14} borderRadius={7} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLine: {
    marginTop: 16,
  },
  compactLine: {
    marginTop: 10,
  },
  badge: {
    marginTop: 14,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionRow: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
