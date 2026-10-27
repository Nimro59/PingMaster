import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { Sheet } from '@/components/ui/Sheet';
import { sp, txt } from '@/constants/theme';

type Props = {
  visible: boolean;
  isLoad: boolean;
  onClose: () => void;
  onSubmit: (nom: string, nbTables: string) => Promise<boolean>;
};

export function CreateSheet({ visible, isLoad, onClose, onSubmit }: Props) {
  const [nom, setNom] = useState('');
  const [nbTables, setNbTables] = useState('4');

  const onSub = async () => {
    if (!(await onSubmit(nom, nbTables))) return;
    setNom('');
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Nouveau tournoi" sub="Une poule sera créée par table.">
      <View style={s.form}>
        <Input
          label="Nom"
          icon="trophy-outline"
          placeholder="Open du club"
          value={nom}
          onChangeText={setNom}
          returnKeyType="done"
        />
        <Input
          label="Nombre de tables"
          icon="grid-outline"
          keyboardType="number-pad"
          maxLength={2}
          value={nbTables}
          onChangeText={setNbTables}
          style={txt.num}
        />
        <Btn label="Créer" icon="add" size="lg" onPress={onSub} isLoad={isLoad} disabled={!nom || !nbTables} />
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  form: { gap: sp.lg },
});
