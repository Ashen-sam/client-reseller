import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, ArrowRight, Filter, Sparkles } from 'lucide-react';
import { useSeo } from '../lib/seo';
import { useGetCategoriesQuery, useGetListingsQuery } from '../store/api';
import ListingCard from '../components/ListingCard';
import PostListingBanner from '../components/PostListingBanner';
import image1 from '../../public/image.png';

function catLabel(c: string) {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export default function HomePage() {
  const { isSignedIn } = useAuth();
  const [type, setType] = useState<'product' | 'service' | ''>('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [page, setPage] = useState(1);

  const queryArgs = useMemo(
    () => ({
      category: category || undefined,
      type: (type || undefined) as 'product' | 'service' | undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sort,
      page,
    }),
    [category, type, minPrice, maxPrice, sort, page]
  );

  const { data, isLoading, isFetching, error } = useGetListingsQuery(queryArgs);
  const { data: catData } = useGetCategoriesQuery();
  const topicCategories = (catData?.categories ?? []).slice(0, 8);

  const hasNarrowFilters = Boolean(
    category ||
    type ||
    minPrice !== '' ||
    maxPrice !== '' ||
    sort !== 'latest' ||
    page > 1
  );

  useSeo({
    title: 'Marketplace',
    description:
      'Discover products and services from independent sellers. Filter by type, category, and price on Reseller.',
    path: '/',
  });

  return (
    <div className="container">
      <section className="page-surface marketplace-hero" aria-labelledby="marketplace-heading">
        <div className="page-surface__inner marketplace-hero__inner">

          {/* Left content */}
          <div className="marketplace-hero__content">
            <p className="marketplace-hero__eyebrow">Reseller marketplace</p>
            <h1 id="marketplace-heading" className="marketplace-hero__title">
              Discover products and services from independent sellers
            </h1>
            <p className="marketplace-hero__subtitle">
              Shop by category, compare prices in the seller's currency, and message them directly — the same flow you
              know from leading storefronts, built for peer-to-peer sales.
            </p>
            <ul className="marketplace-hero__trust">
              <li>Direct seller contact</li>
              <li>Multi-photo listings</li>
              <li>Featured & fresh inventory</li>
            </ul>
            <div className="marketplace-hero__topics">
              <span className="marketplace-hero__topics-label">Browse topics</span>
              <button
                type="button"
                className={`topic-chip${category === '' ? ' is-active' : ''}`}
                onClick={() => {
                  setPage(1);
                  setCategory('');
                }}
              >
                All
              </button>
              {topicCategories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`topic-chip${category === c ? ' is-active' : ''}`}
                  onClick={() => {
                    setPage(1);
                    setCategory(c);
                  }}
                >
                  {catLabel(c)}
                </button>
              ))}
            </div>
            <div className="marketplace-hero__actions">
              <a href="#marketplace-browse" className="btn btn-primary">
                <span className="ui-icon-label"><Sparkles size={16} />Browse products</span>
              </a>
              <Link to="/sell" className="btn btn-ghost">
                <span className="ui-icon-label"><ArrowRight size={16} />List an item</span>
              </Link>
            </div>
          </div>

          {/* Right image */}
          <div className="marketplace-hero__image">
            <img src={image1} alt="Marketplace" />
          </div>

        </div>
      </section>

      <div className="filters-panel" id="marketplace-browse">
        <div className="filters-panel__head">
          <h2 className="filters-panel__head-title">
            <span className="ui-icon-label"><Filter size={18} />Find what you need</span>
          </h2>
          <p className="filters-panel__head-sub">Filter by category, price range, and sort order.</p>
        </div>
        <div className="field">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value as 'product' | 'service' | '');
            }}
          >
            <option value="">All types</option>
            <option value="product">Products</option>
            <option value="service">Services</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="cat">Category</label>
          <select
            id="cat"
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
          >
            <option value="">All categories</option>
            {(catData?.categories ?? []).map((c) => (
              <option key={c} value={c}>
                {catLabel(c)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="min">Min price</label>
          <input
            id="min"
            type="number"
            min={0}
            placeholder="0"
            value={minPrice}
            onChange={(e) => {
              setPage(1);
              setMinPrice(e.target.value);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="max">Max price</label>
          <input
            id="max"
            type="number"
            min={0}
            placeholder="Any"
            value={maxPrice}
            onChange={(e) => {
              setPage(1);
              setMaxPrice(e.target.value);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="sort">Sort by</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value as 'latest' | 'popular');
            }}
          >
            <option value="latest">Newest first</option>
            <option value="popular">Most viewed</option>
          </select>
        </div>
      </div>

      <PostListingBanner loggedIn={isSignedIn} />

      {error && (
        <div className="error-banner" style={{ marginBottom: '1rem' }}>
          Could not load listings. Is the API running?
        </div>
      )}

      {isLoading ? (
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <article key={i} className="product-card" aria-hidden>
              <div className="product-card__media">
                <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />
              </div>
              <div className="product-card__body">
                <div className="skeleton" style={{ height: '2.7em', width: '100%', borderRadius: 6 }} />
                <div className="skeleton" style={{ height: 22, width: '42%', borderRadius: 6 }} />
                <div
                  className="skeleton"
                  style={{ height: 14, width: '70%', borderRadius: 4, marginTop: 'auto' }}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <>
          <div className="product-grid">
            {(data?.listings ?? []).map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
          {!data?.listings?.length && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              {hasNarrowFilters ? (
                <p className="text-muted" style={{ margin: 0, fontSize: 'var(--text-md)' }}>
                  No products match your filters.
                </p>
              ) : (
                <>
                  <p className="text-muted" style={{ margin: 0, fontSize: 'var(--text-md)' }}>
                    No listings yet.
                  </p>
                  <p className="text-muted" style={{ margin: '0.5rem 0 0', fontSize: 'var(--text-sm)' }}>
                    <Link to="/sell">Create a listing</Link> to get started, or widen your filters if you are searching.
                  </p>
                </>
              )}
            </div>
          )}
          {!!data && data.pages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="btn btn-ghost"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <span className="ui-icon-label"><ArrowLeft size={15} />Previous</span>
              </button>
              <span className="pagination__status">
                Page {data.page} of {data.pages}
              </span>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={page >= data.pages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                <span className="ui-icon-label">Next<ArrowRight size={15} /></span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}