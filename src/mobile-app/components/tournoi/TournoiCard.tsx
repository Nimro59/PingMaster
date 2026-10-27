import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { C, gs, rad, sp, tone, txt, type Tone } from '@/constants/theme';
import type { Statut, Tournoi } from '@/types';
import { dateLabel, plural } from '@/utils/fmt';

type Look = { label: string; tone: Tone; pulse?: boolean };

const LOOK: Record<Statut, Look> = {
  inscription: { label: 'Inscriptions', tone: 'accent' },
  poules: { label: 'Poules', tone: 'live', pulse: true },
  tableau: { label: 'Tableau final', tone: 'success' },
};

const look = (status: Statut): Look => LOOK[status] ?? { label: status, tone: 'muted' };

export function StatusBadge({ status }: { status: Statut }) {
  const { label, tone: t, pulse } = look(status);
  return <Badge label={label} tone={t} pulse={pulse} />;
}

export function TournoiCard({ t, onPress }: { t: Tournoi; onPress: () => void }) {
  const { fg, bg } = tone[look(t.status).tone];
  return (
    <Card onPress={onPress} style={[gs.row, s.card]}>
      <View style={[gs.center, s.icon, { backgroundColor: bg }]}>
        <Ionicons name="trophy" size={20} color={fg} />
      </View>
      <View style={[gs.fill, s.body]}>
        <Text style={txt.h2} numberOfLines={1}>
          {t.nom}
        </Text>
        <Text style={[txt.sub, txt.num]} numberOfLines={1}>
          {dateLabel(t.date)} · {plural(t.nb_tables, 'table')}
        </Text>
        <StatusBadge status={t.status} />
      </View>
      <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: sp.md },
  icon: { width: 44, height: 44, borderRadius: rad.md },
  body: { gap: sp.xs },
});
