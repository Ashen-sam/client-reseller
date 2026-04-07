import { ShoppingBag } from 'lucide-react';

export default function PageLoader({
  message = 'Loading your marketplace...',
  fullScreen = true,
}: {
  message?: string;
  fullScreen?: boolean;
}) {
  return (
    <div className={`page-loader${fullScreen ? ' page-loader--fullscreen' : ''}`} role="status" aria-live="polite">
      <div className="page-loader__card">
        <div className="page-loader__brand">
          <ShoppingBag size={18} />
          <span>Reseller</span>
        </div>
        <div className="page-loader__spinner" aria-hidden />
        <p className="page-loader__text">{message}</p>
      </div>
    </div>
  );
}
