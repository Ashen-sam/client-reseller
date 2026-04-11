import { useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, Mail, Phone, Save, Settings, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AVATAR_STYLES, AVATAR_STYLE_LABELS, type AvatarStyle } from '../lib/avatarStyles';
import { useSeo } from '../lib/seo';
import { useChangePasswordMutation, useUpdateProfileMutation } from '../store/api';
import { useSessionMeQuery } from '../hooks/useSessionMeQuery';
import { useAppDispatch } from '../store/hooks';
import { setSession } from '../store/authSlice';
import Avatar from '../components/Avatar';

function apiMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === 'object' && 'message' in data) {
      return String((data as { message: string }).message);
    }
  }
  return fallback;
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { data: me } = useSessionMeQuery();
  const [updateProfile, { isLoading: savingProfile, error: profileError }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: savingPassword, error: passwordError }] = useChangePasswordMutation();
  const clerkLinked = Boolean(me?.user?.clerkLinked);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('avataaars');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [profileOk, setProfileOk] = useState('');
  const [passwordOk, setPasswordOk] = useState('');
  useSeo({
    title: 'Profile Settings',
    description: 'Update your profile information and password settings for your Reseller account.',
    path: '/profile',
    noindex: true,
  });

  useEffect(() => {
    if (!me?.user) return;
    setName(me.user.name || '');
    setEmail(me.user.email || '');
    setPhone(me.user.phone || '');
    const nextStyle = (me.user.avatarStyle as AvatarStyle) || 'avataaars';
    setAvatarStyle(AVATAR_STYLES.includes(nextStyle) ? nextStyle : 'avataaars');
  }, [me?.user]);

  async function onProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileOk('');
    const res = await updateProfile({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      avatarStyle,
    }).unwrap();
    dispatch(setSession({ user: res.user, limits: res.limits }));
    setProfileOk('Profile updated successfully.');
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordOk('');
    await changePassword({ currentPassword, newPassword }).unwrap();
    setCurrentPassword('');
    setNewPassword('');
    setPasswordOk('Password changed successfully.');
  }

  return (
    <div className="container">
      <header className="page-surface page-surface--page-header page-surface--split">
        <Avatar
          name={me?.user?.name ?? 'You'}
          seed={me?.user?.id}
          avatarStyle={avatarStyle}
          size="lg"
        />
        <div className="page-surface__grow">
          <p className="page-header-eyebrow">Account settings</p>
          <h1 className="page-header-title">
            <span className="ui-icon-label">
              <Settings size={20} />
              Profile
            </span>
          </h1>
          <p className="page-header-subtitle">
            Manage your personal details and security settings. <Link to="/dashboard">Back to dashboard</Link>
          </p>
        </div>
      </header>

      <section className="auth-shell profile-shell" style={{ marginTop: '1rem' }}>
        <form className="auth-card auth-card--pro" onSubmit={(e) => void onProfileSubmit(e)}>
          <div className="auth-card__header">
            <p className="auth-card__eyebrow">Account settings</p>
            <h2 className="auth-card__title">Manage profile</h2>
            <p className="auth-card__subtitle">
              Update your name and phone number
              {clerkLinked ? ' (email is managed in your Clerk account).' : ', and email.'}
            </p>
          </div>
          {profileOk && <div className="success-banner">{profileOk}</div>}
          {profileError && <div className="error-banner">{apiMessage(profileError, 'Could not update profile')}</div>}

          <div className="field">
            <label htmlFor="profile-name">Name</label>
            <div className="field-with-icon">
              <UserRound className="field-with-icon__icon" size={16} />
              <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="profile-email">Email</label>
            <div className="field-with-icon">
              <Mail className="field-with-icon__icon" size={16} />
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                readOnly={clerkLinked}
                title={clerkLinked ? 'Change email in your Clerk account' : undefined}
                style={clerkLinked ? { opacity: 0.85 } : undefined}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="profile-phone">Phone</label>
            <div className="field-with-icon">
              <Phone className="field-with-icon__icon" size={16} />
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="94771234567"
              />
            </div>
          </div>
          <div className="field">
            <label>Avatar style</label>
            <div className="avatar-picker" role="radiogroup" aria-label="Select avatar style">
              {AVATAR_STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`avatar-picker__item${avatarStyle === s ? ' is-active' : ''}`}
                  onClick={() => setAvatarStyle(s)}
                  role="radio"
                  aria-checked={avatarStyle === s}
                >
                  <Avatar name={name || me?.user?.name || 'You'} seed={me?.user?.id || email || 'me'} avatarStyle={s} size="sm" />
                  <span>{AVATAR_STYLE_LABELS[s]}</span>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={savingProfile}>
            <span className="ui-icon-label">
              <Save size={16} />
              {savingProfile ? 'Saving...' : 'Save profile'}
            </span>
          </button>
        </form>

        {clerkLinked ? (
          <div className="auth-card auth-card--pro">
            <div className="auth-card__header">
              <p className="auth-card__eyebrow">Security</p>
              <h2 className="auth-card__title">Password & sign-in</h2>
              <p className="auth-card__subtitle">
                Your password and social logins are managed by Clerk. Use the sign-in page or your Clerk user profile
                to update them.
              </p>
            </div>
          </div>
        ) : (
          <form className="auth-card auth-card--pro" onSubmit={(e) => void onPasswordSubmit(e)}>
            <div className="auth-card__header">
              <p className="auth-card__eyebrow">Security</p>
              <h2 className="auth-card__title">Change password</h2>
              <p className="auth-card__subtitle">Keep your account secure with a fresh password.</p>
            </div>
            <div className="profile-security-note">
              <p className="profile-security-note__title">Password requirements</p>
              <ul className="profile-security-note__list">
                <li>At least 6 characters</li>
                <li>Use letters and numbers</li>
                <li>Avoid reusing old passwords</li>
              </ul>
            </div>
            {passwordOk && <div className="success-banner">{passwordOk}</div>}
            {passwordError && <div className="error-banner">{apiMessage(passwordError, 'Could not change password')}</div>}

            <div className="profile-security-grid">
              <div className="field">
                <label htmlFor="current-password">Current password</label>
                <div className="field-with-icon">
                  <KeyRound className="field-with-icon__icon" size={16} />
                  <input
                    id="current-password"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="field-with-icon__toggle"
                    onClick={() => setShowCurrent((v) => !v)}
                    aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="field">
                <label htmlFor="new-password">New password</label>
                <div className="field-with-icon">
                  <KeyRound className="field-with-icon__icon" size={16} />
                  <input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="field-with-icon__toggle"
                    onClick={() => setShowNew((v) => !v)}
                    aria-label={showNew ? 'Hide new password' : 'Show new password'}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={savingPassword}>
              <span className="ui-icon-label">
                <KeyRound size={16} />
                {savingPassword ? 'Updating...' : 'Update password'}
              </span>
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
