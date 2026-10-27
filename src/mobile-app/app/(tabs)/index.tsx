import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { CheckInCard } from '@/components/club/CheckInCard';
import { EventRow } from '@/components/club/EventRow';
import { IdentitySheet } from '@/components/club/IdentitySheet';
import { NextEvent } from '@/components/club/NextEvent';
import { PostCard } from '@/components/club/PostCard';
import { ServerStatus } from '@/components/club/ServerStatus';
import { Btn, IconBtn } from '@/components/ui/Btn';
import { Empty, Loader } from '@/components/ui/Empty';
import { Fab } from '@/components/ui/Fab';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { C, sp } from '@/constants/theme';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useFeed, type Agenda } from '@/hooks/useFeed';
import { usePlayers } from '@/hooks/usePlayers';
import { useProfile } from '@/hooks/useProfile';
import { useServer } from '@/hooks/useServer';
import type { Post } from '@/types';

type Tab = 'feed' | 'agenda';
type Row = { key: string; post: Post } | { key: string; evt: Agenda };

const EMPTY = {
  feed: {
    icon: 'megaphone-outline',
    title: 'Aucune annonce pour le moment.',
    sub: 'Les annonces du club apparaîtront ici.',
  },
  agenda: {
    icon: 'calendar-outline',
    title: 'Aucun événement prévu.',
    sub: 'Ajoutez un entraînement, un match ou une réunion avec le bouton +.',
  },
} as const;

const Gap = () => <View style={s.gap} />;

export default function Home() {
  const router = useRouter();
  const { club, me, setMe } = useProfile();
  const { list: players, isReady: isPlayersReady } = usePlayers();
  const { srv, ping } = useServer();
  const { posts, agenda, next, isRefresh, status, reload } = useFeed();
  const { isDone, isPick, checkIn, pick, closePick } = useCheckIn(me, setMe);
  const [tab, setTab] = useState<Tab>('feed');

  const mine = players.find(j => j.id === me);
  const isFeed = tab === 'feed';

  const rows = useMemo<Row[]>(
    () =>
      isFeed
        ? posts.map(post => ({ key: `p${post.id}`, post }))
        : agenda.map(evt => ({ key: `e${evt.id}`, evt })),
    [isFeed, posts, agenda],
  );

  const onRefresh = () => {
    ping();
    reload();
  };

  return (
    <Screen>
      <Header
        caption={<ServerStatus srv={srv} />}
        title={club?.nom ?? 'PingMaster'}
        right={
          <>
            <IconBtn icon="radio-outline" label="Live" onPress={() => router.push('/scoreboard')} />
            <IconBtn icon="chatbubbles-outline" label="Discussion" onPress={() => router.push('/chat')} />
          </>
        }
      />
      <FlatList
        data={rows}
        keyExtractor={r => r.key}
        renderItem={({ item }) => ('post' in item ? <PostCard post={item.post} /> : <EventRow evt={item.evt} />)}
        ItemSeparatorComponent={Gap}
        ListHeaderComponent={
          <View style={s.head}>
            <CheckInCard
              name={mine && `${mine.prenom} ${mine.nom}`}
              isLinked={!!me}
              isDone={isDone}
              onPress={checkIn}
            />
            {!!next && <NextEvent evt={next} />}
            <Segmented
              opts={[
                { key: 'feed', label: 'Actualités', count: posts.length },
                { key: 'agenda', label: 'Agenda', count: agenda.length },
              ]}
              value={tab}
              onChange={setTab}
            />
          </View>
        }
        ListEmptyComponent={<ListState tab={tab} {...status[tab]} onRetry={onRefresh} />}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefresh}
            onRefresh={onRefresh}
            tintColor={C.primary}
            colors={[C.primary]}
            progressBackgroundColor={C.bgCard}
          />
        }
      />
      <Fab
        icon="add"
        a11y={isFeed ? 'Nouvelle annonce' : 'Nouvel événement'}
        onPress={() => router.push({ pathname: '/modal', params: { kind: isFeed ? 'post' : 'event' } })}
      />
      <IdentitySheet
        visible={isPick}
        players={players}
        isLoad={!isPlayersReady}
        onPick={pick}
        onClose={closePick}
      />
    </Screen>
  );
}

type StateProps = { tab: Tab; isReady: boolean; err: string | null; onRetry: () => void };

function ListState({ tab, isReady, err, onRetry }: StateProps) {
  if (!isReady) return <Loader />;
  if (err) {
    return (
      <Empty
        icon="cloud-offline-outline"
        title="Chargement impossible"
        sub={err}
        action={<Btn label="Réessayer" icon="refresh" variant="secondary" onPress={onRetry} />}
      />
    );
  }
  return <Empty {...EMPTY[tab]} />;
}

const s = StyleSheet.create({
  list: { paddingHorizontal: sp.lg, paddingBottom: sp.xxl * 3 },
  head: { gap: sp.lg, marginBottom: sp.md },
  gap: { height: sp.md },
});
