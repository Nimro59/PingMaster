import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Btn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Sheet } from '@/components/ui/Sheet';
import { C, gs, sp, txt } from '@/constants/theme';
import type { Club } from '@/types';

type Props = {
  visible: boolean;
  onClose: () => void;
  clubs: Club[];
  activeId?: number;
  onPick: (c: Club) => void;
  onJoin: (nom: string, code: string) => void;
};

export function RoleBadge({ role, style }: { role: Club['role']; style?: StyleProp<ViewStyle> }) {
  const isAdm = role === 'admin';
  return <Badge label={isAdm ? 'Administrateur' : 'Joueur'} tone={isAdm ? 'live' : 'primary'} style={style} />;
}

export function ClubSheet({ visible, onClose, clubs, activeId, onPick, onJoin }: Props) {
  const [isJoin, setJoin] = useState(false);
  const [nom, setNom] = useState('');
  const [code, setCode] = useState('');

  const close = () => {
    setJoin(false);
    onClose();
  };

  const onSub = () => {
    onJoin(nom, code);
    setJoin(false);
    setNom('');
    setCode('');
  };

  return (
    <Sheet
      visible={visible}
      onClose={close}
      title={isJoin ? 'Nouveau club' : 'Mes clubs'}
      sub={isJoin ? 'Nom ou numéro du club à rejoindre' : 'Basculer vers un autre espace'}
    >
      <Animated.View key={isJoin ? 'join' : 'list'} entering={FadeIn.duration(180)} style={s.shrink}>
        {isJoin ? (
          <View style={s.stack}>
            <Input
              icon="business-outline"
              placeholder="Nom du club ou Numéro"
              value={nom}
              onChangeText={setNom}
              autoFocus
            />
            <Input
              icon="key-outline"
              placeholder="Code Admin (Optionnel)"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Btn label="Valider" icon="checkmark" onPress={onSub} style={s.top} />
            <Btn label="Annuler" variant="ghost" onPress={() => setJoin(false)} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.stack} keyboardShouldPersistTaps="handled">
            {clubs.map(c => {
              const isOn = c.id === activeId;
              return (
                <Card key={c.id} onPress={() => onPick(c)} pad={sp.md} style={[gs.row, s.row, isOn && s.on]}>
                  <Avatar name={c.nom} size={40} />
                  <View style={gs.fill}>
                    <Text style={txt.body} numberOfLines={1}>
                      {c.nom}
                    </Text>
                    <RoleBadge role={c.role} style={s.role} />
                  </View>
                  {isOn && <Ionicons name="checkmark-circle" size={24} color={C.primary} />}
                </Card>
              );
            })}
            <Btn
              label="Rejoindre un autre club"
              icon="add-circle-outline"
              variant="secondary"
              onPress={() => setJoin(true)}
              style={s.top}
            />
          </ScrollView>
        )}
      </Animated.View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  shrink: { flexShrink: 1 },
  stack: { gap: sp.md },
  row: { gap: sp.md },
  on: { backgroundColor: C.primaryMuted, borderColor: C.primary },
  role: { marginTop: sp.xs },
  top: { marginTop: sp.xs },
});
