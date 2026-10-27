import { StyleSheet } from 'react-native';

export const C = {
  bgMain: '#090D16',
  bgCard: '#121826',
  bgElevated: '#1C2536',
  border: '#263248',
  borderFocus: '#3B82F6',
  divider: '#1E293B',
  primary: '#3B82F6',
  primaryMuted: 'rgba(59, 130, 246, 0.15)',
  accent: '#06B6D4',
  accentMuted: 'rgba(6, 182, 212, 0.15)',
  live: '#F59E0B',
  liveMuted: 'rgba(245, 158, 11, 0.15)',
  success: '#10B981',
  successMuted: 'rgba(16, 185, 129, 0.15)',
  danger: '#EF4444',
  dangerMuted: 'rgba(239, 68, 68, 0.15)',
  textMain: '#F8FAFC',
  textSub: '#94A3B8',
  textMuted: '#64748B',
  overlay: 'rgba(3, 6, 12, 0.75)',
  white: '#FFFFFF',
} as const;

export type Tone = 'primary' | 'accent' | 'live' | 'success' | 'danger' | 'muted';

export const tone: Record<Tone, { fg: string; bg: string }> = {
  primary: { fg: C.primary, bg: C.primaryMuted },
  accent: { fg: C.accent, bg: C.accentMuted },
  live: { fg: C.live, bg: C.liveMuted },
  success: { fg: C.success, bg: C.successMuted },
  danger: { fg: C.danger, bg: C.dangerMuted },
  muted: { fg: C.textSub, bg: C.bgElevated },
};

export const sp = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const rad = { sm: 8, md: 12, lg: 16, full: 999 } as const;

export const hit = { top: 10, bottom: 10, left: 10, right: 10 };

export const txt = StyleSheet.create({
  h1: { color: C.textMain, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  h2: { color: C.textMain, fontSize: 18, fontWeight: '700' },
  body: { color: C.textMain, fontSize: 15, fontWeight: '600' },
  sub: { color: C.textSub, fontSize: 13, fontWeight: '500' },
  caption: { color: C.textSub, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  num: { fontVariant: ['tabular-nums'] },
});

export const gs = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
