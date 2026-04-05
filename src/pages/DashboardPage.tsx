import { Link } from 'react-router-dom';
import {
  useGetMineQuery,
  useGetDashboardStatsQuery,
  useDeleteListingMutation,
  useGetMeQuery,
} from '../store/api';
import { formatPrice } from '../lib/formatPrice';
import Avatar from '../components/Avatar';

export default function DashboardPage() {
  const { data: mine, isLoading } = useGetMineQuery();
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: me } = useGetMeQuery();
  const [deleteListing, { isLoading: deleting }] = useDeleteListingMutation();

  const limits = me?.limits;
  const maxImg = limits?.maxImagesPerListing ?? 3;

  return (
    <div className="container">
      <header className="page-surface page-surface--page-header page-surface--split">
        <Avatar name={me?.user?.name ?? 'You'} seed={me?.user?.id} size="lg" />
        <div className="page-surface__grow">
          <p className="page-header-eyebrow">Your account</p>
          <h1 className="page-header-title">Dashboard</h1>
          <p className="page-header-subtitle">Track your listings and how buyers engage with them.</p>
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
          <Link to="/billing" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
            Plans & billing
          </Link>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-card__label">Listings</p>
          <p className="stat-card__value">{stats?.listingCount ?? '—'}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Total views</p>
          <p className="stat-card__value">{stats?.totalViews ?? '—'}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Contact clicks</p>
          <p className="stat-card__value">{stats?.totalContactClicks ?? '—'}</p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <h2 className="section-title">Your products</h2>
        <Link to="/sell" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Add product
        </Link>
      </div>

      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : !mine?.listings?.length ? (
        <p className="text-muted">
          You have no listings yet. <Link to="/sell">Create your first product</Link>
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {mine.listings.map((l) => (
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
                  <p className="listing-row__price">{formatPrice(l.price, l.currency || 'USD')}</p>
                  <p className="listing-row__meta">
                    {l.views} views · {l.contactClicks} contacts
                  </p>
                </div>
              </div>
              <div className="listing-row__actions">
                <Link to={`/listings/${l.id}/edit`} className="btn btn-ghost" style={{ textDecoration: 'none' }}>
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={deleting || l.id.startsWith('optimistic-')}
                  onClick={() => {
                    if (window.confirm('Delete this listing?')) void deleteListing(l.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
