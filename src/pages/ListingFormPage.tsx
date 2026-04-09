import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  useGetCategoriesQuery,
  useGetCurrenciesQuery,
  useGetListingQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useSessionMeQuery,
} from '../store/api';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import Avatar from '../components/Avatar';

type Mode = 'create' | 'edit';

function errMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'data' in e) {
    const d = (e as FetchBaseQueryError).data;
    if (d && typeof d === 'object' && 'message' in d) {
      const msg = String((d as { message: string }).message);
      const detail = (d as { detail?: string }).detail;
      return detail ? `${msg} (${detail})` : msg;
    }
  }
  return 'Something went wrong.';
}

export default function ListingFormPage({ mode }: { mode: Mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: me } = useSessionMeQuery();
  const { data: catData } = useGetCategoriesQuery();
  const { data: curData } = useGetCurrenciesQuery();
  const { data: existing, isLoading: loadingListing } = useGetListingQuery(id ?? '', {
    skip: mode !== 'edit' || !id,
  });
  const [createListing, { isLoading: creating }] = useCreateListingMutation();
  const [updateListing, { isLoading: updating }] = useUpdateListingMutation();

  const maxImg = me?.limits?.maxImagesPerListing ?? 3;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [listingType, setListingType] = useState<'product' | 'service'>('product');
  const [listingStatus, setListingStatus] = useState<'inStock' | 'outOfStock' | 'sold'>('inStock');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('other');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [initialImages, setInitialImages] = useState<string[]>([]);
  const [keepImages, setKeepImages] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const listing = existing?.listing;
  const tokens = me?.user.featuredTokens ?? 0;

  useEffect(() => {
    if (mode !== 'edit' || !listing) return;
    if (me?.user && listing.seller?.id && listing.seller.id !== me.user.id) return;
    setTitle(listing.title);
    setDescription(listing.description);
    setPrice(String(listing.price));
    setListingType((listing.type as 'product' | 'service') || 'product');
    setListingStatus((listing.status as 'inStock' | 'outOfStock' | 'sold') || 'inStock');
    setCurrency(listing.currency || 'USD');
    setCategory(listing.category);
    setPhone(listing.contact.phone);
    setWhatsapp(listing.contact.whatsapp);
    setEmail(listing.contact.email);
    const imgs = [...listing.images];
    setInitialImages(imgs);
    setKeepImages(imgs);
  }, [mode, listing, me?.user]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setNewPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  if (mode === 'edit' && !id) {
    return <Navigate to="/dashboard" replace />;
  }

  if (mode === 'edit' && listing && me?.user && listing.seller?.id !== me.user.id) {
    return <Navigate to="/dashboard" replace />;
  }

  const maxNewFiles =
    mode === 'create' ? maxImg : Math.max(0, maxImg - keepImages.length);

  function applyNewFiles(picked: File[]) {
    const imgs = picked.filter((f) => f.type.startsWith('image/'));
    if (imgs.length === 0) return;
    setFiles((prev) => [...prev, ...imgs].slice(0, maxNewFiles));
  }

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    applyNewFiles(Array.from(e.target.files || []));
    e.target.value = '';
  }

  function removeNewFileAt(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('description', description.trim());
    fd.append('price', price);
    fd.append('type', listingType);
    fd.append('status', listingStatus);
    fd.append('currency', currency);
    fd.append('category', category);
    fd.append('phone', phone.trim());
    fd.append('whatsapp', whatsapp.trim());
    fd.append('email', email.trim());

    if (mode === 'create') {
      if (files.length > maxImg) {
        setErr(`You can upload at most ${maxImg} images. Upgrade in Billing for up to 10.`);
        return;
      }
      fd.append('featured', featured && tokens > 0 ? 'true' : 'false');
      files.forEach((f) => fd.append('images', f));
      try {
        await createListing(fd).unwrap();
        navigate('/dashboard');
      } catch (ce) {
        setErr(errMessage(ce));
      }
      return;
    }

    if (!id) return;
    if (keepImages.length + files.length > maxImg) {
      setErr(`Total images cannot exceed ${maxImg}. Remove some or upgrade in Billing.`);
      return;
    }
    fd.append('keepImages', JSON.stringify(keepImages));
    files.forEach((f) => fd.append('images', f));
    try {
      await updateListing({ id, body: fd }).unwrap();
      navigate(`/listings/${id}`);
    } catch (ce) {
      setErr(errMessage(ce));
    }
  }

  const busy = creating || updating;

  if (mode === 'edit' && loadingListing) {
    return (
      <div className="container container--wide product-form-page">
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      </div>
    );
  }

  if (mode === 'edit' && !loadingListing && !listing) {
    return (
      <div className="container">
        <p>Listing not found.</p>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    );
  }

  const currencies = curData?.currencies ?? ['USD', 'LKR', 'EUR', 'GBP', 'INR', 'AUD'];
  const slotsLeft = Math.max(
    0,
    mode === 'create' ? maxImg - files.length : maxNewFiles - files.length
  );

  return (
    <div className="container container--wide product-form-page">
      <header className="page-surface page-surface--page-header page-surface--split">
        <Avatar name={me?.user?.name ?? 'Seller'} seed={me?.user?.id} size="lg" />
        <div className="page-surface__grow">
          <p className="page-header-eyebrow">{mode === 'create' ? 'New listing' : 'Update listing'}</p>
          <h1 className="page-header-title">
            {mode === 'create' ? `Add a ${listingType === 'service' ? 'service' : 'product'}` : 'Edit listing'}
          </h1>
          <p className="page-header-subtitle">
            <Link to={mode === 'edit' && id ? `/listings/${id}` : '/dashboard'}>← Back</Link>
            {' · '}
            <Link to="/billing">Billing & upgrades</Link>
          </p>
        </div>
      </header>

      <form className="product-form" onSubmit={onSubmit}>
        {err && (
          <div className="product-form__span-2 error-banner" style={{ margin: 0 }}>
            {err}
          </div>
        )}

        <div className="product-form__panel">
          <span className="product-form__section-label">Media & description</span>
          <div
            className={`product-dropzone${dragActive ? ' product-dropzone--drag' : ''}`}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              applyNewFiles(Array.from(e.dataTransfer.files));
            }}
          >
            <p className="product-dropzone__title">
              {mode === 'create' ? `${listingType === 'service' ? 'Service' : 'Product'} photos` : 'Add more photos'}
            </p>
            <p className="product-dropzone__hint">
              Drag and drop images here, or choose files. JPEG, PNG, GIF, WebP — up to 5MB each. You can add{' '}
              <strong>{slotsLeft}</strong> more on this listing ({maxImg} max on your plan).
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={onFilesChange}
            />
          </div>

          {(newPreviews.length > 0 || (mode === 'edit' && initialImages.length > 0)) && (
            <div style={{ marginTop: '1.25rem' }}>
              {newPreviews.length > 0 && (
                <>
                  <span className="product-form__section-label">New uploads</span>
                  <div className="product-form__previews">
                    {newPreviews.map((url, idx) => (
                      <div key={url} className="product-form__thumb-wrap">
                        <img src={url} alt="" />
                        <button
                          type="button"
                          className="product-form__thumb-remove"
                          aria-label="Remove photo"
                          onClick={() => removeNewFileAt(idx)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {mode === 'edit' && initialImages.length > 0 && (
                <div style={{ marginTop: newPreviews.length ? '1.25rem' : 0 }}>
                  <span className="product-form__section-label">Current photos</span>
                  <p style={{ margin: '0 0 0.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    Uncheck any image you want to remove when you save.
                  </p>
                  <div className="product-form__existing">
                    {initialImages.map((url) => (
                      <label key={url} className="product-form__existing-item">
                        <img src={url} alt="" />
                        <input
                          type="checkbox"
                          checked={keepImages.includes(url)}
                          onChange={() =>
                            setKeepImages((prev) =>
                              prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
                            )
                          }
                        />
                        Keep
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="field" style={{ marginTop: '1.5rem' }}>
            <label htmlFor="desc">Description</label>
            <textarea id="desc" required value={description} onChange={(e) => setDescription(e.target.value)} rows={8} />
          </div>
        </div>

        <div className="product-form__panel product-form__panel--sidebar">
          <div className="form-notice" style={{ margin: 0 }}>
            Up to <strong>{maxImg}</strong> images on your plan.
            {maxImg < 10 && (
              <>
                {' '}
                Unlock up to 10 for Rs. {me?.limits?.imagePackPriceLkr ?? 150} in <Link to="/billing">Billing</Link>.
              </>
            )}
          </div>

          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
          </div>

          <div className="field">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              value={listingType}
              onChange={(e) => setListingType(e.target.value as 'product' | 'service')}
            >
              <option value="product">Product</option>
              <option value="service">Service</option>
            </select>
          </div>

          <div className="product-form__row-2">
            <div className="field">
              <label htmlFor="price">Price</label>
              <input
                id="price"
                type="number"
                min={0}
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="currency">Currency</label>
              <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="status">Availability</label>
            <select
              id="status"
              value={listingStatus}
              onChange={(e) => setListingStatus(e.target.value as 'inStock' | 'outOfStock' | 'sold')}
            >
              <option value="inStock">In stock</option>
              <option value="outOfStock">Out of stock</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {(catData?.categories ?? ['other']).map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {mode === 'create' && tokens > 0 && (
            <label style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              <span style={{ fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                <strong>Featured listing</strong> — pinned higher in the marketplace (1 credit; you have {tokens}).
              </span>
            </label>
          )}

          <span className="product-form__section-label" style={{ marginTop: '0.25rem' }}>
            Buyer contact
          </span>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="wa">WhatsApp</label>
            <input id="wa" placeholder="94771234567" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="em">Email</label>
            <input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={busy} style={{ marginTop: '0.25rem' }}>
            {busy ? 'Saving…' : mode === 'create' ? `Publish ${listingType}` : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
