import * as Haptics from 'expo-haptics';

const safe = (p: Promise<void>) => {
  p.catch(() => {});
};

export const hap = {
  tap: () => safe(Haptics.selectionAsync()),
  hit: () => safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  ok: () => safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  err: () => safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
