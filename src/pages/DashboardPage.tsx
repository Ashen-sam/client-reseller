import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive,
  BarChart3,
  Box,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Eye,
  MousePointerClick,
  PenSquare,
  PlusCircle,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Wrench,
} from 'lucide-react';
import {
  useGetMineQuery,
  useGetDashboardStatsQuery,
  useDeleteListingMutation,
} from '../store/api';
import { useSessionMeQuery } from '../hooks/useSessionMeQuery';
import { formatPrice } from '../lib/formatPrice';
import { listingStatusLabel } from '../lib/listingStatusLabels';
import { useSeo } from '../lib/seo';
import Avatar from '../components/Avatar';
import type { Listing } from '../types';

type StatusFilter = 'all' | 'inStock' | 'outOfStock' | 'sold';
type TypeFilter = 'all' | 'product' | 'service';
type SortKey = 'newest' | 'oldest' | 'views' | 'title' | 'priceAsc' | 'priceDesc';

function listedShort(createdAt?: string): string | null {
  if (!createdAt) return null;
  const ts = Date.parse(createdAt);
  if (!Number.isFinite(ts)) return null;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardPage() {
  const { data: mine, isLoading } = useGetMineQuery();
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: me } = useSessionMeQuery();
  const [deleteListing, { isLoading: deleting }] = useDeleteListingMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');

  const limits = me?.limits;
  const maxImg = limits?.maxImagesPerListing ?? 3;
  const listings = mine?.listings ?? [];
  const activeCount = listings.filter((l) => (l.status || 'inStock') === 'inStock').length;
  const unavailableCount = listings.filter((l) => (l.status || 'inStock') === 'outOfStock').length;
  const soldOrDoneCount = listings.filter((l) => (l.status || 'inStock') === 'sold').length;

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let rows = listings.filter((l) => {
      if (q && !l.title.toLowerCase().includes(q)) return false;
      const st = l.status || 'inStock';
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      const ty = l.type || 'product';
      if (typeFilter !== 'all' && ty !== typeFilter) return false;
      return true;
    });

    const created = (l: Listing) => {
      const t = l.createdAt ? Date.parse(l.createdAt) : 0;
      return Number.isFinite(t) ? t : 0;
    };

    rows = [...rows].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return created(b) - created(a);
        case 'oldest':
          return created(a) - created(b);
        case 'views':
          return (b.views ?? 0) - (a.views ?? 0);
        case 'title':
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        case 'priceAsc':
          return (a.price ?? 0) - (b.price ?? 0);
        case 'priceDesc':
          return (b.price ?? 0) - (a.price ?? 0);
        default:
          return 0;
      }
    });
    return rows;
  }, [listings, searchQuery, statusFilter, typeFilter, sortBy]);

  useSeo({
    title: 'Dashboard',
    description: 'Manage your listings, monitor views and contacts, and update your seller workspace.',
    path: '/dashboard',
    noindex: true,
  });

  return (
    <div className="container dashboard-page">
      <header className="page-surface page-surface--page-header dashboard-shell__header">
        <div className="dashboard-shell__identity">
          <Avatar
            name={me?.user?.name ?? 'You'}
            seed={me?.user?.id}
            avatarStyle={me?.user?.avatarStyle}
            size="lg"
          />
          <div className="page-surface__grow">
            <p className="page-header-eyebrow">Seller workspace</p>
            <h1 className="page-header-title">Dashboard</h1>
            <p className="page-header-subtitle">Manage products and services, and track buyer engagement.</p>
          </div>
        </div>
        <div className="dashboard-shell__actions">
          <Link to="/billing" className="btn btn-ghost btn--sm" style={{ textDecoration: 'none' }}>
            <span className="ui-icon-label"><CreditCard size={14} />Billing</span>
          </Link>
          <Link to="/profile" className="btn btn-ghost btn--sm" style={{ textDecoration: 'none' }}>
            <span className="ui-icon-label"><Settings size={14} />Profile</span>
          </Link>
          <Link to="/sell" className="btn btn-primary btn--sm" style={{ textDecoration: 'none' }}>
            <span className="ui-icon-label"><PlusCircle size={14} />New listing</span>
          </Link>
        </div>
      </header>

      {limits && (
        <div className="dashboard-banner">
          <div className="dashboard-banner__text">
            <strong style={{ color: 'var(--color-text)' }}>Photos per product:</strong> up to {maxImg} images
            {!me?.user.listingImagePackPurchased && (
              <>
                {' '}
                (free: {limits.freeMaxImages}; unlock {limits.paidMaxImagesPerListing ?? 8} for Rs.{' '}
                {limits.imagePackPriceLkr})
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

      <div className="dashboard-overview" role="group" aria-label="Filter by listing status">
        <button
          type="button"
          className={`dashboard-overview__chip${statusFilter === 'all' ? ' is-active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <BarChart3 size={13} aria-hidden />
          <span>All ({listings.length})</span>
        </button>
        <button
          type="button"
          className={`dashboard-overview__chip${statusFilter === 'inStock' ? ' is-active' : ''}`}
          onClick={() => setStatusFilter('inStock')}
        >
          <CheckCircle2 size={13} aria-hidden />
          <span>Active ({activeCount})</span>
        </button>
        <button
          type="button"
          className={`dashboard-overview__chip${statusFilter === 'outOfStock' ? ' is-active' : ''}`}
          onClick={() => setStatusFilter('outOfStock')}
        >
          <Box size={13} aria-hidden />
          <span>Unavailable ({unavailableCount})</span>
        </button>
        <button
          type="button"
          className={`dashboard-overview__chip${statusFilter === 'sold' ? ' is-active' : ''}`}
          onClick={() => setStatusFilter('sold')}
        >
          <Archive size={13} aria-hidden />
          <span>Sold ({soldOrDoneCount})</span>
        </button>
      </div>

      <div className="stat-grid dashboard-stat-grid">
        <div className="stat-card">
          <p className="stat-card__label">Listings</p>
          <p className="stat-card__value">
            <span className="ui-icon-label"><BarChart3 size={15} />{stats?.listingCount ?? '—'}</span>
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Total views</p>
          <p className="stat-card__value">
            <span className="ui-icon-label"><Eye size={15} />{stats?.totalViews ?? '—'}</span>
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Contact clicks</p>
          <p className="stat-card__value">
            <span className="ui-icon-label"><MousePointerClick size={15} />{stats?.totalContactClicks ?? '—'}</span>
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Services listed</p>
          <p className="stat-card__value">
            <span className="ui-icon-label"><Wrench size={15} />{listings.filter((l) => (l.type || 'product') === 'service').length}</span>
          </p>
        </div>
      </div>

      <section className="dashboard-list-panel" aria-labelledby="dashboard-listings-heading">
        <div className="dashboard-list__head">
          <div>
            <h2 id="dashboard-listings-heading" className="section-title section-title--dashboard">
              Your listings
            </h2>
            {!isLoading && listings.length > 0 && (
              <p className="dashboard-list__sub">
                Showing <strong>{filteredListings.length}</strong> of {listings.length}
                {searchQuery.trim() || statusFilter !== 'all' || typeFilter !== 'all' ? (
                  <button
                    type="button"
                    className="dashboard-list__clear"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setTypeFilter('all');
                      setSortBy('newest');
                    }}
                  >
                    Clear filters
                  </button>
                ) : null}
              </p>
            )}
          </div>
        </div>

        {!isLoading && listings.length > 0 && (
          <div className="dashboard-toolbar">
            <label className="dashboard-toolbar__search">
              <Search size={14} className="dashboard-toolbar__search-icon" aria-hidden />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title…"
                autoComplete="off"
                aria-label="Search listings by title"
              />
            </label>
            <div className="dashboard-toolbar__selects">
              <label className="dashboard-toolbar__field">
                <span className="dashboard-toolbar__label">Sort</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} aria-label="Sort listings">
                  <option value="newest">Newest listed</option>
                  <option value="oldest">Oldest listed</option>
                  <option value="views">Most views</option>
                  <option value="title">Title A–Z</option>
                  <option value="priceAsc">Price: low to high</option>
                  <option value="priceDesc">Price: high to low</option>
                </select>
              </label>
              <label className="dashboard-toolbar__field">
                <span className="dashboard-toolbar__label">Type</span>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)} aria-label="Filter by listing type">
                  <option value="all">All types</option>
                  <option value="product">Products</option>
                  <option value="service">Services</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="text-muted dashboard-list__empty">Loading…</p>
        ) : !listings.length ? (
          <p className="text-muted dashboard-list__empty">
            You have no listings yet. <Link to="/sell">Create your first listing</Link>
          </p>
        ) : filteredListings.length === 0 ? (
          <p className="text-muted dashboard-list__empty">
            No listings match your filters.{' '}
            <button
              type="button"
              className="dashboard-list__clear dashboard-list__clear--inline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
            >
              Reset filters
            </button>
          </p>
        ) : (
          <>
            <div className="dashboard-table-head" aria-hidden>
              <span className="dashboard-table-head__spacer" />
              <span>Listing</span>
              <span>Activity</span>
              <span>Price</span>
              <span>Actions</span>
            </div>
            <div className="dashboard-list">
              {filteredListings.map((l) => {
                const listed = listedShort(l.createdAt);
                return (
                  <div key={l.id} className="listing-row">
                    <div className="listing-row__media">
                      {l.images[0] ? (
                        <img className="listing-row__thumb" src={l.images[0]} alt="" />
                      ) : (
                        <div className="listing-row__thumb listing-row__thumb--empty" aria-hidden />
                      )}
                    </div>
                    <div className="listing-row__primary">
                      <div className="listing-row__title-row">
                        <Link to={`/listings/${l.id}`} className="listing-row__title">
                          {l.title}
                        </Link>
                        {l.featured ? (
                          <span className="listing-row__featured" title="Featured listing">
                            <Sparkles size={11} aria-hidden />
                            Featured
                          </span>
                        ) : null}
                      </div>
                      <div className="listing-row__badges">
                        <span className={`pill listing-row__pill ${(l.type || 'product') === 'service' ? 'pill--service' : 'pill--product'}`}>
                          {(l.type || 'product') === 'service' ? 'Service' : 'Product'}
                        </span>
                        <span
                          className={`pill listing-row__pill ${
                            (l.status || 'inStock') === 'sold'
                              ? 'pill--status-sold'
                              : (l.status || 'inStock') === 'outOfStock'
                                ? 'pill--status-out'
                                : 'pill--status-in'
                          }`}
                        >
                          {listingStatusLabel(l.status, (l.type || 'product') === 'service' ? 'service' : 'product')}
                        </span>
                      </div>
                      {listed ? <p className="listing-row__listed">Listed {listed}</p> : null}
                    </div>
                    <div className="listing-row__metrics">
                      <span className="listing-row__metric">
                        <Eye size={12} aria-hidden />
                        {l.views}
                      </span>
                      <span className="listing-row__metric">
                        <MousePointerClick size={12} aria-hidden />
                        {l.contactClicks}
                      </span>
                    </div>
                    <div className="listing-row__price-col">
                      <p className="listing-row__price">{formatPrice(l.price, l.currency || 'USD')}</p>
                    </div>
                    <div className="listing-row__actions">
                      <Link
                        to={`/listings/${l.id}`}
                        className="btn btn-ghost btn--sm listing-row__btn"
                        style={{ textDecoration: 'none' }}
                      >
                        <span className="ui-icon-label">
                          <ExternalLink size={13} />
                          View
                        </span>
                      </Link>
                      <Link
                        to={`/listings/${l.id}/edit`}
                        className="btn btn-ghost btn--sm listing-row__btn"
                        style={{ textDecoration: 'none' }}
                      >
                        <span className="ui-icon-label">
                          <PenSquare size={13} />
                          Edit
                        </span>
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger btn--sm listing-row__btn"
                        disabled={deleting || l.id.startsWith('optimistic-')}
                        onClick={() => {
                          if (window.confirm('Delete this listing?')) void deleteListing(l.id);
                        }}
                      >
                        <span className="ui-icon-label">
                          <Trash2 size={13} />
                          Delete
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
