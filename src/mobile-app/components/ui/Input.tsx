import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { C, rad, sp, txt } from '@/constants/theme';
import type { IconName } from '@/types';

type Props = TextInputProps & {
  label?: string;
  icon?: IconName;
  right?: ReactNode;
  wrapStyle?: StyleProp<ViewStyle>;
};

export function Input({ label, icon, right, wrapStyle, style, multiline, onFocus, onBlur, ...rest }: Props) {
  const [isFocus, setFocus] = useState(false);
  return (
    <View style={wrapStyle}>
      {!!label && <Text style={[txt.caption, s.label]}>{label}</Text>}
      <View style={[s.box, multiline && s.boxMulti, isFocus && s.focus]}>
        {!!icon && <Ionicons name={icon} size={18} color={isFocus ? C.primary : C.textMuted} />}
        <TextInput
          placeholderTextColor={C.textMuted}
          selectionColor={C.primary}
          keyboardAppearance="dark"
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...rest}
          onFocus={e => {
            setFocus(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocus(false);
            onBlur?.(e);
          }}
          style={[s.input, multiline && s.inputMulti, style]}
        />
        {right}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  label: { marginBottom: sp.sm },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp.sm,
    minHeight: 48,
    paddingHorizontal: sp.md,
    backgroundColor: C.bgCard,
    borderRadius: rad.md,
    borderWidth: 1,
    borderColor: C.border,
  },
  boxMulti: { alignItems: 'flex-start', paddingVertical: sp.sm },
  focus: { backgroundColor: C.bgElevated, borderColor: C.borderFocus },
  input: { flex: 1, color: C.textMain, fontSize: 15, fontWeight: '500', paddingVertical: sp.md },
  inputMulti: { minHeight: 110, paddingVertical: sp.xs },
});
