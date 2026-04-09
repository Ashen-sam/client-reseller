export type UserRole = 'user' | 'admin';

export interface BillingProduct {
  id: string;
  name: string;
  description: string;
  priceLkr: number;
}

export interface AccountLimits {
  maxImagesPerListing: number;
  freeMaxImages: number;
  imagePackPriceLkr: number;
  featuredTokenPriceLkr: number;
  products: BillingProduct[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  listingImagePackPurchased: boolean;
  featuredTokens: number;
}

export interface MeResponse {
  user: User;
  limits: AccountLimits;
  /** Present on login/register — used when API is on another origin than the SPA. */
  token?: string;
}

export interface SellerRef {
  id: string;
  name?: string;
  email?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type?: 'product' | 'service';
  status?: 'inStock' | 'outOfStock' | 'sold';
  category: string;
  featured?: boolean;
  images: string[];
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
  };
  seller?: SellerRef | null;
  views: number;
  contactClicks: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  pages: number;
}

export interface ListingsQueryArgs {
  type?: 'product' | 'service';
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: 'latest' | 'popular';
  page?: number;
  limit?: number;
}

export interface AdminStats {
  userCount: number;
  listingCount: number;
  serviceCount: number;
  productCount: number;
  totalViews: number;
}

export interface AdminUserRow extends User {
  createdAt?: string;
}

export interface AdminUsersResponse {
  users: AdminUserRow[];
  total: number;
  page: number;
  pages: number;
}
