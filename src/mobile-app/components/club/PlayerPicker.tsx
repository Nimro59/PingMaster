import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Input } from '@/components/ui/Input';
import { C, rad, sp, txt } from '@/constants/theme';
import type { IconName, Joueur } from '@/types';
import { hap } from '@/utils/hap';

type Props = {
  data: Joueur[];
  placeholder: string;
  onSelect: (j: Joueur | null) => void;
  resetKey?: unknown;
  icon?: IconName;
};

export function PlayerPicker({ data, placeholder, onSelect, resetKey, icon = 'search' }: Props) {
  const [q, setQ] = useState('');
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    setQ('');
    setOpen(false);
  }, [resetKey]);

  const hits = useMemo(() => {
    const k = q.toUpperCase();
    return k ? data.filter(j => `${j.nom.toUpperCase()} ${j.prenom.toUpperCase()}`.includes(k)) : [];
  }, [q, data]);

  const onType = (t: string) => {
    setQ(t);
    setOpen(t.length > 0);
    onSelect(null);
  };

  const pick = (j: Joueur) => {
    setQ(`${j.nom} ${j.prenom} (${Math.round(j.points)} pts)`);
    setOpen(false);
    hap.tap();
    onSelect(j);
  };

  return (
    <View>
      <Input icon={icon} placeholder={placeholder} value={q} onChangeText={onType} autoCorrect={false} />
      {isOpen && (
        <View style={s.list}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {hits.length ? (
              hits.map(j => (
                <Pressable key={j.id} onPress={() => pick(j)} style={({ pressed }) => [s.item, pressed && s.pressed]}>
                  <Text style={[txt.body, s.name]} numberOfLines={1}>
                    {j.nom} {j.prenom}
                  </Text>
                  <Text style={[s.pts, txt.num]}>{Math.round(j.points)} pts</Text>
                </Pressable>
              ))
            ) : (
              <Text style={[txt.sub, s.none]}>Aucun joueur trouvé</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  list: {
    maxHeight: 220,
    marginTop: sp.sm,
    backgroundColor: C.bgCard,
    borderRadius: rad.md,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp.md,
    paddingHorizontal: sp.md,
    paddingVertical: sp.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  pressed: { backgroundColor: C.bgElevated },
  name: { flex: 1 },
  pts: { color: C.accent, fontSize: 13, fontWeight: '700' },
  none: { padding: sp.md, textAlign: 'center' },
});
