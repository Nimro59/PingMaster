import { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { C, rad } from '@/constants/theme';
import { hap } from '@/utils/hap';

export type SegOpt<K extends string> = { key: K; label: string; count?: number; disabled?: boolean };

type Props<K extends string> = {
  opts: SegOpt<K>[];
  value: K;
  onChange: (k: K) => void;
  style?: StyleProp<ViewStyle>;
};

const PAD = 4;

export function Segmented<K extends string>({ opts, value, onChange, style }: Props<K>) {
  const [w, setW] = useState(0);
  const x = useSharedValue(0);
  const isSet = useRef(false);
  const idx = Math.max(0, opts.findIndex(o => o.key === value));
  const segW = w / opts.length;

  useEffect(() => {
    if (!segW) return;
    x.value = isSet.current ? withSpring(idx * segW, { damping: 20, stiffness: 240 }) : idx * segW;
    isSet.current = true;
  }, [idx, segW, x]);

  const ind = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width - PAD * 2);

  return (
    <View style={[s.track, style]} onLayout={onLayout}>
      {w > 0 && <Animated.View style={[s.ind, { width: segW }, ind]} />}
      {opts.map(o => {
        const isOn = o.key === value;
        return (
          <Pressable
            key={o.key}
            style={s.seg}
            disabled={o.disabled}
            accessibilityRole="tab"
            accessibilityState={{ selected: isOn, disabled: !!o.disabled }}
            onPress={() => {
              if (isOn) return;
              hap.tap();
              onChange(o.key);
            }}
          >
            <Text style={[s.label, isOn && s.on, o.disabled && s.off]} numberOfLines={1}>
              {o.label}
            </Text>
            {o.count !== undefined && (
              <View style={[s.count, isOn && s.countOn]}>
                <Text style={[s.countTxt, isOn && s.countTxtOn]}>{o.count}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 44,
    padding: PAD,
    backgroundColor: C.bgCard,
    borderRadius: rad.md,
    borderWidth: 1,
    borderColor: C.border,
  },
  ind: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    left: PAD,
    backgroundColor: C.bgElevated,
    borderRadius: rad.sm,
    borderWidth: 1,
    borderColor: C.border,
  },
  seg: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  label: { color: C.textSub, fontSize: 13, fontWeight: '600' },
  on: { color: C.textMain, fontWeight: '700' },
  off: { color: C.textMuted, opacity: 0.6 },
  count: {
    minWidth: 20,
    paddingHorizontal: 5,
    height: 18,
    borderRadius: rad.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgElevated,
  },
  countOn: { backgroundColor: C.primaryMuted },
  countTxt: { color: C.textSub, fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] },
  countTxtOn: { color: C.primary },
});
