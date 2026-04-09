import { useNavigate } from 'react-router-dom';
import { Camera, Eye, MousePointerClick } from 'lucide-react';
import type { Listing } from '../types';
import { formatPrice } from '../lib/formatPrice';
import ProductCardCarousel from './ProductCardCarousel';

export default function ListingCard({ listing }: { listing: Listing }) {
  const navigate = useNavigate();
  const isPending = listing.id.startsWith('optimistic-');
  const imgs = listing.images?.length ? listing.images : [];
  const listingType = listing.type || 'product';
  const listingStatus = listing.status || 'inStock';
  const inStock = listingStatus === 'inStock';

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
        {listingType === 'product' && listingStatus === 'sold' && (
          <div className="product-card__sold-ribbon" aria-hidden>
            <span>SOLD</span>
          </div>
        )}
        <div className="product-card__badges">
          <span className={`pill pill--on-media ${
            inStock ? 'pill--status-in' : 'pill--status-out'
          }`}>
            {inStock ? 'In stock' : 'Out of stock'}
          </span>
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
