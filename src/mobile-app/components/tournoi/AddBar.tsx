import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlayerPicker } from '@/components/club/PlayerPicker';
import { Btn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Segmented, type SegOpt } from '@/components/ui/Segmented';
import { gs, sp, txt } from '@/constants/theme';
import { usePlayers } from '@/hooks/usePlayers';
import { freePlayers } from '@/hooks/useTournoi';
import type { Joueur, Participant } from '@/types';

type Mode = 'membre' | 'invite';

type Props = {
  parts: Participant[];
  isLoad: boolean;
  onMember: (j: Joueur) => Promise<boolean>;
  onGuest: (nom: string, pts: string) => Promise<boolean>;
};

const MODES: SegOpt<Mode>[] = [
  { key: 'membre', label: 'Membre' },
  { key: 'invite', label: 'Invité' },
];

export function AddBar({ parts, isLoad, onMember, onGuest }: Props) {
  const { list } = usePlayers();
  const [mode, setMode] = useState<Mode>('membre');
  const [pick, setPick] = useState<Joueur | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [nom, setNom] = useState('');
  const [pts, setPts] = useState('500');
  const free = useMemo(() => freePlayers(list, parts), [list, parts]);
  const isMember = mode === 'membre';

  const onMode = (next: Mode) => {
    setMode(next);
    setPick(null);
  };

  const onSub = async () => {
    if (!isMember) {
      if (await onGuest(nom, pts)) setNom('');
      return;
    }
    if (pick && (await onMember(pick))) {
      setPick(null);
      setResetKey(k => k + 1);
    }
  };

  return (
    <Card elevated style={s.card}>
      <Segmented opts={MODES} value={mode} onChange={onMode} />
      {isMember ? (
        <PlayerPicker
          data={free}
          placeholder="Rechercher un membre du club"
          onSelect={setPick}
          resetKey={resetKey}
          icon="search"
        />
      ) : (
        <View style={[gs.row, s.guest]}>
          <Input
            icon="person-outline"
            placeholder="Nom de l’invité"
            value={nom}
            onChangeText={setNom}
            autoCapitalize="words"
            wrapStyle={gs.fill}
          />
          <Input
            placeholder="500"
            keyboardType="number-pad"
            maxLength={4}
            value={pts}
            onChangeText={setPts}
            style={txt.num}
            wrapStyle={s.pts}
            right={<Text style={txt.caption}>pts</Text>}
          />
        </View>
      )}
      <Btn
        label="Inscrire"
        icon="person-add"
        onPress={onSub}
        isLoad={isLoad}
        disabled={isMember ? !pick : !nom || !pts}
      />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: sp.md },
  guest: { gap: sp.sm },
  pts: { width: 104 },
});
