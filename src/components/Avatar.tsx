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

function gradientForSeed(seed: string): string {
  const h = hashSeed(seed) % 320;
  const h2 = (h + 48) % 360;
  return `linear-gradient(135deg, hsl(${h} 52% 40%) 0%, hsl(${h2} 48% 32%) 100%)`;
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
  const style = muted ? undefined : { background: gradientForSeed(s) };

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
