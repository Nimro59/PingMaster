import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { C, gs, rad, sp, tone, txt } from '@/constants/theme';
import { evtOf, type Agenda } from '@/hooks/useFeed';
import type { IconName } from '@/types';
import { monthShort } from '@/utils/fmt';

export function EventRow({ evt, elevated }: { evt: Agenda; elevated?: boolean }) {
  const { titre, date, heure, lieu, at, isPast } = evt;
  const { label, tone: t } = evtOf(evt.type);
  const { fg, bg } = tone[t];
  return (
    <Card elevated={elevated} style={[s.card, isPast && s.past]}>
      <View style={[s.tile, { backgroundColor: bg }]}>
        <Text style={[s.day, txt.num, { color: fg }]}>{at?.getDate() ?? '–'}</Text>
        {!!at && <Text style={[s.mon, { color: fg }]}>{monthShort(at)}</Text>}
      </View>
      <View style={[gs.fill, s.info]}>
        <Badge label={label} tone={t} />
        <Text style={elevated ? txt.h2 : txt.body} numberOfLines={2}>
          {titre}
        </Text>
        <View style={[gs.row, s.meta]}>
          <Meta icon="time-outline" label={at ? heure : `${date} ${heure}`} />
          <Meta icon="location-outline" label={lieu} />
        </View>
      </View>
    </Card>
  );
}

function Meta({ icon, label }: { icon: IconName; label?: string | null }) {
  if (!label) return null;
  return (
    <View style={[gs.row, s.item]}>
      <Ionicons name={icon} size={14} color={C.textMuted} />
      <Text style={[txt.sub, txt.num]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', gap: sp.md },
  past: { opacity: 0.5 },
  tile: { width: 56, minHeight: 64, borderRadius: rad.md, alignItems: 'center', justifyContent: 'center' },
  day: { fontSize: 22, lineHeight: 26, fontWeight: '800' },
  mon: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  info: { gap: sp.xs, justifyContent: 'center' },
  meta: { gap: sp.md, flexWrap: 'wrap' },
  item: { gap: sp.xs },
});
