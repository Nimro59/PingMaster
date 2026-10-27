import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Empty } from '@/components/ui/Empty';
import { C, gs, rad, sp, txt } from '@/constants/theme';
import { BYE, hasBye, isDone, rounds, winnerOf } from '@/hooks/useTournoi';
import type { Match } from '@/types';

type Props = {
  matchs: Match[];
  onMatch?: (m: Match) => void;
};

const BOX = 184;

export function BracketView({ matchs, onMatch }: Props) {
  const cols = useMemo(() => rounds(matchs), [matchs]);
  const finale = cols.find(col => col.tour === 'Finale')?.matchs[0];
  const champ = finale && winnerOf(finale);

  if (!cols.length) {
    return <Empty icon="git-network-outline" title="Tableau vide" sub="Aucun match de phase finale." />;
  }

  return (
    <View style={s.wrap}>
      {!!champ && (
        <View style={[gs.row, s.champ]}>
          <View style={[gs.center, s.cup]}>
            <Ionicons name="trophy" size={22} color={C.live} />
          </View>
          <View style={gs.fill}>
            <Text style={txt.caption}>Vainqueur du tournoi</Text>
            <Text style={txt.h2} numberOfLines={1}>
              {champ}
            </Text>
          </View>
        </View>
      )}
      <Text style={[txt.caption, s.title]}>Phase finale</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.cols}>
        {cols.map(col => (
          <View key={col.tour} style={s.col}>
            <Text style={[txt.caption, s.cap]}>{col.tour}</Text>
            <View style={s.stack}>
              {col.matchs.map(m => (
                <Box key={m.id} m={m} onPress={onMatch} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Box({ m, onPress }: { m: Match; onPress?: (m: Match) => void }) {
  const isOver = isDone(m);
  const winner = winnerOf(m);
  const isEdit = !!onPress && !hasBye(m);
  const lines = [
    { key: 'j1', name: m.j1, score: isOver ? m.s1 : m.j2 === BYE ? 'V' : '-' },
    { key: 'j2', name: m.j2, score: isOver ? m.s2 : m.j1 === BYE ? 'V' : '-' },
  ];

  return (
    <Pressable
      disabled={!isEdit}
      onPress={() => onPress?.(m)}
      accessibilityRole={isEdit ? 'button' : undefined}
      accessibilityLabel={`${m.j1} contre ${m.j2}`}
      style={({ pressed }) => [s.box, pressed && s.pressed]}
    >
      {lines.map((line, i) => {
        const isWin = line.name === winner;
        const isBye = line.name === BYE;
        return (
          <View key={line.key} style={[gs.row, s.line, i > 0 && s.sep, isWin && s.win]}>
            <Text style={[s.name, isWin && s.winTxt, isBye && s.bye]} numberOfLines={1}>
              {line.name}
            </Text>
            <Text style={[s.score, txt.num, isWin && s.winTxt, isBye && s.bye]}>{line.score}</Text>
          </View>
        );
      })}
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { gap: sp.md },
  champ: {
    gap: sp.md,
    marginHorizontal: sp.lg,
    padding: sp.lg,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: C.live,
    backgroundColor: C.liveMuted,
  },
  cup: { width: 44, height: 44, borderRadius: rad.full, backgroundColor: C.bgCard },
  title: { paddingHorizontal: sp.lg },
  cols: { gap: sp.lg, paddingHorizontal: sp.lg, paddingBottom: sp.sm },
  col: { width: BOX },
  cap: { textAlign: 'center', color: C.textMain, marginBottom: sp.md },
  stack: { flex: 1, justifyContent: 'space-around', gap: sp.md },
  box: {
    backgroundColor: C.bgCard,
    borderRadius: rad.md,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  pressed: { borderColor: C.borderFocus },
  line: { gap: sp.sm, height: 40, paddingHorizontal: sp.md },
  sep: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border },
  win: { backgroundColor: C.successMuted },
  name: { flex: 1, color: C.textMain, fontSize: 14, fontWeight: '600' },
  score: { width: 20, textAlign: 'right', color: C.textSub, fontSize: 15, fontWeight: '800' },
  winTxt: { color: C.success, fontWeight: '800' },
  bye: { color: C.textMuted, fontStyle: 'italic', fontWeight: '500' },
});
