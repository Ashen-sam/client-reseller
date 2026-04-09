import { type AvatarStyle } from '../lib/avatarStyles';

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function dicebearUrl(style: AvatarStyle, seed: string): string {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;
}

type Size = 'sm' | 'md' | 'lg';

type Props = {
  name: string;
  /** Defaults to `name` — use stable id when available for consistent colors. */
  seed?: string;
  avatarStyle?: AvatarStyle;
  size?: Size;
  /** Neutral gray gradient (e.g. generic “shopper”). */
  muted?: boolean;
  className?: string;
};

export default function Avatar({ name, seed, avatarStyle = 'avataaars', size = 'md', muted, className = '' }: Props) {
  const text = initialsFromName(name || '?');
  const s = seed ?? name ?? '?';
  const sizeClass = size === 'sm' ? 'avatar--sm' : size === 'lg' ? 'avatar--lg' : 'avatar--md';
  const src = dicebearUrl(avatarStyle, s);

  return (
    <span
      className={`avatar ${sizeClass}${muted ? ' avatar--muted' : ''} ${className}`.trim()}
      role="img"
      aria-label={name.trim() ? name : 'User avatar'}
    >
      {!muted ? (
        <img className="avatar__img" src={src} alt="" loading="lazy" decoding="async" />
      ) : (
        text
      )}
    </span>
  );
}
