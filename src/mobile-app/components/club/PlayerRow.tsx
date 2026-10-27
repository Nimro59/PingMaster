import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MEDAL } from '@/components/club/Podium';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { C, gs, rad, sp, tone, txt } from '@/constants/theme';
import { assidTone, type Ranked } from '@/hooks/useStats';

const ROW_H = 84;
const STEP = ROW_H + sp.sm;

export const rowLayout = (_: unknown, index: number) => ({ length: STEP, offset: STEP * index, index });

type Props = {
  p: Ranked;
  onPress: (p: Ranked) => void;
};

export const PlayerRow = memo(function PlayerRow({ p, onPress }: Props) {
  const { rank, assid, club } = p;
  const rankColor = rank && rank <= 3 ? tone[MEDAL[rank - 1]].fg : C.textMuted;
  const pctColor = assid ? tone[assidTone(assid.pourcentage)].fg : C.textMuted;

  return (
    <Card pad={sp.md} onPress={() => onPress(p)} style={s.row}>
      <Text style={[txt.body, s.rank, txt.num, { color: rankColor }]}>{rank ?? '—'}</Text>
      <Avatar name={`${p.prenom} ${p.nom}`} size={36} />
      <View style={s.mid}>
        <Text style={txt.body} numberOfLines={1}>
          {p.nom.toUpperCase()} {p.prenom}
        </Text>
        {!!club && (
          <Text style={[txt.caption, s.muted]} numberOfLines={1}>
            {club}
          </Text>
        )}
      </View>
      <View style={s.side}>
        <Badge label={`${Math.round(p.points)} pts`} style={s.pts} />
        <View style={[gs.row, s.bar]}>
          <View style={s.track}>
            {!!assid && <View style={[s.fill, { width: `${assid.pourcentage}%`, backgroundColor: pctColor }]} />}
          </View>
          <Text style={[txt.caption, s.line, s.pct, txt.num, { color: pctColor }]}>
            {assid ? `${assid.pourcentage}%` : '—'}
          </Text>
        </View>
        {!!assid && (
          <Text style={[txt.sub, s.line, s.muted, txt.num]} numberOfLines={1}>
            {assid.present}/{assid.total} séances
          </Text>
        )}
      </View>
    </Card>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp.md,
    height: ROW_H,
    marginBottom: sp.sm,
  },
  rank: { width: 24, textAlign: 'center', fontWeight: '800' },
  mid: { flex: 1, gap: sp.xs },
  muted: { color: C.textMuted },
  side: { minWidth: 88, alignItems: 'flex-end', gap: sp.xs },
  pts: { alignSelf: 'flex-end' },
  bar: { gap: sp.sm },
  line: { fontSize: 12, lineHeight: 14 },
  track: { width: 40, height: 4, borderRadius: rad.full, backgroundColor: C.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: rad.full },
  pct: { width: 34, textAlign: 'right', fontWeight: '700' },
});
