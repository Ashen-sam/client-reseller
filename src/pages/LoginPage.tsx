import { SignIn, useAuth } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ShoppingBag } from 'lucide-react';
import { useSessionMeQuery } from '../hooks/useSessionMeQuery';
import PageLoader from '../components/PageLoader';
import { useSeo } from '../lib/seo';

function redirectAfterLogin(
  role: 'user' | 'admin',
  from: string,
): string {
  const generic = !from || from === '/' || from.startsWith('/login');
  if (role === 'admin' && generic) return '/admin';
  if (generic) return '/';
  return from;
}

/** Only allow same-origin relative paths (avoid open redirects). */
function safeReturnPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

export default function LoginPage() {
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ??
    safeReturnPath(new URLSearchParams(location.search).get('redirect_url')) ??
    '/';
  const { isLoaded, isSignedIn } = useAuth();
  const { data: me, isLoading } = useSessionMeQuery();

  useSeo({
    title: 'Log In',
    description: 'Log in to your Reseller account to manage listings, profile settings, and dashboard insights.',
    path: '/login',
    noindex: true,
  });

  if (!isLoaded) return <PageLoader message="Loading…" />;

  if (isSignedIn && isLoading) return <PageLoader message="Preparing your session…" />;

  if (isSignedIn && me?.user) {
    const to = redirectAfterLogin(me.user.role, from);
    return <Navigate to={to} replace />;
  }

  // Clerk session is ready but `/me` is still syncing — leave login so we do not fight Clerk’s UI,
  // and avoid `fallbackRedirectUrl` (removed) which was forcing extra navigations.
  if (isSignedIn) {
    const safeFrom =
      from && from !== '/login' && !from.startsWith('/login/') ? from : '/';
    const to = redirectAfterLogin('user', safeFrom);
    return <Navigate to={to} replace />;
  }

  return (
    <div className="container auth-page">
      <section className="auth-shell">
        <aside className="auth-brand">
          <div className="auth-brand__badge">
            <ShoppingBag size={16} />
            <span>Reseller</span>
          </div>
          <h1 className="auth-brand__title">Sell smarter with a trusted marketplace.</h1>
          <p className="auth-brand__subtitle">
            Manage listings, track views, and reach buyers with a clean dashboard experience.
          </p>
          <div className="auth-brand__point">
            <ShieldCheck size={16} />
            <span>Secure sign-in with Clerk (Google or email)</span>
          </div>
        </aside>

        <div className="auth-card auth-card--pro clerk-auth-card">
          <SignIn routing="path" path="/login" signUpUrl="/register" />
        </div>
      </section>
    </div>
  );
}
