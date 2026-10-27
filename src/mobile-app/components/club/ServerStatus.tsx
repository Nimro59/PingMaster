import { StyleSheet, Text, View } from 'react-native';
import { Dot } from '@/components/ui/Badge';
import { C, gs, sp, txt } from '@/constants/theme';
import type { Srv } from '@/hooks/useServer';

const LOOK: Record<Srv, { color: string; label: string }> = {
  wake: { color: C.live, label: 'Réveil du serveur…' },
  on: { color: C.success, label: 'En ligne' },
  off: { color: C.danger, label: 'Hors ligne' },
};

export function ServerStatus({ srv }: { srv: Srv }) {
  const { color, label } = LOOK[srv];
  return (
    <View style={[gs.row, s.wrap]} accessible accessibilityLabel={`Serveur : ${label}`}>
      <Dot color={color} pulse={srv === 'wake'} />
      <Text style={[txt.caption, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: sp.sm },
});
