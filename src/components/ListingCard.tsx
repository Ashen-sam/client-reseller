import { useNavigate } from 'react-router-dom';
import { Camera, Eye, MousePointerClick } from 'lucide-react';
import type { Listing } from '../types';
import { formatPrice } from '../lib/formatPrice';
import ProductCardCarousel from './ProductCardCarousel';

function postedAgo(createdAt?: string): string {
  if (!createdAt) return 'Posted recently';
  const ts = Date.parse(createdAt);
  if (!Number.isFinite(ts)) return 'Posted recently';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'Posted just now';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `Posted ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Posted ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Posted ${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Posted ${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Posted ${months}mo ago`;
  const years = Math.floor(days / 365);
  return `Posted ${years}y ago`;
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const navigate = useNavigate();
  const isPending = listing.id.startsWith('optimistic-');
  const imgs = listing.images?.length ? listing.images : [];
  const photoTotal = listing.imageCount ?? imgs.length;
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
        <p className="product-card__posted">{postedAgo(listing.createdAt)}</p>
        <p className="product-card__meta">
          <span className="ui-icon-label"><Eye size={12} />{listing.views} views</span>
          {' · '}
          <span className="ui-icon-label"><MousePointerClick size={12} />{listing.contactClicks} contacts</span>
          {photoTotal > 1 && !isPending && (
            <span className="product-card__photos-hint">
              {' · '}
              <span className="ui-icon-label"><Camera size={12} />{photoTotal} photos</span>
            </span>
          )}
        </p>
      </div>
    </article>
  );
}
