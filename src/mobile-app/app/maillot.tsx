import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Btn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { C, gs, rad, sp, txt } from '@/constants/theme';
import { hap } from '@/utils/hap';

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#2c3e50', '#ffffff', '#000000'];

const STAGE = C.bgElevated;

const ink = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? C.bgMain : C.white;
};

type JerseyProps = { buste: string; manches: string; nom: string; num: string };

type PaletteProps = { label: string; value: string; onChange: (c: string) => void };

export default function MaillotScreen() {
  const [buste, setBuste] = useState('#e74c3c');
  const [manches, setManches] = useState('#c0392b');
  const [nom, setNom] = useState('MON NOM');
  const [num, setNum] = useState('10');

  const onSave = () => {
    hap.ok();
    Alert.alert('Sauvegardé !', 'Ton design a été enregistré dans la galerie du club.');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header back caption="Boutique" title="Studio maillot" />
      <ScrollView
        contentContainerStyle={s.body}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <Card style={s.stage}>
          <Jersey buste={buste} manches={manches} nom={nom} num={num} />
        </Card>
        <Card style={s.ctrl}>
          <Palette label="Couleur principale" value={buste} onChange={setBuste} />
          <Palette label="Couleur manches" value={manches} onChange={setManches} />
          <View style={s.group}>
            <Text style={txt.caption}>Personnalisation</Text>
            <View style={[gs.row, s.inputs]}>
              <Input
                placeholder="Nom"
                value={nom}
                onChangeText={setNom}
                maxLength={10}
                autoCapitalize="characters"
                wrapStyle={s.nom}
              />
              <Input
                placeholder="N°"
                value={num}
                onChangeText={setNum}
                keyboardType="numeric"
                maxLength={2}
                wrapStyle={gs.fill}
                style={txt.num}
              />
            </View>
          </View>
          <Btn label="Enregistrer le design" icon="save-outline" size="lg" onPress={onSave} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Jersey({ buste, manches, nom, num }: JerseyProps) {
  const color = ink(buste);
  return (
    <View style={s.jersey}>
      <View style={[s.sleeve, s.left, { backgroundColor: manches }]} />
      <View style={[s.sleeve, s.right, { backgroundColor: manches }]} />
      <View style={[s.chest, { backgroundColor: buste }]}>
        <View style={s.collar} />
        <Text style={[s.flocName, { color }]} numberOfLines={1}>
          {nom.toUpperCase()}
        </Text>
        <Text style={[s.flocNum, txt.num, { color }]}>{num}</Text>
      </View>
    </View>
  );
}

function Palette({ label, value, onChange }: PaletteProps) {
  return (
    <View style={s.group}>
      <Text style={txt.caption}>{label}</Text>
      <View style={s.swatches}>
        {COLORS.map(c => {
          const isOn = c === value;
          return (
            <Pressable
              key={c}
              onPress={() => {
                hap.tap();
                onChange(c);
              }}
              hitSlop={sp.xs}
              accessibilityRole="button"
              accessibilityLabel={`Couleur ${c}`}
              accessibilityState={{ selected: isOn }}
              style={[gs.center, s.ring, isOn && s.ringOn]}
            >
              <View style={[s.swatch, { backgroundColor: c }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  body: { paddingHorizontal: sp.lg, paddingBottom: sp.xxl, gap: sp.lg },
  stage: { alignItems: 'center', paddingVertical: sp.xxl, backgroundColor: STAGE },
  ctrl: { gap: sp.xl },
  group: { gap: sp.md },
  inputs: { gap: sp.md },
  nom: { flex: 2 },
  jersey: { width: 200, height: 220, alignItems: 'center' },
  chest: {
    width: 140,
    height: 200,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  sleeve: { position: 'absolute', top: 0, width: 60, height: 90, borderWidth: 1, borderColor: C.border },
  left: {
    left: -20,
    transform: [{ rotate: '-20deg' }],
    borderTopLeftRadius: rad.md,
    borderBottomLeftRadius: rad.md,
  },
  right: {
    right: -20,
    transform: [{ rotate: '20deg' }],
    borderTopRightRadius: rad.md,
    borderBottomRightRadius: rad.md,
  },
  collar: { position: 'absolute', top: -15, width: 60, height: 30, borderRadius: rad.full, backgroundColor: STAGE },
  flocName: { fontSize: 16, fontWeight: '800', letterSpacing: 1, marginTop: -20 },
  flocNum: { fontSize: 45, fontWeight: '800' },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: sp.sm },
  ring: { width: 40, height: 40, borderRadius: rad.full, borderWidth: 2, borderColor: 'transparent' },
  ringOn: { borderColor: C.primary },
  swatch: { width: 30, height: 30, borderRadius: rad.full, borderWidth: 1, borderColor: C.border },
});
