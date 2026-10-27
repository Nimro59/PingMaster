import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { C, gs, sp, txt } from '@/constants/theme';
import type { Post } from '@/types';
import { ago } from '@/utils/fmt';

export function PostCard({ post }: { post: Post }) {
  const { auteur, date, titre, contenu } = post;
  return (
    <Card style={s.card}>
      <View style={[gs.row, s.head]}>
        <Avatar name={auteur} />
        <View style={gs.fill}>
          <Text style={txt.body} numberOfLines={1}>
            {auteur}
          </Text>
          <Text style={txt.sub}>{ago(date)}</Text>
        </View>
      </View>
      <View style={s.text}>
        <Text style={txt.h2}>{titre}</Text>
        <Text style={s.body}>{contenu}</Text>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: sp.md },
  head: { gap: sp.md },
  text: { gap: sp.xs },
  body: { color: C.textSub, fontSize: 15, lineHeight: 22 },
});
