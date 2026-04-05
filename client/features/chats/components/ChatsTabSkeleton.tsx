import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/skeleton';
import { useThemeColor } from '@/hooks/use-theme-color';

export function ChatsTabSkeleton() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.safe, { backgroundColor }]}>
      <View style={styles.container}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={index}
            style={[styles.card, { backgroundColor: cardColor, borderColor }]}
          >
            <Skeleton width={52} height={52} borderRadius={26} />

            <View style={styles.content}>
              <View style={styles.row}>
                <Skeleton width={index % 2 === 0 ? '58%' : '64%'} height={16} borderRadius={8} />
                <Skeleton width={74} height={24} borderRadius={999} />
              </View>

              <Skeleton width="92%" height={13} borderRadius={7} style={styles.subtitleLine} />
              <Skeleton width="72%" height={13} borderRadius={7} style={styles.compactLine} />

              <View style={styles.footer}>
                <View style={styles.roleRow}>
                  <Skeleton width={14} height={14} borderRadius={7} />
                  <Skeleton width={index % 2 === 0 ? 150 : 166} height={12} borderRadius={6} />
                </View>
                <Skeleton width={18} height={18} borderRadius={9} />
              </View>
            </View>
          </View>
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
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtitleLine: {
    marginTop: 8,
  },
  compactLine: {
    marginTop: 6,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
