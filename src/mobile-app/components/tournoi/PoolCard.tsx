import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MatchRow } from '@/components/tournoi/MatchRow';
import { Card } from '@/components/ui/Card';
import { C, gs, rad, sp, txt } from '@/constants/theme';
import { played, standings, tours } from '@/hooks/useTournoi';
import type { Match, Poule } from '@/types';

type Props = {
  letter: string;
  poule: Poule;
  onMatch?: (m: Match) => void;
};

export function PoolCard({ letter, poule, onMatch }: Props) {
  const { matchs } = poule;
  const rows = useMemo(() => standings(poule), [poule]);
  const groups = useMemo(() => tours(matchs), [matchs]);
  const done = played(matchs);
  const pct = matchs.length ? Math.round((done / matchs.length) * 100) : 0;

  return (
    <Card pad={0} style={s.card}>
      <View style={s.head}>
        <View style={gs.between}>
          <Text style={[txt.caption, s.title]}>Poule {letter}</Text>
          <Text style={[txt.caption, txt.num]}>
            {done}/{matchs.length} matchs
          </Text>
        </View>
        <View style={s.track}>
          <View style={[s.fill, { width: `${pct}%` }]} />
        </View>
      </View>

      <View style={s.table}>
        <View style={[gs.row, s.tr]}>
          <Text style={[s.th, s.rank]}>#</Text>
          <Text style={[s.th, gs.fill]}>Joueur</Text>
          <Text style={[s.th, s.n]}>J</Text>
          <Text style={[s.th, s.n]}>V</Text>
          <Text style={[s.th, s.pts]}>Pts</Text>
        </View>
        {rows.map((row, i) => (
          <View key={row.id} style={[gs.row, s.tr]}>
            <Text style={[s.td, s.rank, txt.num]}>{i + 1}</Text>
            <Text style={[txt.body, gs.fill]} numberOfLines={1}>
              {row.nom}
            </Text>
            <Text style={[s.td, s.n, txt.num]}>{row.j}</Text>
            <Text style={[s.td, s.n, txt.num, row.v > 0 && s.v]}>{row.v}</Text>
            <Text style={[s.td, s.pts, txt.num]}>{row.points}</Text>
          </View>
        ))}
      </View>

      {groups.map(group => (
        <View key={group.tour}>
          <Text style={[txt.caption, s.tour]}>Tour {group.tour}</Text>
          {group.matchs.map(m => (
            <MatchRow key={m.id} m={m} onPress={onMatch} />
          ))}
        </View>
      ))}
      {!matchs.length && <Text style={[txt.sub, s.none]}>Aucun match dans cette poule.</Text>}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { overflow: 'hidden' },
  head: { gap: sp.sm, paddingHorizontal: sp.lg, paddingVertical: sp.md, backgroundColor: C.bgElevated },
  title: { color: C.textMain, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  track: { height: 4, borderRadius: rad.full, backgroundColor: C.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: rad.full, backgroundColor: C.success },
  table: {
    paddingHorizontal: sp.lg,
    paddingVertical: sp.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  tr: { gap: sp.sm, minHeight: 36 },
  th: { color: C.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  td: { color: C.textSub, fontSize: 14, fontWeight: '600' },
  rank: { width: 20 },
  n: { width: 24, textAlign: 'center' },
  pts: { width: 48, textAlign: 'right' },
  v: { color: C.success, fontWeight: '800' },
  tour: { color: C.textMuted, paddingHorizontal: sp.lg, paddingTop: sp.md, paddingBottom: sp.sm },
  none: { paddingHorizontal: sp.lg, paddingVertical: sp.lg },
});
