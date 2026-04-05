import { Link } from 'react-router-dom';
import { useGetListingsQuery, useDeleteListingMutation } from '../store/api';
import ListingCard from '../components/ListingCard';

export default function AdminPage() {
  const { data, isLoading, error } = useGetListingsQuery({ page: 1, limit: 100, sort: 'latest' });
  const [deleteListing, { isLoading: deleting }] = useDeleteListingMutation();

  return (
    <div className="container">
      <header className="page-surface page-surface--page-header">
        <div className="page-surface__inner">
          <p className="page-header-eyebrow">Moderation</p>
          <h1 className="page-header-title">Admin</h1>
          <p className="page-header-subtitle">Remove listings that break your marketplace rules.</p>
        </div>
      </header>

      {error && (
        <div className="error-banner" style={{ marginBottom: '1rem' }}>
          Could not load listings.
        </div>
      )}

      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <>
          <div className="product-grid">
            {(data?.listings ?? []).map((l) => (
              <div key={l.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <ListingCard listing={l} />
                <button
                  type="button"
                  className="btn btn-danger btn-block"
                  disabled={deleting || l.id.startsWith('optimistic-')}
                  onClick={() => {
                    if (window.confirm(`Remove “${l.title}”?`)) void deleteListing(l.id);
                  }}
                >
                  Remove listing
                </button>
                <Link
                  to={`/listings/${l.id}`}
                  style={{ fontSize: 'var(--text-sm)', textAlign: 'center' }}
                >
                  View product
                </Link>
              </div>
            ))}
          </div>
          {!data?.listings?.length && <p className="text-muted">No listings yet.</p>}
        </>
      )}
    </div>
  );
}
