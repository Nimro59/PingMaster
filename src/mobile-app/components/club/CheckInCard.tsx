import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Avatar } from '@/components/ui/Avatar';
import { Btn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { C, gs, rad, sp, tone, txt } from '@/constants/theme';
import { dayLabel } from '@/utils/fmt';

type Props = {
  name?: string;
  isLinked: boolean;
  isDone: boolean;
  onPress: () => void;
};

export function CheckInCard({ name, isLinked, isDone, onPress }: Props) {
  const { fg, bg } = tone[isDone ? 'success' : 'primary'];
  return (
    <Card elevated style={[s.card, isDone && s.done]}>
      <View style={[gs.row, s.top]}>
        <View style={[s.icon, { backgroundColor: bg }]}>
          <Ionicons name={isDone ? 'checkmark-circle' : 'finger-print'} size={26} color={fg} />
        </View>
        <View style={gs.fill}>
          <Text style={[txt.caption, { color: fg }]}>{dayLabel(new Date())}</Text>
          <Text style={txt.h2}>{isDone ? 'Présence validée' : 'Prêt pour l’entraînement ?'}</Text>
        </View>
      </View>
      {isLinked ? (
        <View style={[gs.row, s.who]}>
          <Avatar name={name ?? '?'} size={36} />
          <View style={gs.fill}>
            <Text style={txt.body} numberOfLines={1}>
              {name ?? 'Joueur lié'}
            </Text>
            <Text style={txt.sub}>Lié à ce téléphone</Text>
          </View>
        </View>
      ) : (
        <Text style={txt.sub}>Identifiez-vous une seule fois : ce téléphone sera lié à votre profil.</Text>
      )}
      {isDone ? (
        <Animated.View entering={ZoomIn.springify().damping(14)} style={[gs.row, s.ok]}>
          <Ionicons name="checkmark-circle" size={20} color={C.success} />
          <Text style={s.okTxt}>Bon entraînement !</Text>
        </Animated.View>
      ) : (
        <Btn label="Je suis présent" icon="finger-print" size="lg" onPress={onPress} />
      )}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: sp.lg },
  done: { borderColor: C.success },
  top: { gap: sp.md },
  icon: { width: 48, height: 48, borderRadius: rad.md, alignItems: 'center', justifyContent: 'center' },
  who: { gap: sp.md },
  ok: { height: 56, justifyContent: 'center', gap: sp.sm, borderRadius: rad.md, backgroundColor: C.successMuted },
  okTxt: { color: C.success, fontSize: 15, fontWeight: '700' },
});
