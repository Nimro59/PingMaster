import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Children, Fragment, ReactNode, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { AppelSheet } from '@/components/club/AppelSheet';
import { ClubSheet, RoleBadge } from '@/components/club/ClubSheet';
import { Avatar } from '@/components/ui/Avatar';
import { IconBtn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { C, gs, rad, sp, tone, txt, type Tone } from '@/constants/theme';
import { useProfile } from '@/hooks/useProfile';
import type { Club, IconName } from '@/types';
import { hap } from '@/utils/hap';

type RowProps = {
  icon: IconName;
  t: Tone;
  label: string;
  sub?: string;
  right?: ReactNode;
  onPress?: () => void;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { clubs, club, activeId, isAdmin, switchClub, addClub } = useProfile();
  const [isClubOpen, setClubOpen] = useState(false);
  const [isAppelOpen, setAppelOpen] = useState(false);

  const openClubs = () => setClubOpen(true);

  const onPick = (c: Club) => {
    switchClub(c);
    setClubOpen(false);
    hap.ok();
    Alert.alert('Changement effectué', `Vous êtes maintenant sur l'espace de ${c.nom}`);
    router.replace('/(tabs)');
  };

  const onJoin = (nom: string, code: string) => {
    const c = addClub(nom, code);
    setClubOpen(false);
    hap.ok();
    Alert.alert('Bienvenue', `Club ajouté en tant que ${c.role.toUpperCase()}`);
  };

  return (
    <Screen>
      <Header caption="Mon compte" title="Réglages" />
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <Card onPress={openClubs} style={[gs.row, s.hero]}>
          <Avatar name={club?.nom ?? ''} size={52} />
          <View style={gs.fill}>
            <Text style={txt.caption}>Espace actuel</Text>
            <Text style={[txt.h2, s.club]} numberOfLines={1}>
              {club?.nom}
            </Text>
            {!!club && <RoleBadge role={club.role} />}
          </View>
          <IconBtn icon="swap-horizontal" onPress={openClubs} label="Changer de club" />
        </Card>

        <Group title="Préférences">
          <Row icon="notifications-outline" t="primary" label="Notifications" right={<Toggle />} />
          <Row icon="moon-outline" t="accent" label="Thème sombre" right={<Toggle disabled />} />
        </Group>

        <Group title="Outils">
          <Row
            icon="shirt-outline"
            t="accent"
            label="Studio maillot"
            sub="Personnaliser un maillot"
            onPress={() => router.push('/maillot')}
          />
          <Row
            icon="radio-outline"
            t="live"
            label="Live & arbitrage"
            sub="Suivre ou diffuser un match"
            onPress={() => router.push('/scoreboard')}
          />
          <Row
            icon="chatbubbles-outline"
            t="primary"
            label="Discussion"
            sub="Messagerie du club"
            onPress={() => router.push('/chat')}
          />
        </Group>

        {isAdmin && (
          <Group title="Administration">
            <Row
              icon="clipboard-outline"
              t="success"
              label="Appel manuel"
              sub="Noter les présences du jour"
              onPress={() => setAppelOpen(true)}
            />
          </Group>
        )}

        <Text style={[s.foot, txt.num]}>PingMaster v1.1 - ID Club: {activeId}</Text>
      </ScrollView>

      <ClubSheet
        visible={isClubOpen}
        onClose={() => setClubOpen(false)}
        clubs={clubs}
        activeId={club?.id}
        onPick={onPick}
        onJoin={onJoin}
      />
      <AppelSheet visible={isAppelOpen} onClose={() => setAppelOpen(false)} />
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={s.group}>
      <Text style={[txt.caption, s.cap]}>{title}</Text>
      <Card pad={0} style={s.box}>
        {Children.toArray(children).map((row, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={s.sep} />}
            {row}
          </Fragment>
        ))}
      </Card>
    </View>
  );
}

function Row({ icon, t, label, sub, right, onPress }: RowProps) {
  const { fg, bg } = tone[t];
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [gs.row, s.row, pressed && s.pressed]}
    >
      <View style={[gs.center, s.tile, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={18} color={fg} />
      </View>
      <View style={gs.fill}>
        <Text style={txt.body}>{label}</Text>
        {!!sub && <Text style={txt.sub}>{sub}</Text>}
      </View>
      {right ?? <Ionicons name="chevron-forward" size={18} color={C.textMuted} />}
    </Pressable>
  );
}

function Toggle({ disabled }: { disabled?: boolean }) {
  return (
    <Switch
      value
      disabled={disabled}
      trackColor={{ false: C.bgElevated, true: C.primary }}
      thumbColor={C.white}
      ios_backgroundColor={C.bgElevated}
    />
  );
}

const TILE = 36;

const s = StyleSheet.create({
  body: { paddingHorizontal: sp.lg, paddingBottom: sp.xxl, gap: sp.xl },
  hero: { gap: sp.md },
  club: { marginTop: sp.xs, marginBottom: sp.sm },
  group: { gap: sp.sm },
  cap: { marginLeft: sp.xs },
  box: { overflow: 'hidden' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: C.border, marginLeft: sp.lg + TILE + sp.md },
  row: { gap: sp.md, minHeight: 60, paddingHorizontal: sp.lg, paddingVertical: sp.md },
  pressed: { backgroundColor: C.bgElevated },
  tile: { width: TILE, height: TILE, borderRadius: rad.sm },
  foot: { color: C.textMuted, fontSize: 12, textAlign: 'center' },
});
