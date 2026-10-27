import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { usePress } from '@/components/ui/Btn';
import { C, rad, sp } from '@/constants/theme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  pad?: number;
  elevated?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, onPress, onLongPress, pad = sp.lg, elevated, disabled, style }: Props) {
  const press = usePress(0.98);
  const base = [s.card, { padding: pad }, elevated && s.elevated, style];

  if (!onPress && !onLongPress) return <View style={base}>{children}</View>;

  return (
    <Animated.View style={press.style}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        disabled={disabled}
        style={({ pressed }) => [base, pressed && s.pressed]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.bgCard,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: C.border,
  },
  elevated: { backgroundColor: C.bgElevated },
  pressed: { borderColor: C.borderFocus },
});
