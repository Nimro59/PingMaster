import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { C, rad, sp, txt } from '@/constants/theme';
import type { IconName } from '@/types';

type Props = {
  title: string;
  sub?: string;
  icon?: IconName;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Empty({ title, sub, icon = 'albums-outline', action, style }: Props) {
  return (
    <View style={[s.wrap, style]}>
      <View style={s.icon}>
        <Ionicons name={icon} size={28} color={C.textSub} />
      </View>
      <Text style={s.title}>{title}</Text>
      {!!sub && <Text style={[txt.sub, s.sub]}>{sub}</Text>}
      {!!action && <View style={s.action}>{action}</View>}
    </View>
  );
}

export function Loader({ label = 'Chargement…', style }: { label?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.wrap, style]}>
      <ActivityIndicator color={C.primary} size="large" />
      <Text style={[txt.sub, s.sub]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: sp.xxl * 1.5, paddingHorizontal: sp.xl },
  icon: {
    width: 64,
    height: 64,
    borderRadius: rad.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: sp.lg,
  },
  title: { color: C.textMain, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  sub: { textAlign: 'center', marginTop: sp.sm, lineHeight: 19 },
  action: { marginTop: sp.xl },
});
