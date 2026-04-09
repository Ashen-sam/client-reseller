import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  ExternalLink,
  LayoutGrid,
  Package,
  Plus,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useGetAdminListingsQuery,
  useCreateAdminListingMutation,
  useDeleteListingMutation,
  useGetCategoriesQuery,
  useGetCurrenciesQuery,
} from '../store/api';
import { formatPrice } from '../lib/formatPrice';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

type AdminTab = 'overview' | 'listings' | 'users';

function errMsg(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'data' in e) {
    const d = (e as FetchBaseQueryError).data;
    if (d && typeof d === 'object' && 'message' in d) return String((d as { message: string }).message);
  }
  return fallback;
}

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [listPage, setListPage] = useState(1);

  const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery();
  const { data: usersData, isLoading: usersLoading } = useGetAdminUsersQuery({ page: 1, limit: 200 });
  const { data: listingsData, isLoading: listingsLoading } = useGetAdminListingsQuery({
    page: listPage,
    limit: 12,
    sort: 'latest',
  });
  const { data: catData } = useGetCategoriesQuery();
  const { data: curData } = useGetCurrenciesQuery();

  const [createUser, { isLoading: creatingUser }] = useCreateAdminUserMutation();
  const [createListing, { isLoading: creatingListing }] = useCreateAdminListingMutation();
  const [deleteListing, { isLoading: deleting }] = useDeleteListingMutation();

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [userFormErr, setUserFormErr] = useState('');
  const [userFormOk, setUserFormOk] = useState('');

  const [sellerId, setSellerId] = useState('');
  const [lTitle, setLTitle] = useState('');
  const [lDesc, setLDesc] = useState('');
  const [lPrice, setLPrice] = useState('');
  const [lCategory, setLCategory] = useState('other');
  const [lType, setLType] = useState<'product' | 'service'>('product');
  const [lCurrency, setLCurrency] = useState('USD');
  const [lPhone, setLPhone] = useState('');
  const [lWa, setLWa] = useState('');
  const [lEmail, setLEmail] = useState('');
  const [lFiles, setLFiles] = useState<File[]>([]);
  const [lFeatured, setLFeatured] = useState(false);
  const [listFormErr, setListFormErr] = useState('');
  const [listFormOk, setListFormOk] = useState('');

  const users = usersData?.users ?? [];
  const currencies = curData?.currencies ?? ['USD', 'LKR', 'EUR', 'GBP', 'INR', 'AUD'];

  async function onCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setUserFormErr('');
    setUserFormOk('');
    try {
      await createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
      }).unwrap();
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setUserFormOk('User created successfully.');
    } catch (err) {
      setUserFormErr(errMsg(err, 'Could not create user'));
    }
  }

  async function onCreateListing(e: React.FormEvent) {
    e.preventDefault();
    setListFormErr('');
    setListFormOk('');
    if (!sellerId) {
      setListFormErr('Select a seller (user) for this listing.');
      return;
    }
    const fd = new FormData();
    fd.append('sellerId', sellerId);
    fd.append('title', lTitle.trim());
    fd.append('description', lDesc.trim());
    fd.append('price', lPrice);
    fd.append('category', lCategory);
    fd.append('type', lType);
    fd.append('currency', lCurrency);
    fd.append('phone', lPhone.trim());
    fd.append('whatsapp', lWa.trim());
    fd.append('email', lEmail.trim());
    fd.append('featured', lFeatured ? 'true' : 'false');
    lFiles.forEach((f) => fd.append('images', f));
    try {
      await createListing(fd).unwrap();
      setLTitle('');
      setLDesc('');
      setLPrice('');
      setLPhone('');
      setLWa('');
      setLEmail('');
      setLFiles([]);
      setLFeatured(false);
      setListFormOk('Listing published successfully.');
    } catch (err) {
      setListFormErr(errMsg(err, 'Could not create listing'));
    }
  }

  return (
    <div className="container admin-console">
      <header className="admin-console__header">
        <div>
          <p className="page-header-eyebrow">Control center</p>
          <h1 className="page-header-title">
            <span className="ui-icon-label">
              <Shield size={22} />
              Admin panel
            </span>
          </h1>
          <p className="page-header-subtitle">
            Manage users, listings, and marketplace activity.{' '}
            <Link to="/">
              <span className="ui-icon-label">
                <ExternalLink size={14} />
                Back to marketplace
              </span>
            </Link>
          </p>
        </div>
      </header>

      <div className="admin-console__layout">
        <nav className="admin-console__nav card" aria-label="Admin sections">
          <button
            type="button"
            className={`admin-console__nav-btn${tab === 'overview' ? ' is-active' : ''}`}
            onClick={() => setTab('overview')}
          >
            <span className="ui-icon-label">
              <LayoutGrid size={18} />
              Overview
            </span>
          </button>
          <button
            type="button"
            className={`admin-console__nav-btn${tab === 'listings' ? ' is-active' : ''}`}
            onClick={() => setTab('listings')}
          >
            <span className="ui-icon-label">
              <Package size={18} />
              Listings
            </span>
          </button>
          <button
            type="button"
            className={`admin-console__nav-btn${tab === 'users' ? ' is-active' : ''}`}
            onClick={() => setTab('users')}
          >
            <span className="ui-icon-label">
              <Users size={18} />
              Users
            </span>
          </button>
        </nav>

        <div className="admin-console__main">
          {tab === 'overview' && (
            <>
              <div className="stat-grid">
                <div className="stat-card">
                  <p className="stat-card__label">Users</p>
                  <p className="stat-card__value">
                    <span className="ui-icon-label">
                      <Users size={18} />
                      {statsLoading ? '—' : stats?.userCount ?? '—'}
                    </span>
                  </p>
                </div>
                <div className="stat-card">
                  <p className="stat-card__label">Listings</p>
                  <p className="stat-card__value">
                    <span className="ui-icon-label">
                      <Package size={18} />
                      {statsLoading ? '—' : stats?.listingCount ?? '—'}
                    </span>
                  </p>
                </div>
                <div className="stat-card">
                  <p className="stat-card__label">Products / services</p>
                  <p className="stat-card__value" style={{ fontSize: 'var(--text-lg)' }}>
                    {statsLoading
                      ? '—'
                      : `${stats?.productCount ?? 0} / ${stats?.serviceCount ?? 0}`}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="stat-card__label">Total views</p>
                  <p className="stat-card__value">
                    <span className="ui-icon-label">
                      <BarChart3 size={18} />
                      {statsLoading ? '—' : stats?.totalViews ?? '—'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="card admin-console__hint">
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  Use the <strong>Listings</strong> tab to review all products, remove violations, or publish listings on
                  behalf of a seller. Use <strong>Users</strong> to register new customer accounts.
                </p>
              </div>
            </>
          )}

          {tab === 'users' && (
            <div className="admin-console__panel">
              <div className="card admin-console__form-card">
                <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
                  <span className="ui-icon-label">
                    <Plus size={18} />
                    Add user
                  </span>
                </h2>
                <p className="text-muted" style={{ margin: '0 0 1rem', fontSize: 'var(--text-sm)' }}>
                  Creates a standard customer account (not an administrator). The system keeps a single admin account.
                </p>
                {userFormOk && <div className="success-banner">{userFormOk}</div>}
                {userFormErr && <div className="error-banner">{userFormErr}</div>}
                <form className="admin-console__form-grid" onSubmit={(e) => void onCreateUser(e)}>
                  <div className="field">
                    <label htmlFor="au-name">Name</label>
                    <input
                      id="au-name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="au-email">Email</label>
                    <input
                      id="au-email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="au-pass">Password</label>
                    <input
                      id="au-pass"
                      type="password"
                      minLength={6}
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={creatingUser}>
                    {creatingUser ? 'Creating…' : 'Create user'}
                  </button>
                </form>
              </div>

              <div className="card admin-console__table-wrap">
                <h2 className="section-title" style={{ marginBottom: '1rem' }}>
                  All users
                </h2>
                {usersLoading ? (
                  <p className="text-muted">Loading users…</p>
                ) : (
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Featured credits</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>
                              <span className={`pill ${u.role === 'admin' ? 'pill--product' : ''}`}>{u.role}</span>
                            </td>
                            <td>{u.featuredTokens}</td>
                            <td className="admin-table__muted">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'listings' && (
            <div className="admin-console__panel">
              <div className="card admin-console__form-card">
                <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
                  <span className="ui-icon-label">
                    <Plus size={18} />
                    Add listing (for a seller)
                  </span>
                </h2>
                <p className="text-muted" style={{ margin: '0 0 1rem', fontSize: 'var(--text-sm)' }}>
                  Choose the account that owns the listing, then fill details. Images optional (JPEG/PNG/WebP, max 5MB
                  each).
                </p>
                {listFormOk && <div className="success-banner">{listFormOk}</div>}
                {listFormErr && <div className="error-banner">{listFormErr}</div>}
                <form className="admin-console__listing-form" onSubmit={(e) => void onCreateListing(e)}>
                  <div className="field">
                    <label htmlFor="al-seller">Seller (user)</label>
                    <select id="al-seller" value={sellerId} onChange={(e) => setSellerId(e.target.value)} required>
                      <option value="">Select user…</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="al-title">Title</label>
                    <input id="al-title" value={lTitle} onChange={(e) => setLTitle(e.target.value)} required maxLength={200} />
                  </div>
                  <div className="field">
                    <label htmlFor="al-desc">Description</label>
                    <textarea id="al-desc" rows={4} value={lDesc} onChange={(e) => setLDesc(e.target.value)} required />
                  </div>
                  <div className="admin-console__form-row">
                    <div className="field">
                      <label htmlFor="al-price">Price</label>
                      <input
                        id="al-price"
                        type="number"
                        min={0}
                        step="0.01"
                        value={lPrice}
                        onChange={(e) => setLPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="al-cur">Currency</label>
                      <select id="al-cur" value={lCurrency} onChange={(e) => setLCurrency(e.target.value)}>
                        {currencies.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="admin-console__form-row">
                    <div className="field">
                      <label htmlFor="al-cat">Category</label>
                      <select id="al-cat" value={lCategory} onChange={(e) => setLCategory(e.target.value)}>
                        {(catData?.categories ?? ['other']).map((c) => (
                          <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="al-type">Type</label>
                      <select
                        id="al-type"
                        value={lType}
                        onChange={(e) => setLType(e.target.value as 'product' | 'service')}
                      >
                        <option value="product">Product</option>
                        <option value="service">Service</option>
                      </select>
                    </div>
                  </div>
                  <div className="admin-console__form-row">
                    <div className="field">
                      <label htmlFor="al-phone">Phone</label>
                      <input id="al-phone" value={lPhone} onChange={(e) => setLPhone(e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="al-wa">WhatsApp</label>
                      <input id="al-wa" placeholder="94771234567" value={lWa} onChange={(e) => setLWa(e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="al-em">Contact email</label>
                      <input id="al-em" type="email" value={lEmail} onChange={(e) => setLEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="al-img">Images</label>
                    <input
                      id="al-img"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      multiple
                      onChange={(e) => setLFiles(Array.from(e.target.files || []))}
                    />
                  </div>
                  <label className="admin-console__check">
                    <input type="checkbox" checked={lFeatured} onChange={(e) => setLFeatured(e.target.checked)} />
                    <span>Featured listing</span>
                  </label>
                  <button type="submit" className="btn btn-primary" disabled={creatingListing}>
                    {creatingListing ? 'Publishing…' : 'Publish listing'}
                  </button>
                </form>
              </div>

              <div className="card admin-console__table-wrap">
                <h2 className="section-title" style={{ marginBottom: '1rem' }}>
                  All listings
                </h2>
                {listingsLoading ? (
                  <p className="text-muted">Loading listings…</p>
                ) : (
                  <>
                    <div className="admin-table-scroll">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Listing</th>
                            <th>Seller</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Views</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {(listingsData?.listings ?? []).map((l) => (
                            <tr key={l.id}>
                              <td>
                                <Link to={`/listings/${l.id}`} className="admin-table__link">
                                  {l.title}
                                </Link>
                                {l.featured && <span className="pill pill--featured" style={{ marginLeft: '0.35rem' }}>Featured</span>}
                              </td>
                              <td className="admin-table__muted">
                                {l.seller?.name || '—'}
                                <br />
                                <small>{l.seller?.email}</small>
                              </td>
                              <td>
                                <span className={`pill ${(l.type || 'product') === 'service' ? 'pill--service' : 'pill--product'}`}>
                                  {(l.type || 'product') === 'service' ? 'Service' : 'Product'}
                                </span>
                              </td>
                              <td>{formatPrice(l.price, l.currency || 'USD')}</td>
                              <td>{l.views}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  style={{ padding: '0.35rem 0.6rem', minHeight: 0 }}
                                  disabled={deleting || l.id.startsWith('optimistic-')}
                                  onClick={() => {
                                    if (window.confirm(`Remove “${l.title}”?`)) void deleteListing(l.id);
                                  }}
                                >
                                  <span className="ui-icon-label">
                                    <Trash2 size={14} />
                                    Remove
                                  </span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {!!listingsData && listingsData.pages > 1 && (
                      <div className="pagination" style={{ marginTop: '1rem' }}>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          disabled={listPage <= 1}
                          onClick={() => setListPage((p) => Math.max(1, p - 1))}
                        >
                          Previous
                        </button>
                        <span className="pagination__status">
                          Page {listingsData.page} of {listingsData.pages}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          disabled={listPage >= listingsData.pages}
                          onClick={() => setListPage((p) => p + 1)}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
