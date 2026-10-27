import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Empty, Loader } from '@/components/ui/Empty';
import { Input } from '@/components/ui/Input';
import { Sheet } from '@/components/ui/Sheet';
import { C, gs, rad, sp, txt } from '@/constants/theme';
import { byName } from '@/hooks/usePlayers';
import type { Joueur } from '@/types';
import { fold } from '@/utils/fmt';

type Props = {
  visible: boolean;
  players: Joueur[];
  isLoad: boolean;
  onPick: (j: Joueur) => void;
  onClose: () => void;
};

export function IdentitySheet({ visible, players, isLoad, onPick, onClose }: Props) {
  const [q, setQ] = useState('');

  const hits = useMemo(() => {
    const words = fold(q.trim()).split(/\s+/);
    return players.filter(j => words.every(w => fold(`${j.nom} ${j.prenom}`).includes(w))).sort(byName);
  }, [players, q]);

  return (
    <Sheet visible={visible} onClose={onClose} title="Identification" sub="Qui êtes-vous dans la liste ?" full>
      <View style={[gs.row, s.warn]}>
        <Ionicons name="alert-circle" size={18} color={C.danger} />
        <Text style={s.warnTxt}>Cette action liera ce téléphone à ce joueur.</Text>
      </View>
      <Input
        icon="search"
        placeholder="Rechercher un joueur"
        value={q}
        onChangeText={setQ}
        autoCorrect={false}
        wrapStyle={s.search}
      />
      <FlatList
        style={gs.fill}
        data={hits}
        keyExtractor={j => j.id.toString()}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => <Row j={item} onPress={() => onPick(item)} />}
        ListEmptyComponent={isLoad ? <Loader /> : <Empty icon="person-outline" title="Aucun joueur trouvé" />}
      />
    </Sheet>
  );
}

function Row({ j, onPress }: { j: Joueur; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [gs.row, s.row, pressed && s.pressed]}
    >
      <Avatar name={`${j.prenom} ${j.nom}`} />
      <View style={gs.fill}>
        <Text style={txt.body} numberOfLines={1}>
          {j.nom} {j.prenom}
        </Text>
        <Text style={[txt.sub, txt.num]}>{Math.round(j.points)} pts</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  warn: { gap: sp.sm, padding: sp.md, marginBottom: sp.md, borderRadius: rad.md, backgroundColor: C.dangerMuted },
  warnTxt: { flex: 1, color: C.danger, fontSize: 13, fontWeight: '600' },
  search: { marginBottom: sp.sm },
  row: { gap: sp.md, minHeight: 64, paddingHorizontal: sp.sm, borderRadius: rad.md },
  pressed: { backgroundColor: C.bgCard },
});
