import { Link } from 'react-router-dom';
import { BadgeCheck, CreditCard, ShoppingCart } from 'lucide-react';
import { useSeo } from '../lib/seo';
import { usePurchaseProductMutation } from '../store/api';
import { useSessionMeQuery } from '../hooks/useSessionMeQuery';

export default function BillingPage() {
  const { data: me, refetch } = useSessionMeQuery();
  const [purchase, { isLoading }] = usePurchaseProductMutation();

  const limits = me?.limits;
  const products = limits?.products ?? [];
  useSeo({
    title: 'Billing',
    description: 'Manage billing add-ons and upgrade listing limits in your Reseller account.',
    path: '/billing',
    noindex: true,
  });

  async function buy(productId: string) {
    try {
      await purchase({ productId }).unwrap();
      void refetch();
    } catch {
      /* optional */
    }
  }

  return (
    <div className="container">
      <header className="page-surface page-surface--page-header">
        <div className="page-surface__inner">
          <p className="page-header-eyebrow">Billing</p>
          <h1 className="page-header-title">Plans & upgrades</h1>
          <p className="page-header-subtitle">
            Paid add-ons use a <strong>demo checkout</strong> when <code>MOCK_PAYMENTS=true</code> on the server. For
            production, connect PayHere (LKR) or Stripe.
          </p>
        </div>
      </header>
      <p className="breadcrumb" style={{ marginBottom: '1.5rem' }}>
        <Link to="/dashboard"><span className="ui-icon-label"><CreditCard size={14} />Dashboard</span></Link>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {products.map((p) => {
          const imagePackOwned = p.id === 'image_pack_8' && me?.user.listingImagePackPurchased;
          return (
            <div key={p.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <h2 className="section-title" style={{ fontSize: 'var(--text-md)', marginBottom: '0.35rem' }}>
                {p.name}
              </h2>
              <p className="text-muted" style={{ margin: '0 0 0.75rem', fontSize: 'var(--text-sm)', lineHeight: 1.55 }}>
                {p.description}
              </p>
              <p style={{ margin: '0 0 1rem', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--color-text)' }}>
                Rs. {p.priceLkr.toLocaleString()}{' '}
                <span style={{ fontWeight: 400, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>LKR(this is free of charge. You can use it anytime)</span>
              </p>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isLoading || Boolean(imagePackOwned)}
                onClick={() => void buy(p.id)}
              >
                <span className="ui-icon-label">
                  {imagePackOwned ? <BadgeCheck size={16} /> : <ShoppingCart size={16} />}
                  {imagePackOwned ? 'Already unlocked' : isLoading ? 'Processing…' : 'Pay (demo)'}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {me?.user && (
        <div className="card" style={{ padding: '1rem 1.25rem', marginTop: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--color-text)' }}>Your account:</strong> up to {limits?.maxImagesPerListing ?? 3}{' '}
            photos per product · <strong>{me.user.featuredTokens}</strong> featured credit{me.user.featuredTokens !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
