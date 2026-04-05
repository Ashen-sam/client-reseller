import { Link } from 'react-router-dom';

type Props = {
  compact?: boolean;
  /** When true, only primary CTA (seller flow). */
  loggedIn?: boolean;
  className?: string;
};

export default function PostListingBanner({ compact, loggedIn, className = '' }: Props) {
  return (
    <aside
      className={`page-surface post-listing-banner${compact ? ' post-listing-banner--compact' : ''} ${className}`.trim()}
      aria-label="Promote your own listing"
    >
      <div className="post-listing-banner__inner">
        <div>
          <p className="post-listing-banner__eyebrow">Sell on Reseller</p>
          <p className="post-listing-banner__title">
            {compact ? 'Post your ad — reach local buyers' : 'Post your ad in minutes'}
          </p>
          {!compact && (
            <p className="post-listing-banner__sub">
              Multi-photo listings, featured placement, and direct contact — the same polished flow buyers see here.
            </p>
          )}
        </div>
        <div className="post-listing-banner__actions">
          <Link to="/sell" className="btn btn-primary">
            {loggedIn ? 'Create listing' : 'Start selling'}
          </Link>
          {!loggedIn && (
            <Link to="/register" className="btn btn-ghost">
              Sign up free
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
