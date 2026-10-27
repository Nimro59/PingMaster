import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Avatar } from '@/components/ui/Avatar';
import { usePress } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { gs, rad, sp, tone, txt, type Tone } from '@/constants/theme';
import type { Ranked, Tri } from '@/hooks/useStats';

export const MEDAL: Tone[] = ['live', 'muted', 'accent'];

const SLOTS = [1, 0, 2];
const STEP_H = [72, 52, 40];
const AV = [52, 44, 44];

type Props = {
  top: Ranked[];
  tri: Tri;
  onPress: (p: Ranked) => void;
};

export function Podium({ top, tri, onPress }: Props) {
  return (
    <Card pad={0} style={s.card}>
      <View style={s.row}>
        {SLOTS.map(i => {
          const p = top[i];
          return p ? (
            <Step key={p.id} p={p} place={i} tri={tri} onPress={onPress} />
          ) : (
            <View key={`empty-${i}`} style={gs.fill} />
          );
        })}
      </View>
    </Card>
  );
}

type StepProps = Omit<Props, 'top'> & { p: Ranked; place: number };

function Step({ p, place, tri, onPress }: StepProps) {
  const press = usePress(0.96);
  const { fg, bg } = tone[MEDAL[place]];
  const val = tri === 'pts' ? `${Math.round(p.points)} pts` : p.assid ? `${p.assid.pourcentage}%` : '—';

  return (
    <Animated.View entering={FadeInDown.delay(place * 90).springify().damping(16)} style={gs.fill}>
      <Animated.View style={press.style}>
        <Pressable
          onPress={() => onPress(p)}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          accessibilityRole="button"
          accessibilityLabel={`Rang ${place + 1}, ${p.prenom} ${p.nom}, ${val}`}
          style={s.col}
        >
          {place === 0 && <Ionicons name="trophy" size={16} color={fg} />}
          <View style={[s.ring, { borderColor: fg }]}>
            <Avatar name={`${p.prenom} ${p.nom}`} size={AV[place]} />
          </View>
          <Text style={[txt.body, s.name]} numberOfLines={1}>
            {p.prenom}
          </Text>
          <Text style={[txt.sub, s.val, txt.num, { color: fg }]} numberOfLines={1}>
            {val}
          </Text>
          <View style={[s.step, { height: STEP_H[place], backgroundColor: bg, borderTopColor: fg }]}>
            <Text style={[txt.h1, txt.num, { color: fg }]}>{place + 1}</Text>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: sp.sm, paddingTop: sp.lg, paddingHorizontal: sp.lg },
  col: { alignItems: 'center', gap: sp.xs },
  ring: { padding: sp.xs, borderWidth: 2, borderRadius: rad.full },
  name: { marginTop: sp.xs, textAlign: 'center' },
  val: { fontWeight: '700' },
  step: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: sp.sm,
    paddingTop: sp.sm,
    borderTopWidth: 2,
    borderTopLeftRadius: rad.md,
    borderTopRightRadius: rad.md,
  },
});
