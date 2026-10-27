const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

const pad = (n: number) => n.toString().padStart(2, '0');
const num = (v?: string) => Number(v ?? 0);

export const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;

export const today = () => new Date().toISOString().split('T')[0];

export const todayFr = () => {
  const d = new Date();
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
};

export function parseTs(s?: string | null) {
  const m = s?.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h, mi, se = '0'] = m;
  return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +se));
}

export function parseDay(date?: string | null, heure?: string | null) {
  const fr = date?.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  const iso = date?.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const ymd = fr ? { y: fr[3], mo: fr[2], d: fr[1] } : iso ? { y: iso[1], mo: iso[2], d: iso[3] } : null;
  if (!ymd) return null;
  const hm = heure?.match(/^(\d{1,2})[:hH](\d{2})/);
  return new Date(num(ymd.y), num(ymd.mo) - 1, num(ymd.d), num(hm?.[1]), num(hm?.[2]));
}

export function ago(s?: string | null) {
  const d = parseTs(s);
  if (!d) return s ?? '';
  const min = Math.round((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  if (h < 48) return 'Hier';
  return `${d.getDate()} ${MOIS[d.getMonth()]}`;
}

export function dateLabel(s?: string | null) {
  const d = parseTs(s) ?? parseDay(s);
  return d ? `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}` : s ?? '';
}

export const dayLabel = (d: Date) => `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;

export const monthShort = (d: Date) => MOIS[d.getMonth()].replace('.', '').toUpperCase();
