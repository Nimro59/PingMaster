import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { C, hit, rad, sp } from '@/constants/theme';
import type { IconName } from '@/types';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  isLoad?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const look: Record<Variant, { bg: string; fg: string; bd: string }> = {
  primary: { bg: C.primary, fg: C.white, bd: C.primary },
  secondary: { bg: C.bgElevated, fg: C.textMain, bd: C.border },
  ghost: { bg: 'transparent', fg: C.textSub, bd: 'transparent' },
  danger: { bg: C.dangerMuted, fg: C.danger, bd: 'rgba(239, 68, 68, 0.35)' },
};

const height: Record<Size, number> = { sm: 36, md: 48, lg: 56 };

export function usePress(to = 0.97) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return {
    style,
    onPressIn: () => {
      scale.value = withTiming(to, { duration: 90 });
    },
    onPressOut: () => {
      scale.value = withSpring(1, { damping: 14, stiffness: 260 });
    },
  };
}

export function Btn({ label, onPress, variant = 'primary', size = 'md', icon, isLoad, disabled, style }: Props) {
  const { bg, fg, bd } = look[variant];
  const press = usePress();
  const isSm = size === 'sm';
  return (
    <Animated.View style={[press.style, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        disabled={disabled || isLoad}
        hitSlop={isSm ? hit : undefined}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled, busy: !!isLoad }}
        style={[s.base, { height: height[size], backgroundColor: bg, borderColor: bd }, isSm && s.sm, disabled && s.off]}
      >
        {isLoad ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {!!icon && <Ionicons name={icon} size={isSm ? 16 : 18} color={fg} />}
            <Text style={[s.label, isSm && s.labelSm, { color: fg }]} numberOfLines={1}>
              {label}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

type IconProps = {
  icon: IconName;
  onPress?: () => void;
  label?: string;
  color?: string;
  bg?: string;
  border?: string;
  size?: number;
  iconSize?: number;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconBtn({
  icon,
  onPress,
  label,
  color = C.textMain,
  bg = C.bgCard,
  border = C.border,
  size = 40,
  iconSize,
  disabled,
  selected,
  style,
}: IconProps) {
  const press = usePress(0.9);
  return (
    <Animated.View style={[press.style, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        disabled={disabled}
        hitSlop={hit}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled, selected: !!selected }}
        style={[
          s.icon,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, borderColor: border },
          disabled && s.off,
        ]}
      >
        <Ionicons name={icon} size={iconSize ?? Math.round(size * 0.5)} color={color} />
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sp.sm,
    paddingHorizontal: sp.xl,
    borderRadius: rad.md,
    borderWidth: 1,
  },
  sm: { paddingHorizontal: sp.md, borderRadius: rad.sm, gap: sp.xs },
  off: { opacity: 0.4 },
  label: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  labelSm: { fontSize: 13 },
  icon: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
