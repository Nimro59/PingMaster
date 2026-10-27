import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { BackHandler, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BracketView } from '@/components/tournoi/BracketView';
import { CreateSheet } from '@/components/tournoi/CreateSheet';
import { Inscrits } from '@/components/tournoi/Inscrits';
import { PoolCard } from '@/components/tournoi/PoolCard';
import { ScoreModal } from '@/components/tournoi/ScoreModal';
import { StatusBadge, TournoiCard } from '@/components/tournoi/TournoiCard';
import { Btn, IconBtn } from '@/components/ui/Btn';
import { Empty, Loader } from '@/components/ui/Empty';
import { Fab } from '@/components/ui/Fab';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Segmented, type SegOpt } from '@/components/ui/Segmented';
import { C, gs, sp, txt } from '@/constants/theme';
import { hasBye, played, plural, poolKeys, poolMatchs, useTournoi, useTournois, type Tab } from '@/hooks/useTournoi';
import type { Match, Tournoi } from '@/types';

const OFFLINE = {
  icon: 'cloud-offline-outline',
  title: 'Serveur injoignable',
  sub: 'Tirez vers le bas pour réessayer.',
} as const;

const NONE = {
  icon: 'trophy-outline',
  title: 'Aucun tournoi',
  sub: 'Créez le premier tournoi du club avec le bouton +.',
} as const;

const pull = (refreshing: boolean, onRefresh: () => void) => (
  <RefreshControl
    refreshing={refreshing}
    onRefresh={onRefresh}
    tintColor={C.primary}
    colors={[C.primary]}
    progressBackgroundColor={C.bgCard}
  />
);

export default function TournoiScreen() {
  const { list, isLoad, isReady, err, refresh, create, isSaving } = useTournois();
  const [sel, setSel] = useState<Tournoi | null>(null);
  const [isNew, setNew] = useState(false);

  const back = useCallback(() => {
    setSel(null);
    refresh(true);
  }, [refresh]);

  if (sel) return <Detail key={sel.id} t={sel} onBack={back} />;

  return (
    <Screen>
      <Header caption="Compétitions" title="Tournois" />
      <FlatList
        data={list}
        keyExtractor={t => String(t.id)}
        renderItem={({ item }) => <TournoiCard t={item} onPress={() => setSel(item)} />}
        contentContainerStyle={s.list}
        refreshControl={pull(isLoad, () => refresh())}
        ListEmptyComponent={isReady ? <Empty {...(err ? OFFLINE : NONE)} /> : <Loader />}
      />
      <Fab icon="add" onPress={() => setNew(true)} />
      <CreateSheet visible={isNew} isLoad={isSaving} onClose={() => setNew(false)} onSubmit={create} />
    </Screen>
  );
}

function Detail({ t, onBack }: { t: Tournoi; onBack: () => void }) {
  const {
    status,
    tab,
    show,
    parts,
    poules,
    isLoad,
    err,
    retry,
    isRefresh,
    reload,
    busy,
    addGuest,
    addMember,
    launch,
    closePools,
    updScore,
  } = useTournoi(t);
  const [match, setMatch] = useState<Match | null>(null);
  const [isScore, setScore] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        onBack();
        return true;
      });
      return () => sub.remove();
    }, [onBack]),
  );

  const openScore = (m: Match) => {
    if (hasBye(m)) return;
    setMatch(m);
    setScore(true);
  };

  const onScore = async (s1: number, s2: number) => {
    if (match && (await updScore(match.id, s1, s2))) setScore(false);
  };

  const opts: SegOpt<Tab>[] = [
    { key: 'inscrits', label: 'Inscrits', count: parts?.length },
    { key: 'poules', label: 'Poules', disabled: status === 'inscription' },
    { key: 'tableau', label: 'Tableau', disabled: status !== 'tableau' },
  ];

  const refresher = pull(isRefresh, reload);
  const wait = <Wait isLoad={isLoad} err={err} onRetry={retry} />;

  const body = () => {
    if (tab === 'inscrits') {
      if (!parts) return wait;
      return (
        <Inscrits
          parts={parts}
          isOpen={status === 'inscription'}
          isAdd={busy === 'add'}
          isGen={busy === 'gen'}
          onMember={addMember}
          onGuest={addGuest}
          onLaunch={launch}
          refresh={refresher}
        />
      );
    }
    if (!poules) return wait;
    if (tab === 'poules') {
      const all = poolMatchs(poules);
      return (
        <FlatList
          data={poolKeys(poules)}
          keyExtractor={k => k}
          renderItem={({ item }) => (
            <PoolCard letter={item} poule={poules[item]} onMatch={status === 'poules' ? openScore : undefined} />
          )}
          contentContainerStyle={s.body}
          refreshControl={refresher}
          ListEmptyComponent={<Empty icon="grid-outline" title="Aucune poule" sub="Aucun joueur n’a été réparti." />}
          ListFooterComponent={
            status === 'poules' ? (
              <View style={s.foot}>
                <Text style={[txt.caption, txt.num, s.mid]}>
                  {played(all)}/{all.length} matchs joués
                </Text>
                <Btn
                  label="Générer le tableau final"
                  icon="git-network-outline"
                  size="lg"
                  onPress={closePools}
                  isLoad={busy === 'close'}
                />
              </View>
            ) : null
          }
        />
      );
    }
    if (poules.Tableau) {
      return (
        <ScrollView refreshControl={refresher} contentContainerStyle={s.bracket}>
          <BracketView matchs={poules.Tableau.matchs} onMatch={openScore} />
        </ScrollView>
      );
    }
    if (isLoad || err) return wait;
    return (
      <Empty
        icon="git-network-outline"
        title="Tableau indisponible"
        sub="Le tableau final n’a pas encore été généré."
      />
    );
  };

  return (
    <Screen>
      <View style={s.head}>
        <View style={[gs.row, s.top]}>
          <IconBtn icon="chevron-back" onPress={onBack} label="Retour aux tournois" />
          <View style={[gs.fill, s.titles]}>
            <View style={[gs.row, s.meta]}>
              <StatusBadge status={status} />
              <Text style={[txt.caption, txt.num]} numberOfLines={1}>
                {plural(t.nb_tables, 'table')}
              </Text>
            </View>
            <Text style={txt.h1} numberOfLines={1}>
              {t.nom}
            </Text>
          </View>
        </View>
        <Segmented opts={opts} value={tab} onChange={show} />
      </View>
      <Animated.View key={tab} entering={FadeIn.duration(180)} style={gs.fill}>
        {body()}
      </Animated.View>
      <ScoreModal
        match={match}
        visible={isScore}
        isLoad={busy === 'score'}
        onClose={() => setScore(false)}
        onSubmit={onScore}
      />
    </Screen>
  );
}

function Wait({ isLoad, err, onRetry }: { isLoad: boolean; err: string | null; onRetry: () => void }) {
  if (isLoad || !err) return <Loader />;
  return (
    <Empty
      icon="cloud-offline-outline"
      title="Chargement impossible"
      sub={err}
      action={<Btn label="Réessayer" icon="refresh" variant="secondary" onPress={onRetry} />}
    />
  );
}

const s = StyleSheet.create({
  list: { paddingHorizontal: sp.lg, paddingTop: sp.xs, paddingBottom: 96, gap: sp.md },
  head: { paddingHorizontal: sp.lg, paddingTop: sp.sm, paddingBottom: sp.md, gap: sp.lg },
  top: { gap: sp.md, minHeight: 48 },
  titles: { gap: sp.xs },
  meta: { gap: sp.sm },
  body: { padding: sp.lg, gap: sp.lg, paddingBottom: sp.xxl },
  bracket: { paddingTop: sp.lg, paddingBottom: sp.xxl },
  foot: { gap: sp.md, paddingTop: sp.sm },
  mid: { textAlign: 'center' },
});
