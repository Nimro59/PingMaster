import { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconBtn } from '@/components/ui/Btn';
import { C, gs, rad, sp, txt } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  sub?: string;
  full?: boolean;
  children: ReactNode;
};

export function Sheet({ visible, onClose, title, sub, full, children }: Props) {
  const { bottom } = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fermer" />
        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(180)}
          style={[s.sheet, full && s.full, { paddingBottom: bottom + sp.lg }]}
        >
          <View style={s.grab} />
          {!!title && (
            <View style={[gs.row, s.head]}>
              <View style={gs.fill}>
                <Text style={txt.h2}>{title}</Text>
                {!!sub && <Text style={[txt.sub, s.sub]}>{sub}</Text>}
              </View>
              <IconBtn icon="close" size={36} onPress={onClose} label="Fermer" />
            </View>
          )}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', backgroundColor: C.overlay },
  sheet: {
    maxHeight: '92%',
    backgroundColor: C.bgElevated,
    borderTopLeftRadius: rad.lg + sp.sm,
    borderTopRightRadius: rad.lg + sp.sm,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: C.border,
    paddingHorizontal: sp.lg,
    paddingTop: sp.sm,
  },
  full: { height: '92%' },
  grab: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: rad.full,
    backgroundColor: C.border,
    marginBottom: sp.md,
  },
  head: { gap: sp.md, marginBottom: sp.lg },
  sub: { marginTop: 2 },
});
