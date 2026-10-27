import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconBtn } from '@/components/ui/Btn';
import { gs, sp, txt } from '@/constants/theme';

type Props = {
  title: string;
  caption?: ReactNode;
  back?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  children?: ReactNode;
};

export function Header({ title, caption, back, onBack, right, children }: Props) {
  const router = useRouter();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={s.wrap}>
      <View style={[gs.row, s.top]}>
        {back && <IconBtn icon="chevron-back" onPress={onBack ?? goBack} label="Retour" />}
        <View style={gs.fill}>
          {typeof caption === 'string' ? (
            <Text style={txt.caption} numberOfLines={1}>
              {caption}
            </Text>
          ) : (
            caption
          )}
          <Text style={txt.h1} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {!!right && <View style={[gs.row, s.right]}>{right}</View>}
      </View>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: sp.lg, paddingTop: sp.sm, paddingBottom: sp.md, gap: sp.lg },
  top: { gap: sp.md, minHeight: 48 },
  right: { gap: sp.sm },
});
