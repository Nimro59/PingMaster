import { StyleSheet, Text, View } from 'react-native';
import { C } from '@/constants/theme';

const HUES = [C.primary, C.accent, C.live, C.success];

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const ini =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('') || '?';
  const hue = HUES[[...name].reduce((h, c) => h + c.charCodeAt(0), 0) % HUES.length];

  return (
    <View
      style={[
        s.av,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: `${hue}26`, borderColor: `${hue}59` },
      ]}
    >
      <Text style={[s.ini, { color: hue, fontSize: Math.round(size * 0.38) }]}>{ini}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  av: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  ini: { fontWeight: '800', letterSpacing: 0.3 },
});
