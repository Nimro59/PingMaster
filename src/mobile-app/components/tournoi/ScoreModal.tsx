import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Badge } from '@/components/ui/Badge';
import { Btn, IconBtn, usePress } from '@/components/ui/Btn';
import { Sheet } from '@/components/ui/Sheet';
import { C, gs, rad, sp, txt } from '@/constants/theme';
import type { Match } from '@/types';
import { hap } from '@/utils/hap';

type Score = [number, number];

type Props = {
  match: Match | null;
  visible: boolean;
  isLoad: boolean;
  onClose: () => void;
  onSubmit: (s1: number, s2: number) => void;
};

const MAX = 9;
const PRESETS: Score[] = [
  [3, 0],
  [3, 1],
  [3, 2],
  [0, 3],
  [1, 3],
  [2, 3],
];

const clamp = (v: number) => Math.min(MAX, Math.max(0, v));

export function ScoreModal({ match, visible, isLoad, onClose, onSubmit }: Props) {
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Résultat du match"
      sub={match ? `${match.j1} vs ${match.j2}` : undefined}
    >
      {!!match && <Pad key={match.id} m={match} isLoad={isLoad} onSubmit={onSubmit} />}
    </Sheet>
  );
}

function Pad({ m, isLoad, onSubmit }: { m: Match; isLoad: boolean; onSubmit: Props['onSubmit'] }) {
  const [score, setScore] = useState<Score>([m.s1 || 0, m.s2 || 0]);
  const [s1, s2] = score;
  const isTie = s1 === s2;

  const set = (next: Score) => {
    hap.tap();
    setScore(next);
  };

  return (
    <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>
      <View style={[gs.row, s.sides]}>
        <Side name={m.j1} v={s1} isWin={s1 > s2} onStep={d => set([clamp(s1 + d), s2])} />
        <Side name={m.j2} v={s2} isWin={s2 > s1} onStep={d => set([s1, clamp(s2 + d)])} />
      </View>

      <Text style={txt.caption}>Score rapide</Text>
      <View style={s.grid}>
        {PRESETS.map(([p1, p2]) => (
          <Preset
            key={`${p1}-${p2}`}
            label={`${p1}-${p2}`}
            isOn={p1 === s1 && p2 === s2}
            onPress={() => set([p1, p2])}
          />
        ))}
      </View>

      <Btn
        label="Valider le score"
        icon="checkmark"
        size="lg"
        onPress={() => onSubmit(s1, s2)}
        disabled={isTie}
        isLoad={isLoad}
      />
      {isTie && s1 > 0 && <Text style={[txt.sub, s.hint]}>Une égalité est impossible au tennis de table.</Text>}
    </ScrollView>
  );
}

type SideProps = {
  name: string;
  v: number;
  isWin: boolean;
  onStep: (d: number) => void;
};

function Side({ name, v, isWin, onStep }: SideProps) {
  return (
    <View style={[s.side, isWin && s.sideWin]}>
      <Text style={[txt.body, s.name]} numberOfLines={2}>
        {name}
      </Text>
      <View style={s.crown}>{isWin && <Badge label="Vainqueur" tone="success" icon="trophy" />}</View>
      <Num v={v} isWin={isWin} />
      <View style={[gs.row, s.steps]}>
        <IconBtn icon="remove" size={52} onPress={() => onStep(-1)} disabled={v <= 0} label={`Retirer un set à ${name}`} />
        <IconBtn
          icon="add"
          size={52}
          color={C.primary}
          onPress={() => onStep(1)}
          disabled={v >= MAX}
          label={`Ajouter un set à ${name}`}
        />
      </View>
    </View>
  );
}

function Num({ v, isWin }: { v: number; isWin: boolean }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(withTiming(1.12, { duration: 90 }), withSpring(1, { damping: 12, stiffness: 260 }));
  }, [v, scale]);

  const bump = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return <Animated.Text style={[s.num, txt.num, isWin && s.numWin, bump]}>{v}</Animated.Text>;
}

function Preset({ label, isOn, onPress }: { label: string; isOn: boolean; onPress: () => void }) {
  const press = usePress(0.95);
  return (
    <Animated.View style={[s.cell, press.style]}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        accessibilityRole="button"
        accessibilityState={{ selected: isOn }}
        style={[s.preset, isOn && s.presetOn]}
      >
        <Text style={[s.presetTxt, txt.num, isOn && s.presetTxtOn]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  body: { gap: sp.lg, paddingBottom: sp.xs },
  sides: { alignItems: 'stretch', gap: sp.md },
  side: {
    flex: 1,
    alignItems: 'center',
    gap: sp.sm,
    padding: sp.lg,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bgCard,
  },
  sideWin: { borderColor: C.success, backgroundColor: C.successMuted },
  name: { minHeight: 40, lineHeight: 20, textAlign: 'center' },
  crown: { height: 22, justifyContent: 'center' },
  num: { color: C.textMain, fontSize: 64, lineHeight: 72, fontWeight: '800' },
  numWin: { color: C.success },
  steps: { gap: sp.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm },
  cell: { flexBasis: '30%', flexGrow: 1 },
  preset: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rad.md,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bgCard,
  },
  presetOn: { borderColor: C.primary, backgroundColor: C.primaryMuted },
  presetTxt: { color: C.textMain, fontSize: 16, fontWeight: '700' },
  presetTxtOn: { color: C.primary },
  hint: { textAlign: 'center', marginTop: -sp.sm },
});
