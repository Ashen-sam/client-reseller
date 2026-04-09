export const AVATAR_STYLES = [
  'avataaars',
  'adventurer',
  'adventurer-neutral',
  'lorelei',
  'lorelei-neutral',
] as const;

export type AvatarStyle = (typeof AVATAR_STYLES)[number];

export const AVATAR_STYLE_LABELS: Record<AvatarStyle, string> = {
  avataaars: 'Male avatar',
  adventurer: 'Male seller',
  'adventurer-neutral': 'Neutral seller',
  lorelei: 'Female avatar',
  'lorelei-neutral': 'Female seller',
};

