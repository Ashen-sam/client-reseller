import { useEffect, useState, type MouseEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  FileText,
  ImageIcon,
  PhoneCall,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  useGetListingQuery,
  useGetSellerSummaryQuery,
  useRecordViewMutation,
  useRecordContactClickMutation,
} from '../store/api';
import { useSessionMeQuery } from '../hooks/useSessionMeQuery';
import { formatPrice } from '../lib/formatPrice';
import { listingStatusLabel } from '../lib/listingStatusLabels';
import { seoSiteUrl, setJsonLd, useSeo } from '../lib/seo';
import Avatar from '../components/Avatar';
import PostListingBanner from '../components/PostListingBanner';

function categoryLabel(c: string) {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export default function ListingDetailPage() {
  const { id = '' } = useParams();
  const { data, isLoading, error } = useGetListingQuery(id, { skip: !id });
  const { data: sellerSummary } = useGetSellerSummaryQuery(id, { skip: !id });
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

  function pdpCarouselPrev(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (images.length < 2) return;
    setImgIdx((idx) => (idx === 0 ? images.length - 1 : idx - 1));
  }

  function pdpCarouselNext(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (images.length < 2) return;
    setImgIdx((idx) => (idx === images.length - 1 ? 0 : idx + 1));
  }
  const sellerName = listing.seller?.name ?? 'Seller';
  const sellerId = listing.seller?.id ?? sellerName;
  const sellerPhone = contact.phone?.trim() || '';
  const memberSince = sellerSummary?.seller.memberSince
    ? new Date(sellerSummary.seller.memberSince).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
      })
    : null;
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
              <div className="pdp__media-head">
                <span className="ui-icon-label">
                  <ImageIcon size={14} />
                  {images.length} image{images.length !== 1 ? 's' : ''}
                </span>
                <span className="text-muted">Click image to view full size</span>
              </div>
              <div className="pdp__hero-wrap">
                <a href={mainSrc} target="_blank" rel="noreferrer" className="pdp__hero-link">
                  <img src={mainSrc} alt="" className="pdp__hero-img" />
                </a>
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="pdp__carousel-btn pdp__carousel-btn--prev"
                      onClick={pdpCarouselPrev}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={22} strokeWidth={2.25} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="pdp__carousel-btn pdp__carousel-btn--next"
                      onClick={pdpCarouselNext}
                      aria-label="Next image"
                    >
                      <ChevronRight size={22} strokeWidth={2.25} aria-hidden />
                    </button>
                    <span className="pdp__carousel-counter" aria-live="polite">
                      {imgIdx + 1} / {images.length}
                    </span>
                  </>
                )}
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

          <section className="pdp__content-card">
            <h2 className="pdp__section-title">
              <span className="ui-icon-label">
                <TrendingUp size={16} />
                Listing performance
              </span>
            </h2>
            <div className="pdp__mini-stats">
              <div className="pdp__mini-stat">
                <p className="pdp__mini-stat-label">Views</p>
                <p className="pdp__mini-stat-value">{listing.views}</p>
              </div>
              <div className="pdp__mini-stat">
                <p className="pdp__mini-stat-label">Contacts</p>
                <p className="pdp__mini-stat-value">{listing.contactClicks}</p>
              </div>
              <div className="pdp__mini-stat">
                <p className="pdp__mini-stat-label">Status</p>
                <p className="pdp__mini-stat-value">
                  {listingStatusLabel(listingStatus, listingType === 'service' ? 'service' : 'product')}
                </p>
              </div>
            </div>
          </section>
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
                {listingStatusLabel(listingStatus, listingType === 'service' ? 'service' : 'product')}
              </span>
              <span className="pill">{categoryLabel(listing.category)}</span>
              {listing.featured && <span className="pill pill--featured">Featured</span>}
            </div>
            <p className="pdp__stats">
              {listing.views} views · {listing.contactClicks} contacts
            </p>
            <p className="pdp__price pdp__price--aside-only">{formatPrice(listing.price, listing.currency || 'USD')}</p>
          </div>

          <section className="pdp__content-card pdp__content-card--aside">
            <h2 className="pdp__section-title" style={{ marginTop: 0 }}>
              <span className="ui-icon-label">
                <FileText size={16} />
                Description
              </span>
            </h2>
            <p className="pdp__description">{listing.description}</p>
          </section>

          <div className="pdp__aside-block">
            <h2 className="pdp__section-title" style={{ marginTop: 0 }}>
              <span className="ui-icon-label">
                <CircleUserRound size={16} />
                Seller details
              </span>
            </h2>
            <div className="person-card">
              <Avatar
                name={sellerName}
                seed={sellerId}
                avatarStyle={listing.seller?.avatarStyle}
                size="lg"
              />
              <div className="person-card__body">
                <p className="person-card__label">Listed by</p>
                <p className="person-card__name">{sellerName}</p>
                {sellerPhone && (
                  <p className="person-card__meta">{sellerPhone}</p>
                )}
              </div>
            </div>
            {sellerSummary && (
              <div className="seller-metrics">
                <div className="seller-metrics__rating">
                  <span className="ui-icon-label">
                    <Star size={14} />
                    {sellerSummary.stats.rating.toFixed(1)}
                  </span>
                  <span>({sellerSummary.stats.reviewCount} reviews)</span>
                </div>
                <div className="seller-metrics__grid">
                  <div className="seller-metrics__item">
                    <Users size={14} />
                    <span>{sellerSummary.stats.listingCount} listings</span>
                  </div>
                  <div className="seller-metrics__item">
                    <TrendingUp size={14} />
                    <span>{sellerSummary.stats.totalViews} total views</span>
                  </div>
                </div>
                <p className="seller-metrics__meta">
                  {memberSince ? `Member since ${memberSince}` : 'Trusted reseller profile'}
                </p>
              </div>
            )}
          </div>

          {me?.user && !isOwner && (
            <div className="pdp__aside-block">
              <h2 className="pdp__section-title" style={{ marginTop: 0 }}>
                You
              </h2>
              <div className="person-card">
                <Avatar
                  name={me.user.name}
                  seed={me.user.id}
                  avatarStyle={me.user.avatarStyle}
                  size="lg"
                />
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
              <span className="ui-icon-label">
                <PhoneCall size={16} />
                Contact seller
              </span>
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
