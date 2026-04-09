/** Same API values; labels differ for products vs services. */
export type ListingStatusValue = 'inStock' | 'outOfStock' | 'sold';
export type ListingKind = 'product' | 'service';

export function listingStatusLabel(
  status: ListingStatusValue | undefined,
  kind: ListingKind,
): string {
  const s = status || 'inStock';
  if (kind === 'service') {
    if (s === 'sold') return 'Completed';
    if (s === 'outOfStock') return 'Fully booked';
    return 'Available';
  }
  if (s === 'sold') return 'Sold';
  if (s === 'outOfStock') return 'Out of stock';
  return 'In stock';
}

export function listingStatusFormOptions(kind: ListingKind): { value: ListingStatusValue; label: string }[] {
  if (kind === 'service') {
    return [
      { value: 'inStock', label: 'Available — accepting clients' },
      { value: 'outOfStock', label: 'Fully booked — not taking new work' },
      { value: 'sold', label: 'Completed — no longer offered' },
    ];
  }
  return [
    { value: 'inStock', label: 'In stock' },
    { value: 'outOfStock', label: 'Out of stock' },
    { value: 'sold', label: 'Sold' },
  ];
}

export function listingAvailabilityFieldLabel(kind: ListingKind): string {
  return kind === 'service' ? 'Service availability' : 'Stock status';
}

export function listingAvailabilityFieldHint(kind: ListingKind): string {
  return kind === 'service'
    ? 'Tell buyers whether you can take new bookings or this service is finished.'
    : 'Mark whether this item is available, out of stock, or sold.';
}
