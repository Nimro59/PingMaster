import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Badge } from '@/components/ui/Badge';
import { Btn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Empty, Loader } from '@/components/ui/Empty';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { C, gs, rad, sp, tone, txt, type Tone } from '@/constants/theme';
import { useHisto } from '@/hooks/useHisto';
import type { Historique, IconName } from '@/types';

type Stat = { label: string; value: string; icon: IconName; t?: Tone; sub: string };

const toStats = ({ ratio, total_matchs, victoires, defaites, best_perf, worst_contre }: Historique['stats']): Stat[] => [
  { label: 'Victoires', value: `${ratio}%`, icon: 'trophy-outline', t: 'success', sub: 'Taux de victoire' },
  { label: 'Matchs', value: `${total_matchs}`, icon: 'tennisball-outline', sub: `${victoires} V · ${defaites} D` },
  { label: 'Best perf', value: `+${best_perf}`, icon: 'trending-up', t: 'accent', sub: 'Gain max. / match' },
  { label: 'Pire contre', value: `-${worst_contre}`, icon: 'trending-down', t: 'danger', sub: 'Perte max. / match' },
];

const chartCfg = {
  backgroundGradientFrom: C.bgCard,
  backgroundGradientTo: C.bgCard,
  fillShadowGradientFrom: C.primary,
  fillShadowGradientFromOpacity: 0.3,
  fillShadowGradientTo: C.primary,
  fillShadowGradientToOpacity: 0,
  decimalPlaces: 0,
  color: (o = 1) => `rgba(59, 130, 246, ${o})`,
  labelColor: () => C.textSub,
  propsForDots: { r: '3', strokeWidth: '2', stroke: C.primary },
  propsForBackgroundLines: { stroke: C.border, strokeDasharray: '4 6' },
};

export default function PlayerScreen() {
  const { id, nom } = useLocalSearchParams<{ id: string; nom?: string }>();
  const { histo, pts, cur, delta, isLoad, err, retry, isRefresh, refresh } = useHisto(id);
  const [chartW, setChartW] = useState(0);

  return (
    <Screen edges={['top', 'bottom']}>
      <Header back caption="Profil joueur" title={nom || 'Analyse joueur'} />
      {isLoad ? (
        <Loader />
      ) : !histo ? (
        <Empty
          icon="cloud-offline-outline"
          title="Historique indisponible"
          sub={err ?? undefined}
          action={<Btn label="Réessayer" icon="refresh" variant="secondary" onPress={retry} />}
        />
      ) : (
        <ScrollView
          contentContainerStyle={s.body}
          refreshControl={
            <RefreshControl
              refreshing={isRefresh}
              onRefresh={refresh}
              tintColor={C.primary}
              colors={[C.primary]}
              progressBackgroundColor={C.bgCard}
            />
          }
        >
          <View style={s.grid}>
            {toStats(histo.stats).map(st => (
              <Tile key={st.label} {...st} />
            ))}
          </View>
          <Card>
            <View style={[gs.between, s.chartHead]}>
              <View style={gs.fill}>
                <Text style={txt.h2}>Progression</Text>
                {cur !== null && <Text style={[txt.sub, txt.num]}>{Math.round(cur)} pts actuels</Text>}
              </View>
              {pts.length > 1 && (
                <Badge
                  label={`${delta > 0 ? '+' : ''}${delta} pts`}
                  tone={delta > 0 ? 'success' : delta < 0 ? 'danger' : 'muted'}
                />
              )}
            </View>
            {pts.length > 0 ? (
              <View onLayout={e => setChartW(e.nativeEvent.layout.width)}>
                {chartW > 0 && (
                  <LineChart
                    data={{ labels: [], datasets: [{ data: pts }] }}
                    width={chartW}
                    height={220}
                    chartConfig={chartCfg}
                    bezier
                    style={s.chart}
                  />
                )}
              </View>
            ) : (
              <Text style={[txt.sub, s.none]}>Pas assez de données pour le graphique.</Text>
            )}
          </Card>
        </ScrollView>
      )}
    </Screen>
  );
}

function Tile({ label, value, icon, t, sub }: Stat) {
  const { fg, bg } = tone[t ?? 'muted'];
  return (
    <Card style={s.tile}>
      <View style={[s.bubble, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={16} color={fg} />
      </View>
      <Text style={txt.caption}>{label}</Text>
      <Text style={[txt.h1, s.val, txt.num, !!t && { color: fg }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[txt.sub, txt.num]} numberOfLines={1}>
        {sub}
      </Text>
    </Card>
  );
}

const s = StyleSheet.create({
  body: { paddingHorizontal: sp.lg, paddingTop: sp.xs, paddingBottom: sp.xxl, gap: sp.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.md },
  tile: { flexBasis: '45%', flexGrow: 1 },
  bubble: {
    width: 32,
    height: 32,
    borderRadius: rad.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sp.md,
  },
  val: { fontSize: 28, marginVertical: sp.xs },
  chartHead: { gap: sp.md, marginBottom: sp.md },
  chart: { borderRadius: rad.md },
  none: { textAlign: 'center', paddingVertical: sp.xl },
});
