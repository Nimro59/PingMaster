import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { usePress } from '@/components/ui/Btn';
import { C, rad, sp } from '@/constants/theme';
import type { IconName } from '@/types';
import { hap } from '@/utils/hap';

type Props = {
  icon: IconName;
  onPress: () => void;
  label?: string;
  a11y?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function Fab({ icon, onPress, label, a11y, color = C.primary, style }: Props) {
  const press = usePress(0.94);
  return (
    <Animated.View style={[s.wrap, press.style, style]}>
      <Pressable
        onPress={() => {
          hap.hit();
          onPress();
        }}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        accessibilityRole="button"
        accessibilityLabel={label ?? a11y}
        style={[s.fab, !!label && s.ext, { backgroundColor: color, shadowColor: color }]}
      >
        <Ionicons name={icon} size={24} color={C.white} />
        {!!label && <Text style={s.label}>{label}</Text>}
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', right: sp.lg, bottom: sp.xl },
  fab: {
    height: 56,
    minWidth: 56,
    borderRadius: rad.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sp.sm,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  ext: { paddingHorizontal: sp.xl },
  label: { color: C.white, fontSize: 15, fontWeight: '700' },
});
