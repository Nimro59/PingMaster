import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Badge, Dot } from '@/components/ui/Badge';
import { Btn, IconBtn, usePress } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Empty, Loader } from '@/components/ui/Empty';
import { Fab } from '@/components/ui/Fab';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { C, gs, rad, sp, txt } from '@/constants/theme';
import { useLive } from '@/hooks/useLive';
import type { IconName, Live, LiveWtt } from '@/types';

type LiveState = ReturnType<typeof useLive>;

type PanelProps = {
  name: string;
  score: number;
  sets: number;
  isSrv: boolean;
  onPt: (d: number) => void;
  onSet: () => void;
};

export default function LiveScreen() {
  const live = useLive();
  return live.isArb ? <Arbitre live={live} /> : <Spectator live={live} />;
}

function Spectator({ live }: { live: LiveState }) {
  const { isRefresh, refresh, j1, j2, setJ1, setJ2, canStart, start } = live;
  const [isOpen, setOpen] = useState(false);

  const onGo = () => {
    if (start()) setOpen(false);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header back caption="Arbitrage & direct" title="Live" />
      <View style={gs.fill}>
        <ScrollView
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefresh}
              onRefresh={refresh}
              tintColor={C.primary}
              colors={[C.primary]}
              progressBackgroundColor={C.bgCard}
            />
          }
        >
          <Feed live={live} />
        </ScrollView>
        <Fab icon="videocam" label="Diffuser" onPress={() => setOpen(true)} />
      </View>
      <Sheet
        visible={isOpen}
        onClose={() => setOpen(false)}
        title="Lancer un live"
        sub="Le score sera diffusé en direct au club."
      >
        <View style={s.form}>
          <Input icon="person-outline" placeholder="Joueur 1 (ex: Moi)" value={j1} onChangeText={setJ1} />
          <Input icon="person-outline" placeholder="Joueur 2 (ex: L’autre)" value={j2} onChangeText={setJ2} />
          <Btn label="C’est parti !" icon="play" onPress={onGo} disabled={!canStart} style={s.go} />
        </View>
      </Sheet>
    </Screen>
  );
}

function Feed({ live }: { live: LiveState }) {
  const { lives, wtt, isReady, err } = live;
  if (!isReady) return <Loader />;
  if (err && !lives.length && !wtt.length) {
    return <Empty icon="cloud-offline-outline" title="Serveur injoignable" sub={err} />;
  }
  return (
    <>
      {wtt.length > 0 && (
        <Section icon="globe-outline" title="International (WTT)">
          {wtt.map(m => (
            <WttCard key={m.id} m={m} />
          ))}
        </Section>
      )}
      <Section icon="radio-outline" title="Lives du club" count={lives.length}>
        {lives.length ? (
          lives.map(m => <LiveCard key={m.match_id} m={m} />)
        ) : (
          <Empty
            icon="radio-outline"
            title="Aucun match diffusé actuellement."
            sub="Lance un live pour suivre ton match en direct."
          />
        )}
      </Section>
    </>
  );
}

function Section({ icon, title, count, children }: { icon: IconName; title: string; count?: number; children: ReactNode }) {
  return (
    <View style={s.section}>
      <View style={[gs.row, s.head]}>
        <Ionicons name={icon} size={16} color={C.textSub} />
        <Text style={[txt.caption, gs.fill]}>{title}</Text>
        {!!count && <Badge label={count} tone="live" />}
      </View>
      {children}
    </View>
  );
}

function WttCard({ m }: { m: LiveWtt }) {
  return (
    <Card>
      <View style={[gs.row, s.wtt]}>
        <Text style={[txt.body, gs.fill]} numberOfLines={1}>
          {m.joueur1}
        </Text>
        <Text style={[txt.h2, txt.num, s.wttScore]}>{m.score}</Text>
        <Text style={[txt.body, gs.fill, s.end]} numberOfLines={1}>
          {m.joueur2}
        </Text>
      </View>
      <Text style={[txt.caption, s.status]}>{m.statut}</Text>
    </Card>
  );
}

function LiveCard({ m }: { m: Live }) {
  return (
    <Card>
      <Badge label="Live" tone="live" pulse />
      <View style={[gs.row, s.match]}>
        <Player name={m.joueur1} sets={m.set1} isSrv={m.service === 1} />
        <Text style={[s.big, txt.num]}>
          {m.score1}
          <Text style={s.dash}> - </Text>
          {m.score2}
        </Text>
        <Player name={m.joueur2} sets={m.set2} isSrv={m.service === 2} />
      </View>
    </Card>
  );
}

function Player({ name, sets, isSrv }: { name: string; sets: number; isSrv: boolean }) {
  return (
    <View style={[gs.fill, s.player]}>
      <View style={[gs.row, s.who]}>
        {isSrv && <Dot color={C.live} size={6} />}
        <Text style={[txt.body, s.shrink]} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <Text style={[txt.caption, txt.num]}>Sets {sets}</Text>
    </View>
  );
}

function Arbitre({ live }: { live: LiveState }) {
  const { j1, j2, board, point, addSet, stop } = live;
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={s.arb}>
        <View style={gs.between}>
          <Badge label="En direct" tone="live" pulse />
          <Text style={txt.caption}>Arbitrage</Text>
        </View>
        <View style={[gs.row, s.board]}>
          <Panel
            name={j1}
            score={board.s1}
            sets={board.st1}
            isSrv={board.srv === 1}
            onPt={d => point(1, d)}
            onSet={() => addSet(1)}
          />
          <Panel
            name={j2}
            score={board.s2}
            sets={board.st2}
            isSrv={board.srv === 2}
            onPt={d => point(2, d)}
            onSet={() => addSet(2)}
          />
        </View>
        <Btn label="Arrêter la diffusion" variant="danger" size="lg" icon="stop-circle-outline" onPress={stop} />
      </View>
    </Screen>
  );
}

function Panel({ name, score, sets, isSrv, onPt, onSet }: PanelProps) {
  return (
    <View style={s.col}>
      <Card elevated style={[s.panel, isSrv && s.panelSrv]}>
        <View style={[gs.row, s.srv]}>
          {isSrv && (
            <>
              <Dot color={C.live} />
              <Text style={[txt.caption, s.srvTxt]}>Service</Text>
            </>
          )}
        </View>
        <Text style={[txt.h2, s.name]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[s.score, txt.num]} numberOfLines={1} adjustsFontSizeToFit>
          {score}
        </Text>
        <Text style={[txt.caption, txt.num]}>Sets {sets}</Text>
      </Card>
      <Btn label="+ Set" size="sm" variant="secondary" onPress={onSet} />
      <View style={[gs.row, s.pad]}>
        <IconBtn icon="remove" size={56} color={C.textSub} label="Retirer un point" onPress={() => onPt(-1)} />
        <PlusBtn onPress={() => onPt(1)} />
      </View>
    </View>
  );
}

function PlusBtn({ onPress }: { onPress: () => void }) {
  const press = usePress(0.92);
  return (
    <Animated.View style={press.style}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        accessibilityRole="button"
        accessibilityLabel="Ajouter un point"
        style={[gs.center, s.plus]}
      >
        <Ionicons name="add" size={40} color={C.white} />
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  list: { paddingHorizontal: sp.lg, paddingBottom: sp.xxl * 3, gap: sp.xl },
  form: { gap: sp.md },
  go: { marginTop: sp.xs },
  section: { gap: sp.md },
  head: { gap: sp.sm },
  wtt: { gap: sp.md },
  wttScore: { color: C.accent },
  end: { textAlign: 'right' },
  status: { textAlign: 'center', marginTop: sp.sm, color: C.textMuted },
  match: { gap: sp.sm, marginTop: sp.md },
  big: { color: C.textMain, fontSize: 32, fontWeight: '800' },
  dash: { color: C.textMuted },
  player: { alignItems: 'center', gap: sp.xs },
  who: { gap: sp.xs, maxWidth: '100%' },
  shrink: { flexShrink: 1 },
  arb: { flex: 1, padding: sp.lg, gap: sp.lg },
  board: { flex: 1, alignItems: 'stretch', gap: sp.md },
  col: { flex: 1, alignItems: 'center', gap: sp.md },
  panel: { alignSelf: 'stretch', flex: 1, alignItems: 'center', justifyContent: 'center', gap: sp.xs },
  panelSrv: { borderColor: C.live },
  srv: { height: 16, gap: sp.xs },
  srvTxt: { color: C.live },
  name: { textAlign: 'center' },
  score: { color: C.textMain, fontSize: 96, lineHeight: 104, fontWeight: '800' },
  pad: { gap: sp.md },
  plus: {
    width: 80,
    height: 80,
    borderRadius: rad.full,
    backgroundColor: C.primary,
    shadowColor: C.primary,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
