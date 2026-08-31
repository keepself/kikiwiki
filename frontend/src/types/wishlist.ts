export type WishlistPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface WishlistItem {
  id: number;
  name: string;
  price: number | null;
  imageUrl: string | null;
  productUrl: string | null;
  priority: WishlistPriority;
  createdAt: string;
  purchased: boolean;
  purchasedAt: string | null;
  linkedTransactionId: number | null;
}

export interface WishlistPurchaseInput {
  categoryId: number;
  price: number | null;
}

export interface WishlistItemInput {
  name: string;
  price: number | null;
  imageUrl: string | null;
  productUrl: string | null;
  priority: WishlistPriority;
}
