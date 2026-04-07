function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function notionPaletteForSeed(seed: string): { bg: string; fg: string } {
  const h = hashSeed(seed) % 360;
  // Soft neutral-ish tinted backgrounds, similar to Notion's subtle avatar chips.
  const bg = `hsl(${h} 22% 92%)`;
  const fg = `hsl(${h} 18% 22%)`;
  return { bg, fg };
}

type Size = 'sm' | 'md' | 'lg';

type Props = {
  name: string;
  /** Defaults to `name` — use stable id when available for consistent colors. */
  seed?: string;
  size?: Size;
  /** Neutral gray gradient (e.g. generic “shopper”). */
  muted?: boolean;
  className?: string;
};

export default function Avatar({ name, seed, size = 'md', muted, className = '' }: Props) {
  const text = initialsFromName(name || '?');
  const s = seed ?? name ?? '?';
  const sizeClass = size === 'sm' ? 'avatar--sm' : size === 'lg' ? 'avatar--lg' : 'avatar--md';
  const palette = notionPaletteForSeed(s);
  const style = muted ? undefined : { background: palette.bg, color: palette.fg };

  return (
    <span
      className={`avatar ${sizeClass}${muted ? ' avatar--muted' : ''} ${className}`.trim()}
      style={style}
      role="img"
      aria-label={name.trim() ? name : 'User avatar'}
    >
      {text}
    </span>
  );
}
