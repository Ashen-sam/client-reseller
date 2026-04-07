import { useNavigate } from 'react-router-dom';
import type { Listing } from '../types';
import { formatPrice } from '../lib/formatPrice';
import ProductCardCarousel from './ProductCardCarousel';

function categoryLabel(c: string) {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const navigate = useNavigate();
  const isPending = listing.id.startsWith('optimistic-');
  const imgs = listing.images?.length ? listing.images : [];
  const listingType = listing.type || 'product';

  function open() {
    if (!isPending) navigate(`/listings/${listing.id}`);
  }

  return (
    <article
      className={`product-card product-card--interactive${isPending ? ' product-card--pending' : ''}`}
      role="button"
      tabIndex={isPending ? -1 : 0}
      onClick={open}
      onKeyDown={(e) => {
        if (isPending) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      aria-label={isPending ? undefined : `View ${listing.title}`}
    >
      <div className="product-card__media">
        <ProductCardCarousel images={imgs} interactive={!isPending} />
        <div className="product-card__badges">
          <span className={`pill ${listingType === 'service' ? 'pill--service' : 'pill--product'} pill--on-media`}>
            {listingType === 'service' ? 'Service' : 'Product'}
          </span>
          <span className="pill pill--on-media">{categoryLabel(listing.category)}</span>
          {listing.featured && (
            <span className="pill pill--featured pill--on-media" style={{ marginLeft: 'auto' }}>
              Featured
            </span>
          )}
        </div>
      </div>
      <div className="product-card__body">
        <h2 className="product-card__title">{listing.title}</h2>
        <p className="product-card__price">{formatPrice(listing.price, listing.currency || 'USD')}</p>
        <p className="product-card__meta">
          {listing.views} views · {listing.contactClicks} contacts
          {imgs.length > 1 && !isPending && (
            <span className="product-card__photos-hint"> · {imgs.length} photos</span>
          )}
        </p>
      </div>
    </article>
  );
}
