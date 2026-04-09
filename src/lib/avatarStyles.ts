export const AVATAR_STYLES = [
  'adventurer',
  'avataaars',
  'bottts',
  'identicon',
  'lorelei',
] as const;

export type AvatarStyle = (typeof AVATAR_STYLES)[number];

export const AVATAR_STYLE_LABELS: Record<AvatarStyle, string> = {
  adventurer: 'Adventurer',
  avataaars: 'Avataaars',
  bottts: 'Bots',
  identicon: 'Identicon',
  lorelei: 'Lorelei',
};

