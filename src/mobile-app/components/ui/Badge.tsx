import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { rad, sp, tone, type Tone } from '@/constants/theme';
import type { IconName } from '@/types';

type Props = {
  label: string | number;
  tone?: Tone;
  icon?: IconName;
  pulse?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ label, tone: t = 'primary', icon, pulse, style }: Props) {
  const { fg, bg } = tone[t];
  return (
    <View style={[s.badge, { backgroundColor: bg }, style]}>
      {pulse && <Dot color={fg} pulse />}
      {!!icon && <Ionicons name={icon} size={12} color={fg} />}
      <Text style={[s.label, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function Dot({ color, pulse, size = 8 }: { color: string; pulse?: boolean; size?: number }) {
  const o = useSharedValue(1);

  useEffect(() => {
    o.value = pulse ? withRepeat(withTiming(0.25, { duration: 700 }), -1, true) : 1;
  }, [pulse, o]);

  const style = useAnimatedStyle(() => ({ opacity: o.value }));

  return <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]} />;
}

const s = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: sp.xs,
    paddingHorizontal: sp.sm,
    paddingVertical: 3,
    borderRadius: rad.full,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
});
