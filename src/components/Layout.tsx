import { useEffect, useId, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, useClerk, useUser } from '@clerk/clerk-react';
import { CreditCard, LayoutDashboard, LogIn, LogOut, Settings, Shield, ShoppingBag, Store, UserPlus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearAuth } from '../store/authSlice';
import { useLogoutMutation, api } from '../store/api';
import { useSessionMeQuery } from '../hooks/useSessionMeQuery';
import type { User } from '../types';
import Avatar from './Avatar';

function headerUserFromClerk(cu: {
  id: string;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
}): User {
  const email = cu.primaryEmailAddress?.emailAddress ?? '';
  const name =
    cu.fullName?.trim() ||
    [cu.firstName, cu.lastName].filter(Boolean).join(' ').trim() ||
    cu.username?.trim() ||
    (email ? email.split('@')[0] : '') ||
    'You';
  return {
    id: cu.id,
    email,
    name,
    role: 'user',
    listingImagePackPurchased: false,
    featuredTokens: 0,
    avatarStyle: 'avataaars',
    clerkLinked: true,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { user: clerkUser, isLoaded: clerkUserLoaded } = useUser();
  const { signOut } = useClerk();
  const reduxUser = useAppSelector((s) => s.auth.user);
  const { data: me } = useSessionMeQuery();
  const resolvedApiUser = me?.user ?? reduxUser ?? null;
  const provisionalUser =
    isSignedIn && clerkUserLoaded && clerkUser && !resolvedApiUser
      ? headerUserFromClerk(clerkUser)
      : null;
  const user = isSignedIn ? (resolvedApiUser ?? provisionalUser) : null;
  const isAdmin = resolvedApiUser?.role === 'admin';
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    try {
      await signOut();
    } catch {
      /* continue clearing app state */
    }
    dispatch(clearAuth());
    dispatch(api.util.resetApiState());
    try {
      await logout().unwrap();
    } catch {
      /* cookie clear is best-effort */
    }
    navigate('/', { replace: true });
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `site-nav-drawer__link${isActive ? ' site-nav-drawer__link--active' : ''}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-logo" onClick={() => setMenuOpen(false)}>
            Reseller<span>.</span>
          </Link>
          <button
            type="button"
            className="site-nav__toggle"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="site-nav__toggle-bar" aria-hidden />
          </button>
          <nav className="site-nav site-nav--desktop" aria-label="Main">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `site-nav__link${isActive ? ' site-nav__link--active' : ''}`
              }
            >
              <span className="ui-icon-label"><Store size={16} />Marketplace</span>
            </NavLink>
            {user && (
              <>
                <NavLink
                  to="/sell"
                  className={({ isActive }) =>
                    `site-nav__link${isActive ? ' site-nav__link--active' : ''}`
                  }
                >
                  <span className="ui-icon-label"><ShoppingBag size={16} />Sell</span>
                </NavLink>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `site-nav__link${isActive ? ' site-nav__link--active' : ''}`
                  }
                >
                  <span className="ui-icon-label"><LayoutDashboard size={16} />Dashboard</span>
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `site-nav__link${isActive ? ' site-nav__link--active' : ''}`
                  }
                >
                  <span className="ui-icon-label"><Settings size={16} />Profile</span>
                </NavLink>
                <NavLink
                  to="/billing"
                  className={({ isActive }) =>
                    `site-nav__link${isActive ? ' site-nav__link--active' : ''}`
                  }
                >
                  <span className="ui-icon-label"><CreditCard size={16} />Billing</span>
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `site-nav__link${isActive ? ' site-nav__link--active' : ''}`
                    }
                  >
                    <span className="ui-icon-label"><Shield size={16} />Admin</span>
                  </NavLink>
                )}
              </>
            )}
            {user ? (
              <span className="site-nav__account" title={user.name}>
                <Avatar
                  name={user.name}
                  seed={user.id}
                  avatarStyle={user.avatarStyle}
                  size="sm"
                  className="site-nav__avatar"
                />
                <span className="site-nav__user">{user.name}</span>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={loggingOut}
                  onClick={() => void handleLogout()}
                >
                  <span className="ui-icon-label"><LogOut size={16} />Log out</span>
                </button>
              </span>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `site-nav__link${isActive ? ' site-nav__link--active' : ''}`
                  }
                >
                  <span className="ui-icon-label"><LogIn size={16} />Log in</span>
                </NavLink>
                <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  <span className="ui-icon-label"><UserPlus size={16} />Sign up</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div
        id={menuId}
        className={`site-nav-drawer${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="site-nav-drawer__backdrop"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
        />
        <div className="site-nav-drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">
          <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
            <span className="ui-icon-label"><Store size={16} />Marketplace</span>
          </NavLink>
          {user ? (
            <>
              <div className="site-nav-drawer__user">
                <Avatar
                  name={user.name}
                  seed={user.id}
                  avatarStyle={user.avatarStyle}
                  size="sm"
                  className="site-nav-drawer__avatar"
                />
                <span className="site-nav-drawer__user-name">{user.name}</span>
              </div>
              <div className="site-nav-drawer__divider" />
              <NavLink to="/sell" className={linkClass} onClick={() => setMenuOpen(false)}>
                <span className="ui-icon-label"><ShoppingBag size={16} />Sell</span>
              </NavLink>
              <NavLink to="/dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>
                <span className="ui-icon-label"><LayoutDashboard size={16} />Dashboard</span>
              </NavLink>
              <NavLink to="/billing" className={linkClass} onClick={() => setMenuOpen(false)}>
                <span className="ui-icon-label"><CreditCard size={16} />Billing</span>
              </NavLink>
              <NavLink to="/profile" className={linkClass} onClick={() => setMenuOpen(false)}>
                <span className="ui-icon-label"><Settings size={16} />Profile</span>
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={linkClass} onClick={() => setMenuOpen(false)}>
                  <span className="ui-icon-label"><Shield size={16} />Admin</span>
                </NavLink>
              )}
              <div className="site-nav-drawer__divider" />
              <button
                type="button"
                className="site-nav-drawer__link"
                style={{ border: 'none', width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer' }}
                disabled={loggingOut}
                onClick={() => void handleLogout()}
              >
                <span className="ui-icon-label"><LogOut size={16} />Log out</span>
              </button>
            </>
          ) : (
            <>
              <div className="site-nav-drawer__divider" />
              <NavLink to="/login" className={linkClass} onClick={() => setMenuOpen(false)}>
                <span className="ui-icon-label"><LogIn size={16} />Log in</span>
              </NavLink>
              <NavLink to="/register" className={linkClass} onClick={() => setMenuOpen(false)}>
                <span className="ui-icon-label"><UserPlus size={16} />Sign up</span>
              </NavLink>
            </>
          )}
        </div>
      </div>

      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          List products, connect with buyers directly. No in-app checkout — you arrange payment with the seller.
        </div>
      </footer>
    </div>
  );
}
