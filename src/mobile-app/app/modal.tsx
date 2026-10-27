import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Dot } from '@/components/ui/Badge';
import { Btn, IconBtn } from '@/components/ui/Btn';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Segmented, type SegOpt } from '@/components/ui/Segmented';
import { C, gs, rad, sp, tone, txt } from '@/constants/theme';
import { EVT, usePublish, type EvtKey } from '@/hooks/useFeed';
import { todayFr } from '@/utils/fmt';
import { hap } from '@/utils/hap';

type Kind = 'post' | 'event';

const KINDS: SegOpt<Kind>[] = [
  { key: 'post', label: 'Annonce' },
  { key: 'event', label: 'Événement' },
];

export default function Composer() {
  const router = useRouter();
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const { isLoad, addPost, addEvent } = usePublish();
  const [tab, setTab] = useState<Kind>(kind === 'event' ? 'event' : 'post');
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [date, setDate] = useState(todayFr);
  const [heure, setHeure] = useState('18:00');
  const [type, setType] = useState<EvtKey>('entrainement');

  const isPost = tab === 'post';
  const isValid = !!titre && (isPost ? !!contenu : !!date);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const onSub = async () => {
    const isOk = isPost ? await addPost(titre, contenu) : await addEvent({ titre, date, heure, type });
    if (isOk) close();
  };

  const pickType = (k: EvtKey) => {
    hap.tap();
    setType(k);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header
        caption="Publier"
        title={isPost ? 'Nouvelle annonce' : 'Nouvel événement'}
        right={<IconBtn icon="close" label="Fermer" onPress={close} />}
      >
        <Segmented opts={KINDS} value={tab} onChange={setTab} />
      </Header>
      <KeyboardAvoidingView style={gs.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
          <Input
            label="Titre"
            placeholder={isPost ? 'Titre (ex: Match ce weekend)' : 'Titre (ex: Entraînement particulier)'}
            value={titre}
            onChangeText={setTitre}
          />
          {isPost ? (
            <Input label="Message" placeholder="Message..." value={contenu} onChangeText={setContenu} multiline />
          ) : (
            <>
              <View style={[gs.row, s.pair]}>
                <Input
                  label="Date"
                  icon="calendar-outline"
                  placeholder="JJ-MM-AAAA"
                  value={date}
                  onChangeText={setDate}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                  wrapStyle={gs.fill}
                />
                <Input
                  label="Heure"
                  icon="time-outline"
                  placeholder="HH:MM"
                  value={heure}
                  onChangeText={setHeure}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  wrapStyle={gs.fill}
                />
              </View>
              <View>
                <Text style={[txt.caption, s.label]}>Type</Text>
                <View style={[gs.row, s.chips]}>
                  {EVT.map(e => (
                    <Chip
                      key={e.key}
                      label={e.label}
                      tint={tone[e.tone]}
                      isOn={type === e.key}
                      onPress={() => pickType(e.key)}
                    />
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
        <View style={s.foot}>
          <Btn
            label={isPost ? 'Publier' : 'Ajouter au calendrier'}
            icon={isPost ? 'paper-plane' : 'calendar'}
            size="lg"
            isLoad={isLoad}
            disabled={!isValid}
            onPress={onSub}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

type ChipProps = {
  label: string;
  tint: { fg: string; bg: string };
  isOn: boolean;
  onPress: () => void;
};

function Chip({ label, tint: { fg, bg }, isOn, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: isOn }}
      style={[gs.row, s.chip, isOn && { backgroundColor: bg, borderColor: fg }]}
    >
      <Dot color={fg} />
      <Text style={[s.chipTxt, isOn && { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  form: { padding: sp.lg, gap: sp.lg },
  pair: { gap: sp.md, alignItems: 'flex-start' },
  label: { marginBottom: sp.sm },
  chips: { gap: sp.sm, flexWrap: 'wrap' },
  chip: {
    gap: sp.sm,
    height: 44,
    paddingHorizontal: sp.md,
    borderRadius: rad.full,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bgCard,
  },
  chipTxt: { color: C.textSub, fontSize: 14, fontWeight: '600' },
  foot: {
    paddingHorizontal: sp.lg,
    paddingTop: sp.md,
    paddingBottom: sp.sm,
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
});
