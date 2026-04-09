import { Link } from 'react-router-dom';
import {
  BarChart3,
  Box,
  CheckCircle2,
  CreditCard,
  Eye,
  MousePointerClick,
  PenSquare,
  PlusCircle,
  Settings,
  Trash2,
  Wrench,
} from 'lucide-react';
import {
  useGetMineQuery,
  useGetDashboardStatsQuery,
  useDeleteListingMutation,
  useSessionMeQuery,
} from '../store/api';
import { formatPrice } from '../lib/formatPrice';
import { listingStatusLabel } from '../lib/listingStatusLabels';
import { useSeo } from '../lib/seo';
import Avatar from '../components/Avatar';

export default function DashboardPage() {
  const { data: mine, isLoading } = useGetMineQuery();
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: me } = useSessionMeQuery();
  const [deleteListing, { isLoading: deleting }] = useDeleteListingMutation();

  const limits = me?.limits;
  const maxImg = limits?.maxImagesPerListing ?? 3;
  const listings = mine?.listings ?? [];
  const activeCount = listings.filter((l) => (l.status || 'inStock') === 'inStock').length;
  const unavailableCount = listings.filter((l) => (l.status || 'inStock') === 'outOfStock').length;
  const soldOrDoneCount = listings.filter((l) => (l.status || 'inStock') === 'sold').length;
  useSeo({
    title: 'Dashboard',
    description: 'Manage your listings, monitor views and contacts, and update your seller workspace.',
    path: '/dashboard',
    noindex: true,
  });

  return (
    <div className="container">
      <header className="page-surface page-surface--page-header dashboard-shell__header">
        <div className="dashboard-shell__identity">
          <Avatar name={me?.user?.name ?? 'You'} seed={me?.user?.id} size="lg" />
          <div className="page-surface__grow">
            <p className="page-header-eyebrow">Seller workspace</p>
            <h1 className="page-header-title">Dashboard</h1>
            <p className="page-header-subtitle">Manage products and services, and track buyer engagement.</p>
          </div>
        </div>
        <div className="dashboard-shell__actions">
          <Link to="/billing" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
            <span className="ui-icon-label"><CreditCard size={16} />Billing</span>
          </Link>
          <Link to="/profile" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
            <span className="ui-icon-label"><Settings size={16} />Profile</span>
          </Link>
          <Link to="/sell" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <span className="ui-icon-label"><PlusCircle size={16} />New listing</span>
          </Link>
        </div>
      </header>

      {limits && (
        <div className="card dashboard-banner">
          <div className="dashboard-banner__text">
            <strong style={{ color: 'var(--color-text)' }}>Photos per product:</strong> up to {maxImg} images
            {!me?.user.listingImagePackPurchased && (
              <>
                {' '}
                (free: {limits.freeMaxImages}; unlock 10 for Rs. {limits.imagePackPriceLkr})
              </>
            )}
            {me?.user.featuredTokens ? (
              <>
                {' '}
                · <strong>{me.user.featuredTokens}</strong> featured credit{me.user.featuredTokens !== 1 ? 's' : ''}
              </>
            ) : null}
          </div>
          <p className="dashboard-banner__hint">Use Billing to unlock more photo capacity and featured credits.</p>
        </div>
      )}

      <div className="dashboard-overview">
        <div className="dashboard-overview__item">
          <CheckCircle2 size={15} />
          <span>{activeCount} active</span>
        </div>
        <div className="dashboard-overview__item">
          <Box size={15} />
          <span>{unavailableCount} unavailable</span>
        </div>
        <div className="dashboard-overview__item">
          <BarChart3 size={15} />
          <span>{soldOrDoneCount} sold/completed</span>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-card__label">Listings</p>
          <p className="stat-card__value"><span className="ui-icon-label"><BarChart3 size={18} />{stats?.listingCount ?? '—'}</span></p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Total views</p>
          <p className="stat-card__value"><span className="ui-icon-label"><Eye size={18} />{stats?.totalViews ?? '—'}</span></p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Contact clicks</p>
          <p className="stat-card__value"><span className="ui-icon-label"><MousePointerClick size={18} />{stats?.totalContactClicks ?? '—'}</span></p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Services listed</p>
          <p className="stat-card__value">
            <span className="ui-icon-label"><Wrench size={18} />{listings.filter((l) => (l.type || 'product') === 'service').length}</span>
          </p>
        </div>
      </div>

      <div className="dashboard-list__head">
        <h2 className="section-title">Your listings</h2>
      </div>

      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : !listings.length ? (
        <p className="text-muted">
          You have no listings yet. <Link to="/sell">Create your first listing</Link>
        </p>
      ) : (
        <div className="dashboard-list">
          {listings.map((l) => (
            <div key={l.id} className="card listing-row">
              <div className="listing-row__main">
                {l.images[0] ? (
                  <img className="listing-row__thumb" src={l.images[0]} alt="" />
                ) : (
                  <div className="listing-row__thumb" aria-hidden />
                )}
                <div style={{ minWidth: 0 }}>
                  <Link to={`/listings/${l.id}`} className="listing-row__title">
                    {l.title}
                  </Link>
                  <p className="listing-row__meta">
                    <span className={`pill ${(l.type || 'product') === 'service' ? 'pill--service' : 'pill--product'}`}>
                      {(l.type || 'product') === 'service' ? 'Service' : 'Product'}
                    </span>
                    {' '}
                    <span
                      className={`pill ${
                        (l.status || 'inStock') === 'sold'
                          ? 'pill--status-sold'
                          : (l.status || 'inStock') === 'outOfStock'
                            ? 'pill--status-out'
                            : 'pill--status-in'
                      }`}
                    >
                      {listingStatusLabel(l.status, (l.type || 'product') === 'service' ? 'service' : 'product')}
                    </span>
                  </p>
                  <p className="listing-row__price">{formatPrice(l.price, l.currency || 'USD')}</p>
                  <p className="listing-row__meta">
                    {l.views} views · {l.contactClicks} contacts
                  </p>
                </div>
              </div>
              <div className="listing-row__actions">
                <Link to={`/listings/${l.id}/edit`} className="btn btn-ghost" style={{ textDecoration: 'none' }}>
                  <span className="ui-icon-label"><PenSquare size={16} />Edit</span>
                </Link>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={deleting || l.id.startsWith('optimistic-')}
                  onClick={() => {
                    if (window.confirm('Delete this listing?')) void deleteListing(l.id);
                  }}
                >
                  <span className="ui-icon-label"><Trash2 size={16} />Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
