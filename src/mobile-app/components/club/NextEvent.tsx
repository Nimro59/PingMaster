import { StyleSheet, Text, View } from 'react-native';
import { EventRow } from '@/components/club/EventRow';
import { C, gs, sp, txt } from '@/constants/theme';
import type { Agenda } from '@/hooks/useFeed';

const DAY_MS = 86400000;

const inDays = (d: Date) => {
  const n = Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / DAY_MS);
  if (n === 0) return "Aujourd'hui";
  return n === 1 ? 'Demain' : `Dans ${n} jours`;
};

export function NextEvent({ evt }: { evt: Agenda }) {
  return (
    <View style={s.wrap}>
      <View style={gs.between}>
        <Text style={txt.caption}>Prochain événement</Text>
        {!!evt.at && <Text style={[txt.caption, txt.num, s.when]}>{inDays(evt.at)}</Text>}
      </View>
      <EventRow evt={evt} elevated />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: sp.sm },
  when: { color: C.accent },
});
