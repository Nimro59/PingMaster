import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { PlayerPicker } from '@/components/club/PlayerPicker';
import { Btn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Empty, Loader } from '@/components/ui/Empty';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { C, gs, rad, sp, tone, txt, type Tone } from '@/constants/theme';
import { useMatchForm } from '@/hooks/useMatchForm';
import type { IconName } from '@/types';

export default function MatchScreen() {
  const { players, isLoad, err, reload, win, lose, setWin, setLose, resetKey, isSend, onSub } = useMatchForm();

  return (
    <Screen edges={['top', 'bottom']}>
      <Header back caption="Compétition libre" title="Saisir un match" />
      {isLoad ? (
        <Loader label="Chargement des joueurs…" />
      ) : err && !players.length ? (
        <Empty
          icon="cloud-offline-outline"
          title="Joueurs indisponibles"
          sub="Impossible de charger la liste des joueurs."
          action={<Btn label="Réessayer" icon="refresh" variant="secondary" onPress={() => reload()} />}
        />
      ) : (
        <KeyboardAvoidingView style={gs.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
            <Side title="Vainqueur" icon="trophy" t="success" isSet={!!win} style={s.top}>
              <PlayerPicker
                data={players}
                placeholder="Rechercher le gagnant…"
                onSelect={setWin}
                resetKey={resetKey}
              />
            </Side>
            <View style={[gs.row, s.vs]}>
              <View style={s.line} />
              <Text style={[txt.caption, s.vsTxt]}>VS</Text>
              <View style={s.line} />
            </View>
            <Side title="Perdant" icon="trending-down" t="danger" isSet={!!lose}>
              <PlayerPicker
                data={players}
                placeholder="Rechercher le perdant…"
                onSelect={setLose}
                resetKey={resetKey}
              />
            </Side>
            <Btn
              label="Valider le match"
              icon="checkmark-done"
              size="lg"
              isLoad={isSend}
              disabled={!win || !lose}
              onPress={onSub}
              style={s.cta}
            />
            <Text style={[txt.sub, s.hint]}>Les points FFTT des deux joueurs seront mis à jour.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}

type SideProps = {
  title: string;
  icon: IconName;
  t: Tone;
  isSet: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function Side({ title, icon, t, isSet, children, style }: SideProps) {
  const { fg, bg } = tone[t];
  return (
    <Card style={[isSet && { borderColor: fg }, style]}>
      <View style={[gs.row, s.side]}>
        <View style={[s.bubble, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={18} color={fg} />
        </View>
        <Text style={[txt.h2, gs.fill]}>{title}</Text>
        {isSet && <Ionicons name="checkmark-circle" size={22} color={fg} />}
      </View>
      {children}
    </Card>
  );
}

const s = StyleSheet.create({
  body: { paddingHorizontal: sp.lg, paddingTop: sp.xs, paddingBottom: sp.xxl },
  top: { zIndex: 2 },
  side: { gap: sp.md, marginBottom: sp.md },
  bubble: { width: 36, height: 36, borderRadius: rad.full, alignItems: 'center', justifyContent: 'center' },
  vs: { gap: sp.md, marginVertical: sp.md },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: C.border },
  vsTxt: { color: C.textMuted },
  cta: { marginTop: sp.xl },
  hint: { textAlign: 'center', marginTop: sp.md },
});
