import { useEffect, useId, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { CreditCard, LayoutDashboard, LogIn, LogOut, Shield, ShoppingBag, Store, UserPlus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { api, useLogoutMutation, useGetMeQuery } from '../store/api';
import { clearAuth } from '../store/authSlice';
import { clearAuthToken } from '../lib/authToken';

export default function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((s) => s.auth.user);
  const { data: me } = useGetMeQuery(undefined, { refetchOnMountOrArgChange: true });
  const user = me?.user ?? reduxUser;
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
      await logout().unwrap();
    } finally {
      clearAuthToken();
      dispatch(api.util.resetApiState());
      dispatch(clearAuth());
    }
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
                  to="/billing"
                  className={({ isActive }) =>
                    `site-nav__link${isActive ? ' site-nav__link--active' : ''}`
                  }
                >
                  <span className="ui-icon-label"><CreditCard size={16} />Billing</span>
                </NavLink>
                {user.role === 'admin' && (
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.25rem' }}>
                <span className="site-nav__user" title={user.name}>
                  {user.name}
                </span>
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
              <div className="site-nav-drawer__user">{user.name}</div>
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
              {user.role === 'admin' && (
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
        List products, connect with buyers directly. No in-app checkout — you arrange payment with the seller.
      </footer>
    </div>
  );
}
