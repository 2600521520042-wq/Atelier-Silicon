export type ProductCategory =
  | 'Workstations'
  | 'Graphics & Core'
  | 'Displays'
  | 'Peripherals';

export interface ProductVariant {
  id: string;
  label: string;
  priceDelta: number;
  stock: number;
}

export interface ProductSpecRow {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  brand: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  pickupAvailable: boolean;
  featured: boolean;
  specSnippet: string;
  warranty: string;
  description: string;
  imageUrl: string;
  specs: ProductSpecRow[];
  variants: ProductVariant[];
}

export interface ShopSettings {
  shopName: string;
  neighborhood: string;
  address: string;
  hours: string;
  whatsappNumber: string;
  heroKicker: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaLabel: string;
  heroImageUrl: string;
  consultationTitle: string;
  consultationDescription: string;
  promoBannerText: string;
  showPromoBanner: boolean;
}

export interface CartItem {
  productId: string;
  variantId: string;
  variantLabel: string;
  brand: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

export type OrderFulfillment = 'pickup' | 'courier';
export type OrderStatus = 'Pending' | 'Ready at Counter' | 'Completed';

export interface PickupOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  fulfillment: OrderFulfillment;
  pickupWindowOrAddress: string;
  notes: string;
  items: CartItem[];
  subtotal: number;
  createdAt: string;
  status: OrderStatus;
}

export type InquiryStatus = 'Open' | 'Quoted' | 'Resolved';

export interface TechInquiry {
  id: string;
  customerName: string;
  customerPhone: string;
  topic: string;
  productName?: string;
  message: string;
  createdAt: string;
  status: InquiryStatus;
}

export interface StorePublicData {
  settings: ShopSettings;
  products: Product[];
}
