import type { ReactElement } from 'react';
import { FlatList, RefreshControlProps, StyleSheet, Text, View } from 'react-native';
import { AddBar } from '@/components/tournoi/AddBar';
import { Avatar } from '@/components/ui/Avatar';
import { Btn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Empty } from '@/components/ui/Empty';
import { C, gs, sp, txt } from '@/constants/theme';
import { plural } from '@/hooks/useTournoi';
import type { Joueur, Participant } from '@/types';

type Props = {
  parts: Participant[];
  isOpen: boolean;
  isAdd: boolean;
  isGen: boolean;
  onMember: (j: Joueur) => Promise<boolean>;
  onGuest: (nom: string, pts: string) => Promise<boolean>;
  onLaunch: () => void;
  refresh: ReactElement<RefreshControlProps>;
};

export function Inscrits({ parts, isOpen, isAdd, isGen, onMember, onGuest, onLaunch, refresh }: Props) {
  return (
    <View style={gs.fill}>
      <FlatList
        data={parts}
        keyExtractor={p => String(p.id)}
        renderItem={({ item, index }) => <Row p={item} rank={index + 1} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={refresh}
        contentContainerStyle={[s.list, isOpen && s.room]}
        ListHeaderComponent={
          <View style={s.head}>
            {isOpen && <AddBar parts={parts} isLoad={isAdd} onMember={onMember} onGuest={onGuest} />}
            {parts.length > 0 && (
              <View style={gs.between}>
                <Text style={[txt.caption, txt.num]}>{plural(parts.length, 'inscrit')}</Text>
                <Text style={txt.caption}>Points</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <Empty
            icon="people-outline"
            title="Aucun inscrit"
            sub={isOpen ? 'Ajoutez un membre du club ou un invité externe.' : undefined}
          />
        }
      />
      {isOpen && (
        <View style={s.bar}>
          <Btn label="Lancer les poules" icon="play" size="lg" onPress={onLaunch} isLoad={isGen} />
        </View>
      )}
    </View>
  );
}

function Row({ p, rank }: { p: Participant; rank: number }) {
  return (
    <Card pad={sp.md} style={[gs.row, s.row]}>
      <Text style={[s.rank, txt.num]}>#{rank}</Text>
      <Avatar name={p.nom} size={36} />
      <Text style={[txt.body, gs.fill]} numberOfLines={1}>
        {p.nom}
      </Text>
      <Text style={[s.pts, txt.num]}>
        {p.points}
        <Text style={s.unit}> pts</Text>
      </Text>
    </Card>
  );
}

const s = StyleSheet.create({
  list: { padding: sp.lg, gap: sp.sm, paddingBottom: sp.xxl },
  room: { paddingBottom: 112 },
  head: { gap: sp.lg, marginBottom: sp.xs },
  row: { gap: sp.md },
  rank: { width: 36, color: C.textMuted, fontSize: 13, fontWeight: '700' },
  pts: { color: C.accent, fontSize: 15, fontWeight: '800' },
  unit: { color: C.textMuted, fontSize: 12, fontWeight: '600' },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: sp.lg,
    backgroundColor: C.bgMain,
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
});
