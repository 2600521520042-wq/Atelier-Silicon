import type {
  InquiryStatus,
  OrderStatus,
  PickupOrder,
  Product,
  ShopSettings,
  StorePublicData,
  TechInquiry,
} from '../types';

export const STUDIO_IMAGE_PRESETS = [
  {
    label: 'Atelier Showroom Desk',
    url: '/src/assets/images/hero_workstation_atelier_1795518953644.jpg',
  },
  {
    label: 'Creator Workstation Laptop',
    url: '/src/assets/images/product_pro_laptop_1795518953665.jpg',
  },
  {
    label: 'Titanium Flagship GPU',
    url: '/src/assets/images/product_rtx_gpu_1795518953668.jpg',
  },
  {
    label: '32" 4K Reference OLED',
    url: '/src/assets/images/product_oled_monitor_1795518953786.jpg',
  },
  {
    label: 'CNC 75% Mechanical Keyboard',
    url: '/src/assets/images/product_mech_keyboard_1795518954838.jpg',
  },
  {
    label: 'Thunderbolt 5 Dock & Audio',
    url: '/src/assets/images/product_tb_dock_audio_1795518959335.jpg',
  },
];

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchStoreData(): Promise<StorePublicData> {
  const res = await fetch('/api/store');
  return handleJson<StorePublicData>(res);
}

export async function verifyOwnerPin(pin: string): Promise<boolean> {
  const res = await fetch('/api/owner/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { ok: boolean };
  return data.ok;
}

export async function updateOwnerPin(currentPin: string, newPin: string): Promise<void> {
  const res = await fetch('/api/owner/pin', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Owner-Pin': currentPin,
    },
    body: JSON.stringify({ newPin }),
  });
  await handleJson<{ ok: boolean }>(res);
}

export async function updateShopSettings(
  pin: string,
  settings: Partial<ShopSettings>,
): Promise<ShopSettings> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Owner-Pin': pin,
    },
    body: JSON.stringify(settings),
  });
  return handleJson<ShopSettings>(res);
}

export async function createProduct(
  pin: string,
  product: Omit<Product, 'id'>,
): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Owner-Pin': pin,
    },
    body: JSON.stringify(product),
  });
  return handleJson<Product>(res);
}

export async function updateProduct(
  pin: string,
  id: string,
  product: Partial<Product>,
): Promise<Product> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Owner-Pin': pin,
    },
    body: JSON.stringify(product),
  });
  return handleJson<Product>(res);
}

export async function deleteProduct(pin: string, id: string): Promise<void> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'X-Owner-Pin': pin },
  });
  await handleJson<{ ok: boolean }>(res);
}

export async function submitOrder(payload: {
  customerName: string;
  customerPhone: string;
  fulfillment: 'pickup' | 'courier';
  pickupWindowOrAddress: string;
  notes: string;
  items: {
    productId: string;
    variantId: string;
    variantLabel: string;
    brand: string;
    name: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    imageUrl: string;
  }[];
}): Promise<PickupOrder> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJson<PickupOrder>(res);
}

export async function fetchOrders(pin: string): Promise<PickupOrder[]> {
  const res = await fetch('/api/orders', {
    headers: { 'X-Owner-Pin': pin },
  });
  return handleJson<PickupOrder[]>(res);
}

export async function updateOrderStatus(
  pin: string,
  id: string,
  status: OrderStatus,
): Promise<PickupOrder> {
  const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Owner-Pin': pin,
    },
    body: JSON.stringify({ status }),
  });
  return handleJson<PickupOrder>(res);
}

export async function submitInquiry(payload: {
  customerName: string;
  customerPhone: string;
  topic: string;
  productName?: string;
  message: string;
}): Promise<TechInquiry> {
  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJson<TechInquiry>(res);
}

export async function fetchInquiries(pin: string): Promise<TechInquiry[]> {
  const res = await fetch('/api/inquiries', {
    headers: { 'X-Owner-Pin': pin },
  });
  return handleJson<TechInquiry[]>(res);
}

export async function updateInquiryStatus(
  pin: string,
  id: string,
  status: InquiryStatus,
): Promise<TechInquiry> {
  const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Owner-Pin': pin,
    },
    body: JSON.stringify({ status }),
  });
  return handleJson<TechInquiry>(res);
}

export async function resetOwnerStore(pin: string): Promise<StorePublicData> {
  const res = await fetch('/api/owner/reset', {
    method: 'POST',
    headers: { 'X-Owner-Pin': pin },
  });
  return handleJson<StorePublicData>(res);
}
