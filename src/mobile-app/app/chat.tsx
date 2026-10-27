import { useRef } from 'react';
import { FlatList, KeyboardAvoidingView, StyleSheet, Text, View } from 'react-native';
import { IconBtn } from '@/components/ui/Btn';
import { Empty, Loader } from '@/components/ui/Empty';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { C, gs, rad, sp, txt } from '@/constants/theme';
import { useChat } from '@/hooks/useChat';
import type { Message } from '@/types';
import { ago } from '@/utils/fmt';

type BubbleProps = { m: Message; isMe: boolean; isFirst: boolean };

export default function ChatScreen() {
  const { club, msgs, draft, setDraft, send, isReady, err, pseudo } = useChat();
  const ref = useRef<FlatList<Message>>(null);
  const toEnd = () => ref.current?.scrollToEnd({ animated: true });

  const empty = !isReady ? (
    <Loader />
  ) : err ? (
    <Empty icon="cloud-offline-outline" title="Serveur injoignable" sub={err} />
  ) : (
    <Empty icon="chatbubbles-outline" title="Démarrez la conversation !" sub="Les messages du club apparaîtront ici." />
  );

  return (
    <Screen edges={['top', 'bottom']}>
      <Header back caption={club?.nom ?? 'Club'} title="Discussion" />
      <KeyboardAvoidingView style={gs.fill} behavior="padding">
        <FlatList
          ref={ref}
          data={msgs}
          keyExtractor={m => m.id.toString()}
          renderItem={({ item, index }) => (
            <Bubble m={item} isMe={item.auteur === pseudo} isFirst={msgs[index - 1]?.auteur !== item.auteur} />
          )}
          contentContainerStyle={[s.list, !msgs.length && s.grow]}
          onContentSizeChange={toEnd}
          onLayout={toEnd}
          ListEmptyComponent={empty}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />
        <View style={[gs.row, s.bar]}>
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder="Écrire un message…"
            wrapStyle={gs.fill}
            returnKeyType="send"
            submitBehavior="submit"
            onSubmitEditing={send}
          />
          <IconBtn
            icon="send"
            size={48}
            color={C.white}
            bg={C.primary}
            border={C.primary}
            label="Envoyer"
            onPress={send}
            disabled={!draft.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Bubble({ m, isMe, isFirst }: BubbleProps) {
  return (
    <View style={[s.msg, isMe ? s.mine : s.theirs, isFirst && s.first]}>
      {!isMe && isFirst && <Text style={[txt.caption, s.author]}>{m.auteur}</Text>}
      <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
        <Text style={[s.text, isMe && s.textMe]}>{m.contenu}</Text>
      </View>
      <Text style={s.time}>{ago(m.date)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  list: { paddingHorizontal: sp.lg, paddingBottom: sp.md },
  grow: { flexGrow: 1, justifyContent: 'center' },
  msg: { maxWidth: '80%', marginTop: sp.xs },
  first: { marginTop: sp.md },
  mine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  author: { marginBottom: sp.xs, marginLeft: sp.xs },
  bubble: { paddingHorizontal: sp.md, paddingVertical: sp.sm, borderRadius: rad.lg },
  bubbleMe: { backgroundColor: C.primary, borderBottomRightRadius: rad.sm / 2 },
  bubbleThem: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderBottomLeftRadius: rad.sm / 2,
  },
  text: { color: C.textMain, fontSize: 15, lineHeight: 21, fontWeight: '500' },
  textMe: { color: C.white },
  time: { color: C.textMuted, fontSize: 11, marginTop: sp.xs, marginHorizontal: sp.xs },
  bar: {
    gap: sp.sm,
    paddingHorizontal: sp.lg,
    paddingVertical: sp.sm,
    borderTopWidth: 1,
    borderTopColor: C.divider,
    backgroundColor: C.bgMain,
  },
});
