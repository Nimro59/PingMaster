import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Keyboard, ListRenderItemInfo, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { PlayerRow, rowLayout } from '@/components/club/PlayerRow';
import { Podium } from '@/components/club/Podium';
import { Btn, IconBtn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Empty, Loader } from '@/components/ui/Empty';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Segmented, type SegOpt } from '@/components/ui/Segmented';
import { C, gs, sp, tone, txt, type Tone } from '@/constants/theme';
import { assidTone, useStats, type Ranked, type Tri } from '@/hooks/useStats';
import type { IconName, Joueur } from '@/types';

const TRIS: SegOpt<Tri>[] = [
  { key: 'pts', label: 'Points' },
  { key: 'assid', label: 'Assiduité' },
];

export default function StatsScreen() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [tri, setTri] = useState<Tri>('pts');
  const { rows, top, total, avg, isReady, err, isRefresh, refresh } = useStats(tri, q);
  const isSearch = !!q.trim();

  const open = useCallback(
    (j: Joueur) => {
      Keyboard.dismiss();
      router.push({ pathname: '/details/[id]', params: { id: String(j.id), nom: `${j.prenom} ${j.nom}` } });
    },
    [router],
  );

  const renderRow = useCallback(
    ({ item }: ListRenderItemInfo<Ranked>) => <PlayerRow p={item} onPress={open} />,
    [open],
  );

  const head = (
    <View style={s.head}>
      <View style={[gs.row, s.kpis]}>
        <Kpi icon="people-outline" label="Joueurs" value={isReady ? `${total}` : '—'} />
        <Kpi
          icon="pulse-outline"
          label="Assiduité moy."
          value={avg === null ? '—' : `${avg}%`}
          t={avg === null ? undefined : assidTone(avg)}
        />
      </View>
      <Input
        icon="search"
        placeholder="Rechercher un joueur"
        value={q}
        onChangeText={setQ}
        autoCorrect={false}
        returnKeyType="search"
        right={
          isSearch ? (
            <IconBtn icon="close" size={32} color={C.textSub} label="Effacer la recherche" onPress={() => setQ('')} />
          ) : null
        }
      />
      <Segmented opts={TRIS} value={tri} onChange={setTri} />
      {!isSearch && top.length > 0 && <Podium top={top} tri={tri} onPress={open} />}
      {rows.length > 0 && (
        <Text style={[txt.caption, txt.num]}>
          {isSearch
            ? `${rows.length} résultat${rows.length > 1 ? 's' : ''}`
            : tri === 'pts'
              ? 'Classement points'
              : 'Classement assiduité'}
        </Text>
      )}
    </View>
  );

  const empty = !isReady ? (
    <Loader />
  ) : err && !total ? (
    <Empty
      icon="cloud-offline-outline"
      title="Connexion impossible"
      sub={err}
      action={<Btn label="Réessayer" icon="refresh" variant="secondary" isLoad={isRefresh} onPress={refresh} />}
    />
  ) : isSearch ? (
    <Empty icon="search-outline" title="Aucun joueur trouvé" sub={`Aucun résultat pour « ${q.trim()} ».`} />
  ) : (
    <Empty icon="people-outline" title="Aucun joueur" sub="L’effectif du club est vide." />
  );

  return (
    <Screen>
      <Header
        caption="Club"
        title="Classement"
        right={<IconBtn icon="create-outline" label="Saisir un match" onPress={() => router.push('/match')} />}
      />
      <FlatList
        data={rows}
        keyExtractor={p => String(p.id)}
        renderItem={renderRow}
        getItemLayout={rowLayout}
        ListHeaderComponent={head}
        ListEmptyComponent={empty}
        contentContainerStyle={s.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={isRefresh}
            onRefresh={refresh}
            tintColor={C.primary}
            colors={[C.primary]}
            progressBackgroundColor={C.bgCard}
          />
        }
      />
    </Screen>
  );
}

type KpiProps = { icon: IconName; label: string; value: string; t?: Tone };

function Kpi({ icon, label, value, t }: KpiProps) {
  return (
    <Card pad={sp.md} style={gs.fill}>
      <View style={[gs.row, s.kpiHead]}>
        <Ionicons name={icon} size={14} color={C.textMuted} />
        <Text style={txt.caption} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={[txt.h1, s.kpi, txt.num, !!t && { color: tone[t].fg }]}>{value}</Text>
    </Card>
  );
}

const s = StyleSheet.create({
  list: { paddingHorizontal: sp.lg, paddingBottom: sp.xxl },
  head: { gap: sp.lg, paddingBottom: sp.md },
  kpis: { gap: sp.md },
  kpiHead: { gap: sp.xs },
  kpi: { marginTop: sp.xs },
});
