import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { UserAnalytics } from '@/types/api';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

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

  return (
    <View style={[styles.metricTile, { backgroundColor: `${tint}12` }]}>
      <View style={[styles.metricIcon, { backgroundColor: `${tint}22` }]}>
        <IconSymbol name={icon} size={16} color={tint} />
      </View>
      <Text style={[styles.metricTitle, { color: subtextColor }]}>{title}</Text>
      <Text style={[styles.metricValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.metricCaption, { color: subtextColor }]}>{caption}</Text>
    </View>
  );
}

export function ProfileAnalyticsCard({ analytics }: ProfileAnalyticsCardProps) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const postedColor = '#2563EB';
  const approvedColor = '#059669';
  const completedColor = '#EA580C';

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

  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      <View style={[styles.heroCard, { backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}18` }]}>
        <View style={styles.headerTopRow}>
          <View style={[styles.heroIconWrap, { backgroundColor: `${primaryColor}18` }]}>
            <IconSymbol name="chart.bar.fill" size={18} color={primaryColor} />
          </View>
          <View style={[styles.pill, { backgroundColor: '#FFFFFF', borderColor: `${successColor}24` }]}>
            <Text style={[styles.pillText, { color: successColor }]}>
              {summary.completionRate}% completed
            </Text>
          </View>
        </View>
        <View style={styles.headerCopy}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Ride Analytics</Text>
          <Text style={[styles.cardSubtitle, { color: subtextColor }]}>
            Your personal activity over the last 6 months
          </Text>
        </View>
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={[styles.heroStatValue, { color: textColor }]}>{summary.ridesCompleted}</Text>
            <Text style={[styles.heroStatLabel, { color: subtextColor }]}>Completed</Text>
          </View>
          <View style={[styles.heroDivider, { backgroundColor: `${primaryColor}18` }]} />
          <View style={styles.heroStat}>
            <Text style={[styles.heroStatValue, { color: textColor }]}>{summary.requestsApproved}</Text>
            <Text style={[styles.heroStatLabel, { color: subtextColor }]}>Approved</Text>
          </View>
          <View style={[styles.heroDivider, { backgroundColor: `${primaryColor}18` }]} />
          <View style={styles.heroStat}>
            <Text style={[styles.heroStatValue, { color: textColor }]}>₹{summary.estimatedMoneySaved}</Text>
            <Text style={[styles.heroStatLabel, { color: subtextColor }]}>Saved</Text>
          </View>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <MetricTile
          title="Rides Posted"
          value={String(summary.ridesPosted)}
          caption="Trips you created"
          icon="car.fill"
          tint={primaryColor}
        />
        <MetricTile
          title="Requests Approved"
          value={String(summary.requestsApproved)}
          caption="Passengers you approved"
          icon="checkmark.circle.fill"
          tint="#10B981"
        />
        <MetricTile
          title="Trips Completed"
          value={String(summary.ridesCompleted)}
          caption="Posted rides completed"
          icon="flag.checkered"
          tint="#F59E0B"
        />
        <MetricTile
          title="Money Saved"
          value={`₹${summary.estimatedMoneySaved}`}
          caption="Estimated shared-fare savings"
          icon="indianrupeesign.circle.fill"
          tint="#EC4899"
        />
      </View>

      <View style={[styles.chartCard, { borderColor }]}>
        <Text style={[styles.chartTitle, { color: textColor }]}>Monthly Activity</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: postedColor }]} />
            <Text style={[styles.chartLegend, { color: subtextColor }]}>Posted</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: approvedColor }]} />
            <Text style={[styles.chartLegend, { color: subtextColor }]}>Approved</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: completedColor }]} />
            <Text style={[styles.chartLegend, { color: subtextColor }]}>Completed</Text>
          </View>
        </View>
        <View style={styles.chartBody}>
          {monthlyActivity.map((month) => (
            <View key={month.key} style={styles.chartColumn}>
              <View style={styles.chartBars}>
                <View
                  style={[
                    styles.bar,
                    styles.barPrimary,
                    { backgroundColor: postedColor },
                    { height: `${(month.ridesPosted / maxActivityValue) * 100}%` },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    styles.barSuccess,
                    { backgroundColor: approvedColor },
                    { height: `${(month.requestsApproved / maxActivityValue) * 100}%` },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    styles.barWarning,
                    { backgroundColor: completedColor },
                    { height: `${(month.ridesCompleted / maxActivityValue) * 100}%` },
                  ]}
                />
              </View>
              <Text style={[styles.monthLabel, { color: subtextColor }]}>{month.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.chartCard, { borderColor }]}>
        <View style={styles.savedHeader}>
          <Text style={[styles.chartTitle, { color: textColor }]}>Estimated Money Saved</Text>
          <Text style={[styles.savedTotal, { color: textColor }]}>₹{summary.estimatedMoneySaved}</Text>
        </View>
        <Text style={[styles.chartLegend, { color: subtextColor }]}>
          Based on your completed shared rides as a passenger
        </Text>
        <View style={styles.savedRows}>
          {monthlyActivity.map((month) => (
            <View key={month.key} style={styles.savedRow}>
              <Text style={[styles.savedMonth, { color: subtextColor }]}>{month.label}</Text>
              <View style={[styles.savedTrack, { backgroundColor: `${primaryColor}10` }]}>
                <View
                  style={[
                    styles.savedFill,
                    {
                      backgroundColor: primaryColor,
                      width: `${(month.moneySaved / maxSavedValue) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.savedValue, { color: textColor }]}>₹{month.moneySaved}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  heroIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    marginTop: 14,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  pill: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    flexShrink: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 10,
  },
  heroStat: {
    flex: 1,
  },
  heroStatValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  heroStatLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  heroDivider: {
    width: 1,
    height: 28,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
  },
  metricTile: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
  },
  metricCaption: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  chartCard: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartLegend: {
    fontSize: 12,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chartBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 18,
    minHeight: 150,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  chartBars: {
    height: 120,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 4,
  },
  bar: {
    width: 8,
    minHeight: 6,
    borderRadius: 999,
  },
  barPrimary: {
    backgroundColor: '#3B82F6',
  },
  barSuccess: {
    backgroundColor: '#10B981',
  },
  barWarning: {
    backgroundColor: '#F59E0B',
  },
  monthLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedTotal: {
    fontSize: 20,
    fontWeight: '800',
  },
  savedRows: {
    marginTop: 16,
    gap: 10,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  savedMonth: {
    width: 30,
    fontSize: 12,
    fontWeight: '600',
  },
  savedTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  savedFill: {
    height: '100%',
    borderRadius: 999,
  },
  savedValue: {
    width: 52,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
  },
});
