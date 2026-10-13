/**
 * Utilitários de data no padrão brasileiro.
 * A API trabalha em ISO (AAAA-MM-DD); a tela sempre mostra DD/MM/AAAA.
 */

const pad = (n: number) => String(n).padStart(2, '0');

function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayIso(): string {
  return toIso(new Date());
}

export function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toIso(d);
}

/** "2026-10-25" → "25/10/2026" (retorna o original se não reconhecer). */
export function isoToBr(iso?: string | null): string {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

/** "25/10/2026" → "2026-10-25" (null se inválida). */
export function brToIso(br: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br.trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (d.getDate() !== Number(dd) || d.getMonth() !== Number(mm) - 1) return null;
  return `${yyyy}-${mm}-${dd}`;
}

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

/** "2026-10-25" → "Sábado, 25/10/2026" */
export function formatSessionDate(iso?: string | null): string {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return `${WEEKDAYS[d.getDay()]}, ${isoToBr(iso)}`;
}

/** "07:00" + "09:30" → "07:00 às 09:30" */
export function formatTimeRange(start?: string | null, end?: string | null): string {
  if (!start) return '';
  return end ? `${start} às ${end}` : start;
}
