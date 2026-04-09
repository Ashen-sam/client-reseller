export const AVATAR_STYLES = [
  'personas',
  'initials',
  'micah',
  'identicon',
  'shapes',
] as const;

export type AvatarStyle = (typeof AVATAR_STYLES)[number];

export const AVATAR_STYLE_LABELS: Record<AvatarStyle, string> = {
  personas: 'Seller',
  initials: 'Classic',
  micah: 'Professional',
  identicon: 'Identicon',
  shapes: 'Minimal',
};

