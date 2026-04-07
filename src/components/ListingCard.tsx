import { useNavigate } from 'react-router-dom';
import { Camera, Eye, MousePointerClick, Star } from 'lucide-react';
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
              <span className="ui-icon-label"><Star size={12} />Featured</span>
            </span>
          )}
        </div>
      </div>
      <div className="product-card__body">
        <h2 className="product-card__title">{listing.title}</h2>
        <p className="product-card__price">{formatPrice(listing.price, listing.currency || 'USD')}</p>
        <p className="product-card__meta">
          <span className="ui-icon-label"><Eye size={13} />{listing.views} views</span>
          {' · '}
          <span className="ui-icon-label"><MousePointerClick size={13} />{listing.contactClicks} contacts</span>
          {imgs.length > 1 && !isPending && (
            <span className="product-card__photos-hint">
              {' · '}
              <span className="ui-icon-label"><Camera size={13} />{imgs.length} photos</span>
            </span>
          )}
        </p>
      </div>
    </article>
  );
}
