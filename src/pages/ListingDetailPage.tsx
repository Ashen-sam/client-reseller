import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useGetListingQuery,
  useRecordViewMutation,
  useRecordContactClickMutation,
  useSessionMeQuery,
} from '../store/api';
import { formatPrice } from '../lib/formatPrice';
import { seoSiteUrl, setJsonLd, useSeo } from '../lib/seo';
import Avatar from '../components/Avatar';
import PostListingBanner from '../components/PostListingBanner';

function categoryLabel(c: string) {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export default function ListingDetailPage() {
  const { id = '' } = useParams();
  const { data, isLoading, error } = useGetListingQuery(id, { skip: !id });
  const { data: me } = useSessionMeQuery();
  const [recordView] = useRecordViewMutation();
  const [recordContact] = useRecordContactClickMutation();
  const [imgIdx, setImgIdx] = useState(0);

  const listing = data?.listing;
  const isOwner = Boolean(me?.user && listing?.seller?.id === me.user.id);
  const listingType = listing?.type || 'product';
  const listingStatus = listing?.status || 'inStock';

  useSeo({
    title: listing ? `${listing.title}` : 'Listing',
    description: listing
      ? `${listing.description.slice(0, 150)}${listing.description.length > 150 ? '…' : ''}`
      : 'View listing details and contact the seller on Reseller.',
    path: `/listings/${id}`,
  });

  useEffect(() => {
    if (!id) return;
    const key = `viewed-listing-${id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    void recordView(id);
  }, [id, recordView]);

  useEffect(() => {
    setImgIdx(0);
  }, [listing?.id]);

  useEffect(() => {
    if (!listing) return;
    const offersAvailability =
      listingStatus === 'sold'
        ? 'https://schema.org/SoldOut'
        : listingStatus === 'outOfStock'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock';
    setJsonLd('listing-jsonld', {
      '@context': 'https://schema.org',
      '@type': listingType === 'service' ? 'Service' : 'Product',
      name: listing.title,
      description: listing.description,
      image: listing.images?.length ? listing.images : undefined,
      category: listing.category,
      offers: {
        '@type': 'Offer',
        price: Number(listing.price),
        priceCurrency: listing.currency || 'USD',
        availability: offersAvailability,
        url: `${seoSiteUrl()}/listings/${listing.id}`,
      },
      seller: {
        '@type': 'Person',
        name: listing.seller?.name || 'Seller',
      },
    });
    return () => setJsonLd('listing-jsonld', null);
  }, [listing, listingStatus, listingType]);

  async function trackContact(fn: () => void) {
    if (id) void recordContact(id);
    fn();
  }

  if (isLoading) {
    return (
      <div className="container">
        <div className="page-surface page-surface--compact" style={{ marginBottom: '1rem' }}>
          <div className="page-surface__inner">
            <div className="skeleton" style={{ height: 14, width: '55%' }} />
          </div>
        </div>
        <div className="pdp">
          <div className="pdp__main">
            <div className="skeleton pdp__hero-wrap" style={{ aspectRatio: '1', maxHeight: 400 }} />
            <div className="skeleton" style={{ height: 120, marginTop: 16, borderRadius: 'var(--radius)' }} />
          </div>
          <aside className="pdp__aside">
            <div className="skeleton" style={{ height: 28, width: '80%' }} />
            <div className="skeleton" style={{ height: 24, width: '40%' }} />
          </aside>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container">
        <section className="page-surface page-surface--compact">
          <div className="page-surface__inner">
            <nav className="breadcrumb" aria-label="Breadcrumb" style={{ margin: 0 }}>
              <Link to="/">Marketplace</Link>
            </nav>
          </div>
        </section>
        <div className="error-banner">This product could not be found.</div>
        <p style={{ marginTop: '1rem' }}>
          <Link to="/">← Back to marketplace</Link>
        </p>
      </div>
    );
  }

  const { contact } = listing;
  const images = listing.images ?? [];
  const mainSrc = images[imgIdx] ?? images[0];
  const sellerName = listing.seller?.name ?? 'Seller';
  const sellerId = listing.seller?.id ?? sellerName;
  const sellerPhone = contact.phone?.trim() || '';
  return (
    <div className="container">
      <section className="page-surface page-surface--compact">
        <div className="page-surface__inner">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ margin: 0 }}>
            <Link to="/">Marketplace</Link>
            <span className="text-muted"> / </span>
            <span className="text-muted">{listing.title}</span>
          </nav>
        </div>
      </section>

      {!isOwner && <PostListingBanner loggedIn={Boolean(me?.user)} />}

      <div className="pdp">
        <div className="pdp__main">
          <h1 className="pdp__title pdp__title--in-main">{listing.title}</h1>
          <p className="pdp__price pdp__price--main-only">{formatPrice(listing.price, listing.currency || 'USD')}</p>

          {images.length > 0 ? (
            <>
              <div className="pdp__hero-wrap">
                <a href={mainSrc} target="_blank" rel="noreferrer" className="pdp__hero-link">
                  <img src={mainSrc} alt="" className="pdp__hero-img" />
                </a>
              </div>
              {images.length > 1 && (
                <div className="pdp__thumbs">
                  {images.map((src, idx) => (
                    <button
                      key={src + idx}
                      type="button"
                      className={`pdp__thumb${idx === imgIdx ? ' is-active' : ''}`}
                      onClick={() => setImgIdx(idx)}
                      aria-label={`Show image ${idx + 1}`}
                    >
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="pdp__hero-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                No images for this listing.
              </span>
            </div>
          )}

          <h2 className="pdp__section-title">Description</h2>
          <p className="pdp__description">{listing.description}</p>
        </div>

        <aside className="pdp__aside">
          <div className="pdp__buy-card">
            <div className="pdp__pill-row">
              <span className={`pill ${listingType === 'service' ? 'pill--service' : 'pill--product'}`}>
                {listingType === 'service' ? 'Service' : 'Product'}
              </span>
              <span
                className={`pill ${
                  listingStatus === 'sold'
                    ? 'pill--status-sold'
                    : listingStatus === 'outOfStock'
                      ? 'pill--status-out'
                      : 'pill--status-in'
                }`}
              >
                {listingStatus === 'sold' ? 'Sold' : listingStatus === 'outOfStock' ? 'Out of stock' : 'In stock'}
              </span>
              <span className="pill">{categoryLabel(listing.category)}</span>
              {listing.featured && <span className="pill pill--featured">Featured</span>}
            </div>
            <p className="pdp__stats">
              {listing.views} views · {listing.contactClicks} contacts
            </p>
            <p className="pdp__price pdp__price--aside-only">{formatPrice(listing.price, listing.currency || 'USD')}</p>
          </div>

          <div className="pdp__aside-block">
            <h2 className="pdp__section-title" style={{ marginTop: 0 }}>
              Seller
            </h2>
            <div className="person-card">
              <Avatar name={sellerName} seed={sellerId} size="lg" />
              <div className="person-card__body">
                <p className="person-card__label">Listed by</p>
                <p className="person-card__name">{sellerName}</p>
                {sellerPhone && (
                  <p className="person-card__meta">{sellerPhone}</p>
                )}
              </div>
            </div>
          </div>

          {me?.user && !isOwner && (
            <div className="pdp__aside-block">
              <h2 className="pdp__section-title" style={{ marginTop: 0 }}>
                You
              </h2>
              <div className="person-card">
                <Avatar name={me.user.name} seed={me.user.id} size="lg" />
                <div className="person-card__body">
                  <p className="person-card__label">Signed in as</p>
                  <p className="person-card__name">{me.user.name}</p>
                  <p className="person-card__meta">{me.user.email}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pdp__aside-block">
            <h2 className="pdp__section-title" style={{ marginTop: 0 }}>
              Contact seller
            </h2>
            <div className="stack-gap">
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="btn btn-primary btn-block"
                  onClick={(e) => {
                    e.preventDefault();
                    void trackContact(() => {
                      window.location.href = `tel:${contact.phone}`;
                    });
                  }}
                >
                  Call
                </a>
              )}
              {!contact.phone && (
                <p className="text-muted" style={{ fontSize: 'var(--text-sm)', margin: 0 }}>
                  Seller has not provided a phone number.
                </p>
              )}
            </div>
          </div>

          {isOwner && (
            <Link to={`/listings/${listing.id}/edit`} className="btn btn-ghost btn-block">
              Edit listing
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
