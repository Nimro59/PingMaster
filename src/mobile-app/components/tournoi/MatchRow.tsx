import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { C, rad, sp, txt } from '@/constants/theme';
import { BYE, hasBye, isDone, winnerOf } from '@/hooks/useTournoi';
import type { Match } from '@/types';

type Props = {
  m: Match;
  onPress?: (m: Match) => void;
};

export function MatchRow({ m, onPress }: Props) {
  const isOver = isDone(m);
  const winner = winnerOf(m);
  const isEdit = !!onPress && !hasBye(m);

  const tint = (name: string) => {
    if (name === BYE) return s.bye;
    if (name === winner) return s.win;
    return isOver ? s.lose : null;
  };

  return (
    <Pressable
      disabled={!isEdit}
      onPress={() => onPress?.(m)}
      accessibilityRole={isEdit ? 'button' : undefined}
      accessibilityLabel={`${m.j1} contre ${m.j2}`}
      style={({ pressed }) => [s.row, pressed && s.pressed]}
    >
      <Text style={[s.name, tint(m.j1)]} numberOfLines={1}>
        {m.j1}
      </Text>
      <View style={s.mid}>
        {isOver ? (
          <View style={s.score}>
            <Text style={[s.scoreTxt, txt.num]}>
              {m.s1} – {m.s2}
            </Text>
          </View>
        ) : (
          <Badge label="À jouer" tone="primary" style={s.chip} />
        )}
      </View>
      <Text style={[s.name, s.right, tint(m.j2)]} numberOfLines={1}>
        {m.j2}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp.sm,
    minHeight: 52,
    paddingHorizontal: sp.lg,
    paddingVertical: sp.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
  },
  pressed: { backgroundColor: C.bgElevated },
  name: { flex: 1, color: C.textMain, fontSize: 14, fontWeight: '600' },
  right: { textAlign: 'right' },
  win: { color: C.success, fontWeight: '800' },
  lose: { color: C.textSub, fontWeight: '500' },
  bye: { color: C.textMuted, fontStyle: 'italic', fontWeight: '500' },
  mid: { width: 76, alignItems: 'center' },
  score: {
    minWidth: 64,
    alignItems: 'center',
    paddingHorizontal: sp.sm,
    paddingVertical: sp.xs,
    borderRadius: rad.sm,
    backgroundColor: C.bgElevated,
  },
  scoreTxt: { color: C.textMain, fontSize: 15, fontWeight: '800' },
  chip: { alignSelf: 'center' },
});
