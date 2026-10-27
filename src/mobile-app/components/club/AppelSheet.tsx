import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Avatar } from '@/components/ui/Avatar';
import { Btn, usePress } from '@/components/ui/Btn';
import { Empty, Loader } from '@/components/ui/Empty';
import { Sheet } from '@/components/ui/Sheet';
import { C, gs, rad, sp, tone, txt, type Tone } from '@/constants/theme';
import { useAppel, type Presence } from '@/hooks/useAppel';
import { byName, usePlayers } from '@/hooks/usePlayers';
import type { IconName, Joueur } from '@/types';

type Props = { visible: boolean; onClose: () => void };

type RosterProps = {
  statusOf: (id: number) => Presence | undefined;
  onMark: (id: number, statut: Presence) => void;
};

type MarkProps = { icon: IconName; t: Tone; label: string; isOn: boolean; onPress: () => void };

export function AppelSheet({ visible, onClose }: Props) {
  const { statusOf, mark } = useAppel();
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      full
      title="Gestion manuelle"
      sub="Cochez pour ceux qui ont oublié leur téléphone"
    >
      <Roster statusOf={statusOf} onMark={mark} />
      <Btn label="Terminer" onPress={onClose} style={s.done} />
    </Sheet>
  );
}

function Roster({ statusOf, onMark }: RosterProps) {
  const { list, isLoad, isReady, err, reload } = usePlayers();
  const rows = useMemo(() => [...list].sort(byName), [list]);

  const empty = !isReady ? (
    <Loader />
  ) : err ? (
    <Empty
      icon="cloud-offline-outline"
      title="Liste indisponible"
      sub={err}
      action={
        <Btn label="Réessayer" size="sm" variant="secondary" icon="refresh" isLoad={isLoad} onPress={() => reload()} />
      }
    />
  ) : (
    <Empty icon="people-outline" title="Aucun joueur" sub="Les membres du club apparaîtront ici." />
  );

  return (
    <FlatList
      style={gs.fill}
      data={rows}
      keyExtractor={j => j.id.toString()}
      ItemSeparatorComponent={Sep}
      ListEmptyComponent={empty}
      renderItem={({ item }) => <Row j={item} statut={statusOf(item.id)} onMark={onMark} />}
      refreshControl={
        <RefreshControl
          refreshing={isLoad}
          onRefresh={() => reload()}
          tintColor={C.primary}
          colors={[C.primary]}
          progressBackgroundColor={C.bgCard}
        />
      }
    />
  );
}

function Row({ j, statut, onMark }: { j: Joueur; statut?: Presence; onMark: RosterProps['onMark'] }) {
  const name = `${j.nom} ${j.prenom}`;
  return (
    <View style={[gs.row, s.row]}>
      <Avatar name={name} size={36} />
      <Text style={[txt.body, gs.fill]} numberOfLines={1}>
        {name}
      </Text>
      <Mark icon="close" t="danger" label="Absent" isOn={statut === 'absent'} onPress={() => onMark(j.id, 'absent')} />
      <Mark
        icon="checkmark"
        t="success"
        label="Présent"
        isOn={statut === 'present'}
        onPress={() => onMark(j.id, 'present')}
      />
    </View>
  );
}

function Mark({ icon, t, label, isOn, onPress }: MarkProps) {
  const press = usePress(0.9);
  const { fg, bg } = tone[t];
  return (
    <Animated.View style={press.style}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: isOn }}
        style={[s.mark, { backgroundColor: isOn ? fg : bg, borderColor: isOn ? fg : C.border }]}
      >
        <Ionicons name={icon} size={20} color={isOn ? C.white : fg} />
      </Pressable>
    </Animated.View>
  );
}

const Sep = () => <View style={s.sep} />;

const s = StyleSheet.create({
  row: { gap: sp.md, paddingVertical: sp.md },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: C.border },
  mark: {
    width: 44,
    height: 44,
    borderRadius: rad.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: { marginTop: sp.md },
});
