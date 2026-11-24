import {
  ArrowLeft,
  Check,
  Edit3,
  KeyRound,
  Lock,
  MessageSquare,
  Package,
  Plus,
  RotateCcw,
  Save,
  Settings,
  ShoppingBag,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  STUDIO_IMAGE_PRESETS,
  createProduct,
  deleteProduct,
  fetchInquiries,
  fetchOrders,
  formatPrice,
  resetOwnerStore,
  updateInquiryStatus,
  updateOrderStatus,
  updateOwnerPin,
  updateProduct,
  updateShopSettings,
  verifyOwnerPin,
} from '../lib/api';
import type {
  InquiryStatus,
  OrderStatus,
  PickupOrder,
  Product,
  ProductCategory,
  ProductSpecRow,
  ProductVariant,
  ShopSettings,
  TechInquiry,
} from '../types';

interface OwnerStudioProps {
  settings: ShopSettings;
  products: Product[];
  onBackToStore: () => void;
  onStoreUpdated: (nextSettings: ShopSettings, nextProducts: Product[]) => void;
}

type StudioTab = 'inventory' | 'storefront' | 'orders' | 'inquiries';

const CATEGORIES: ProductCategory[] = [
  'Workstations',
  'Graphics & Core',
  'Displays',
  'Peripherals',
];

function createEmptyProduct(): Omit<Product, 'id'> {
  return {
    sku: `AS-${Math.floor(1000 + Math.random() * 9000)}`,
    brand: '',
    name: '',
    category: 'Workstations',
    price: 999,
    stock: 4,
    pickupAvailable: true,
    featured: false,
    specSnippet: 'Bench Verified · Local Warranty',
    warranty: '2-Year Boutique Bench Warranty',
    description: '',
    imageUrl: STUDIO_IMAGE_PRESETS[1].url,
    specs: [
      { label: 'Processor / Core', value: 'Specify architecture' },
      { label: 'Interface', value: 'Thunderbolt 5 / PCIe 5.0' },
    ],
    variants: [
      { id: `v-${Date.now()}`, label: 'Standard Configuration', priceDelta: 0, stock: 4 },
    ],
  };
}

export function OwnerStudio({
  settings,
  products,
  onBackToStore,
  onStoreUpdated,
}: OwnerStudioProps) {
  const [pinInput, setPinInput] = useState('');
  const [ownerPin, setOwnerPin] = useState<string>(() => {
    return sessionStorage.getItem('atelier_owner_pin') || '';
  });
  const [unlocked, setUnlocked] = useState(false);
  const [authError, setAuthError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [activeTab, setActiveTab] = useState<StudioTab>('inventory');
  const [toast, setToast] = useState<string>('');

  // Storefront settings draft
  const [draftSettings, setDraftSettings] = useState<ShopSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  // Product editor state
  const [editingProductId, setEditingProductId] = useState<string | 'new' | null>(null);
  const [productDraft, setProductDraft] = useState<Omit<Product, 'id'>>(createEmptyProduct());
  const [savingProduct, setSavingProduct] = useState(false);

  // Orders & inquiries
  const [orders, setOrders] = useState<PickupOrder[]>([]);
  const [inquiries, setInquiries] = useState<TechInquiry[]>([]);

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // Verify saved session PIN automatically
  useEffect(() => {
    if (!ownerPin) return;
    let active = true;
    verifyOwnerPin(ownerPin).then((ok) => {
      if (!active) return;
      if (ok) {
        setUnlocked(true);
      } else {
        sessionStorage.removeItem('atelier_owner_pin');
        setOwnerPin('');
      }
    });
    return () => {
      active = false;
    };
  }, [ownerPin]);

  // Load owner queues when unlocked
  useEffect(() => {
    if (!unlocked || !ownerPin) return;
    Promise.all([fetchOrders(ownerPin), fetchInquiries(ownerPin)])
      .then(([ord, inq]) => {
        setOrders(ord);
        setInquiries(inq);
      })
      .catch(() => {
        // Ignore transient fetch errors
      });
  }, [unlocked, ownerPin]);

  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setVerifying(true);
    try {
      const ok = await verifyOwnerPin(pinInput.trim());
      if (!ok) {
        setAuthError('Incorrect owner PIN. Default demo PIN is 2026.');
      } else {
        const cleanPin = pinInput.trim();
        sessionStorage.setItem('atelier_owner_pin', cleanPin);
        setOwnerPin(cleanPin);
        setUnlocked(true);
      }
    } catch {
      setAuthError('Unable to verify PIN right now.');
    } finally {
      setVerifying(false);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('atelier_owner_pin');
    setOwnerPin('');
    setPinInput('');
    setUnlocked(false);
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const saved = await updateShopSettings(ownerPin, draftSettings);
      if (newPinInput.trim()) {
        await updateOwnerPin(ownerPin, newPinInput.trim());
        sessionStorage.setItem('atelier_owner_pin', newPinInput.trim());
        setOwnerPin(newPinInput.trim());
        setNewPinInput('');
      }
      onStoreUpdated(saved, products);
      setToast('Storefront branding and details saved.');
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetDefaults = async () => {
    try {
      const reset = await resetOwnerStore(ownerPin);
      setDraftSettings(reset.settings);
      onStoreUpdated(reset.settings, reset.products);
      setToast('Storefront and catalog restored to defaults.');
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Reset failed.');
    }
  };

  const startCreateProduct = () => {
    setEditingProductId('new');
    setProductDraft(createEmptyProduct());
  };

  const startEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductDraft({
      sku: prod.sku,
      brand: prod.brand,
      name: prod.name,
      category: prod.category,
      price: prod.price,
      stock: prod.stock,
      pickupAvailable: prod.pickupAvailable,
      featured: prod.featured,
      specSnippet: prod.specSnippet,
      warranty: prod.warranty,
      description: prod.description,
      imageUrl: prod.imageUrl,
      specs: prod.specs.map((s) => ({ ...s })),
      variants: prod.variants.map((v) => ({ ...v })),
    });
  };

  const handleImageUpload = (
    e: ChangeEvent<HTMLInputElement>,
    onLoad: (dataUrl: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_800_000) {
      setToast('Please choose an image smaller than 1.8 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLoad(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      if (editingProductId === 'new') {
        const created = await createProduct(ownerPin, productDraft);
        onStoreUpdated(settings, [created, ...products]);
        setToast(`Added ${created.brand} ${created.name} to catalog.`);
      } else if (editingProductId) {
        const updated = await updateProduct(ownerPin, editingProductId, productDraft);
        onStoreUpdated(
          settings,
          products.map((p) => (p.id === updated.id ? updated : p)),
        );
        setToast(`Updated ${updated.name}.`);
      }
      setEditingProductId(null);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Unable to save product.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleQuickStockDelta = async (prod: Product, delta: number) => {
    const nextStock = Math.max(0, prod.stock + delta);
    try {
      const updated = await updateProduct(ownerPin, prod.id, { stock: nextStock });
      onStoreUpdated(
        settings,
        products.map((p) => (p.id === updated.id ? updated : p)),
      );
    } catch {
      setToast('Could not update stock count.');
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    try {
      await deleteProduct(ownerPin, prod.id);
      onStoreUpdated(
        settings,
        products.filter((p) => p.id !== prod.id),
      );
      setToast(`Removed ${prod.name}.`);
    } catch {
      setToast('Could not delete product.');
    }
  };

  const handleOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(ownerPin, orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setToast(`Order ${updated.orderNumber} marked ${status}.`);
    } catch {
      setToast('Failed to update order status.');
    }
  };

  const handleInquiryStatus = async (inqId: string, status: InquiryStatus) => {
    try {
      const updated = await updateInquiryStatus(ownerPin, inqId, status);
      setInquiries((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setToast(`Inquiry marked ${status}.`);
    } catch {
      setToast('Failed to update inquiry status.');
    }
  };

  if (!unlocked) {
    return (
      <section className="max-w-md mx-auto px-4 py-16">
        <div className="elevated-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#0B132B] text-white flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-[#0B132B]">
              Shop Owner Studio
            </h1>
            <p className="text-sm text-[#45464D]">
              Enter your owner PIN to edit storefront branding, manage hardware inventory, and review
              pickup reservations.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label htmlFor="owner-pin" className="block text-xs font-semibold text-[#1C2541] mb-1.5">
                Owner Access PIN
              </label>
              <input
                id="owner-pin"
                type="password"
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN (default: 2026)"
                className="w-full h-11 px-3.5 rounded-lg bg-white border border-[#1C2541]/18 text-sm font-mono focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-[#2563EB]/12"
              />
            </div>

            {authError ? <p className="text-xs font-medium text-[#BA1A1A]">{authError}</p> : null}

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={verifying}
                className="w-full h-11 rounded-lg bg-[#0B132B] hover:bg-[#1C2541] text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                {verifying ? 'Verifying...' : 'Unlock Owner Studio'}
              </button>
              <button
                type="button"
                onClick={() => setPinInput('2026')}
                className="w-full h-10 rounded-lg border border-[#1C2541]/15 hover:bg-[#F2F3FF] text-xs font-semibold text-[#1C2541] cursor-pointer"
              >
                Use Default Owner PIN (2026)
              </button>
            </div>
          </form>

          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0051D5] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to customer storefront</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1C2541]/10">
        <div>
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0051D5] hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Live Storefront</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
            {settings.shopName} · Owner Studio
          </h1>
          <p className="text-sm text-[#45464D]">
            All edits persist immediately to the shop database and reflect on the customer storefront.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          {toast ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#166534] bg-[#DCFCE7] px-3 py-1.5 rounded-lg">
              <Check className="w-3.5 h-3.5" />
              {toast}
            </span>
          ) : null}
          <button
            type="button"
            onClick={handleLock}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#1C2541]/15 text-xs font-semibold text-[#1C2541] hover:bg-[#F2F3FF] cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Studio</span>
          </button>
        </div>
      </div>

      {/* Studio Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-[#EBEDFF] rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'inventory'
              ? 'bg-white text-[#0B132B] shadow-xs'
              : 'text-[#45464D] hover:text-[#0B132B]'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Catalog ({products.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('storefront')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'storefront'
              ? 'bg-white text-[#0B132B] shadow-xs'
              : 'text-[#45464D] hover:text-[#0B132B]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Storefront &amp; Brand</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'orders'
              ? 'bg-white text-[#0B132B] shadow-xs'
              : 'text-[#45464D] hover:text-[#0B132B]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Pickup Orders ({orders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('inquiries')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'inquiries'
              ? 'bg-white text-[#0B132B] shadow-xs'
              : 'text-[#45464D] hover:text-[#0B132B]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Tech Inquiries ({inquiries.length})</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY & CATALOG */}
      {activeTab === 'inventory' ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#45464D]">
              Add new hardware, update pricing, adjust shelf counts, or edit technical specs.
            </p>
            <button
              type="button"
              onClick={startCreateProduct}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#0051D5] text-white text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hardware Item</span>
            </button>
          </div>

          {editingProductId !== null ? (
            <form
              onSubmit={handleSaveProduct}
              className="elevated-card rounded-2xl p-5 sm:p-7 space-y-6"
            >
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#1C2541]/10">
                <h2 className="font-display text-lg font-bold text-[#0B132B]">
                  {editingProductId === 'new' ? 'New Hardware Listing' : `Edit ${productDraft.name}`}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingProductId(null)}
                  className="text-xs font-semibold text-[#45464D] hover:text-[#0B132B] cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C2541] mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={productDraft.brand}
                    onChange={(e) => setProductDraft({ ...productDraft, brand: e.target.value })}
                    placeholder="PROART / NVIDIA / SONY"
                    className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                    Product Model Name
                  </label>
                  <input
                    type="text"
                    required
                    value={productDraft.name}
                    onChange={(e) => setProductDraft({ ...productDraft, name: e.target.value })}
                    placeholder="StudioBook 16 Pro OLED"
                    className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C2541] mb-1">Category</label>
                  <select
                    value={productDraft.category}
                    onChange={(e) =>
                      setProductDraft({
                        ...productDraft,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C2541] mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={productDraft.sku}
                    onChange={(e) => setProductDraft({ ...productDraft, sku: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm font-mono bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={productDraft.price}
                      onChange={(e) =>
                        setProductDraft({ ...productDraft, price: Number(e.target.value) })
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                      Shelf Stock
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={productDraft.stock}
                      onChange={(e) =>
                        setProductDraft({ ...productDraft, stock: Number(e.target.value) })
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm font-mono bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                    Spec Snippet (Card Summary)
                  </label>
                  <input
                    type="text"
                    value={productDraft.specSnippet}
                    onChange={(e) =>
                      setProductDraft({ ...productDraft, specSnippet: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                    Warranty Line
                  </label>
                  <input
                    type="text"
                    value={productDraft.warranty}
                    onChange={(e) => setProductDraft({ ...productDraft, warranty: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={productDraft.description}
                  onChange={(e) =>
                    setProductDraft({ ...productDraft, description: e.target.value })
                  }
                  className="w-full p-3 rounded-lg border border-[#1C2541]/18 text-sm bg-white"
                />
              </div>

              {/* Image URL / Studio Asset Picker / Upload */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-[#1C2541]">
                  Product Photography (Studio Preset, URL, or Upload)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={productDraft.imageUrl}
                    onChange={(e) => setProductDraft({ ...productDraft, imageUrl: e.target.value })}
                    placeholder="https://... or /src/assets/images/..."
                    className="flex-1 min-w-[220px] h-10 px-3 rounded-lg border border-[#1C2541]/18 text-xs font-mono bg-white"
                  />
                  <label className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-[#1C2541]/18 bg-white hover:bg-[#F2F3FF] text-xs font-semibold text-[#1C2541] cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, (dataUrl) =>
                          setProductDraft({ ...productDraft, imageUrl: dataUrl }),
                        )
                      }
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {STUDIO_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setProductDraft({ ...productDraft, imageUrl: preset.url })}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                        productDraft.imageUrl === preset.url
                          ? 'border-[#2563EB] bg-[#2563EB]/8 text-[#0051D5]'
                          : 'border-[#1C2541]/12 text-[#45464D] hover:bg-[#F2F3FF]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spec Rows & Variants */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-[#1C2541]/10">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1C2541]">Technical Spec Rows</span>
                    <button
                      type="button"
                      onClick={() =>
                        setProductDraft({
                          ...productDraft,
                          specs: [...productDraft.specs, { label: 'Feature', value: 'Detail' }],
                        })
                      }
                      className="text-xs font-semibold text-[#0051D5] hover:underline cursor-pointer"
                    >
                      + Add Row
                    </button>
                  </div>
                  <div className="space-y-2">
                    {productDraft.specs.map((row: ProductSpecRow, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={row.label}
                          onChange={(e) => {
                            const next = [...productDraft.specs];
                            next[i] = { ...row, label: e.target.value };
                            setProductDraft({ ...productDraft, specs: next });
                          }}
                          placeholder="Label"
                          className="w-1/3 h-9 px-2.5 rounded-lg border border-[#1C2541]/15 text-xs bg-white"
                        />
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => {
                            const next = [...productDraft.specs];
                            next[i] = { ...row, value: e.target.value };
                            setProductDraft({ ...productDraft, specs: next });
                          }}
                          placeholder="Value"
                          className="flex-1 h-9 px-2.5 rounded-lg border border-[#1C2541]/15 text-xs font-mono bg-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setProductDraft({
                              ...productDraft,
                              specs: productDraft.specs.filter((_, idx) => idx !== i),
                            })
                          }
                          aria-label="Remove spec row"
                          className="p-1.5 text-[#76767E] hover:text-[#BA1A1A] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1C2541]">
                      Configuration Variants
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setProductDraft({
                          ...productDraft,
                          variants: [
                            ...productDraft.variants,
                            {
                              id: `v-${Date.now()}`,
                              label: 'Upgraded Spec',
                              priceDelta: 200,
                              stock: 2,
                            },
                          ],
                        })
                      }
                      className="text-xs font-semibold text-[#0051D5] hover:underline cursor-pointer"
                    >
                      + Add Variant
                    </button>
                  </div>
                  <div className="space-y-2">
                    {productDraft.variants.map((variant: ProductVariant, i: number) => (
                      <div key={variant.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={variant.label}
                          onChange={(e) => {
                            const next = [...productDraft.variants];
                            next[i] = { ...variant, label: e.target.value };
                            setProductDraft({ ...productDraft, variants: next });
                          }}
                          placeholder="Variant Name"
                          className="flex-1 h-9 px-2.5 rounded-lg border border-[#1C2541]/15 text-xs bg-white"
                        />
                        <input
                          type="number"
                          value={variant.priceDelta}
                          onChange={(e) => {
                            const next = [...productDraft.variants];
                            next[i] = { ...variant, priceDelta: Number(e.target.value) };
                            setProductDraft({ ...productDraft, variants: next });
                          }}
                          title="Price delta ($)"
                          className="w-20 h-9 px-2 rounded-lg border border-[#1C2541]/15 text-xs font-mono bg-white"
                        />
                        <input
                          type="number"
                          min={0}
                          value={variant.stock}
                          onChange={(e) => {
                            const next = [...productDraft.variants];
                            next[i] = { ...variant, stock: Number(e.target.value) };
                            setProductDraft({ ...productDraft, variants: next });
                          }}
                          title="Stock"
                          className="w-16 h-9 px-2 rounded-lg border border-[#1C2541]/15 text-xs font-mono bg-white"
                        />
                        {productDraft.variants.length > 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setProductDraft({
                                ...productDraft,
                                variants: productDraft.variants.filter((_, idx) => idx !== i),
                              })
                            }
                            aria-label="Remove variant"
                            className="p-1.5 text-[#76767E] hover:text-[#BA1A1A] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#1C2541]/10">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#1C2541] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productDraft.pickupAvailable}
                    onChange={(e) =>
                      setProductDraft({ ...productDraft, pickupAvailable: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#2563EB] rounded"
                  />
                  <span>Ready for Same-Day Counter Pickup</span>
                </label>

                <button
                  type="submit"
                  disabled={savingProduct}
                  className="inline-flex items-center gap-2 px-5 h-11 rounded-lg bg-[#0B132B] hover:bg-[#1C2541] text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProduct ? 'Saving...' : 'Save Hardware Item'}</span>
                </button>
              </div>
            </form>
          ) : null}

          {/* Inventory Table */}
          <div className="elevated-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1C2541]/10 bg-[#FAF8FF] text-xs font-semibold text-[#45464D]">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-center">Shelf Stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2541]/8 text-sm">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#FAF8FF]/60">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-lg object-cover bg-[#F1F5F9] shrink-0"
                          />
                          <div>
                            <p className="text-[11px] font-semibold text-[#45464D]">{prod.brand}</p>
                            <p className="font-display font-bold text-[#0B132B]">{prod.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#45464D]">{prod.sku}</td>
                      <td className="py-3.5 px-4 text-xs text-[#111A36]">{prod.category}</td>
                      <td className="py-3.5 px-4 text-right font-display font-bold text-[#0B132B] tabular-nums">
                        {formatPrice(prod.price)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickStockDelta(prod, -1)}
                            className="w-7 h-7 rounded-md border border-[#1C2541]/15 hover:bg-[#F2F3FF] text-xs font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-mono text-xs font-semibold tabular-nums">
                            {prod.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickStockDelta(prod, 1)}
                            className="w-7 h-7 rounded-md border border-[#1C2541]/15 hover:bg-[#F2F3FF] text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEditProduct(prod)}
                            aria-label={`Edit ${prod.name}`}
                            className="p-2 rounded-lg border border-[#1C2541]/15 text-[#1C2541] hover:bg-[#F2F3FF] cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod)}
                            aria-label={`Delete ${prod.name}`}
                            className="p-2 rounded-lg border border-[#1C2541]/15 text-[#BA1A1A] hover:bg-[#FFDAD6]/40 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {/* TAB 2: STOREFRONT & BRAND EDITOR */}
      {activeTab === 'storefront' ? (
        <form onSubmit={handleSaveSettings} className="elevated-card rounded-2xl p-5 sm:p-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1C2541]/10">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0B132B]">
                Storefront Branding, Hero &amp; Coordinates
              </h2>
              <p className="text-xs text-[#45464D]">
                Customize your shop title, showroom photography, pickup hours, and WhatsApp line.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1C2541]/15 text-xs font-semibold text-[#45464D] hover:text-[#0B132B] hover:bg-[#F2F3FF] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C2541] mb-1">Shop Name</label>
              <input
                type="text"
                required
                value={draftSettings.shopName}
                onChange={(e) => setDraftSettings({ ...draftSettings, shopName: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                Neighborhood / District Label
              </label>
              <input
                type="text"
                value={draftSettings.neighborhood}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, neighborhood: e.target.value })
                }
                className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                Showroom Street Address
              </label>
              <input
                type="text"
                value={draftSettings.address}
                onChange={(e) => setDraftSettings({ ...draftSettings, address: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                Opening &amp; Pickup Hours
              </label>
              <input
                type="text"
                value={draftSettings.hours}
                onChange={(e) => setDraftSettings({ ...draftSettings, hours: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                WhatsApp Tech Number (with country code)
              </label>
              <input
                type="text"
                value={draftSettings.whatsappNumber}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, whatsappNumber: e.target.value })
                }
                className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm font-mono bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                Hero Primary CTA Label
              </label>
              <input
                type="text"
                value={draftSettings.heroCtaLabel}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, heroCtaLabel: e.target.value })
                }
                className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm bg-white"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-[#1C2541]/10">
            <div>
              <label className="block text-xs font-semibold text-[#1C2541] mb-1">Hero Kicker</label>
              <input
                type="text"
                value={draftSettings.heroKicker}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, heroKicker: e.target.value })
                }
                className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                Hero Headline
              </label>
              <input
                type="text"
                value={draftSettings.heroHeadline}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, heroHeadline: e.target.value })
                }
                className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                Hero Subheadline
              </label>
              <textarea
                rows={2}
                value={draftSettings.heroSubheadline}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, heroSubheadline: e.target.value })
                }
                className="w-full p-3 rounded-lg border border-[#1C2541]/18 text-sm bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1C2541]">
                Hero Showroom Photo
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={draftSettings.heroImageUrl}
                  onChange={(e) =>
                    setDraftSettings({ ...draftSettings, heroImageUrl: e.target.value })
                  }
                  className="flex-1 min-w-[220px] h-10 px-3 rounded-lg border border-[#1C2541]/18 text-xs font-mono bg-white"
                />
                <label className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-[#1C2541]/18 bg-white hover:bg-[#F2F3FF] text-xs font-semibold text-[#1C2541] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Hero Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageUpload(e, (dataUrl) =>
                        setDraftSettings({ ...draftSettings, heroImageUrl: dataUrl }),
                      )
                    }
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {STUDIO_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() =>
                      setDraftSettings({ ...draftSettings, heroImageUrl: preset.url })
                    }
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                      draftSettings.heroImageUrl === preset.url
                        ? 'border-[#2563EB] bg-[#2563EB]/8 text-[#0051D5]'
                        : 'border-[#1C2541]/12 text-[#45464D] hover:bg-[#F2F3FF]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#1C2541]/10">
            <div>
              <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                Announcement Strip Text
              </label>
              <input
                type="text"
                value={draftSettings.promoBannerText}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, promoBannerText: e.target.value })
                }
                className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm bg-white"
              />
              <label className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-[#45464D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftSettings.showPromoBanner}
                  onChange={(e) =>
                    setDraftSettings({ ...draftSettings, showPromoBanner: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#2563EB]"
                />
                <span>Display top announcement strip</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C2541] mb-1">
                Change Owner PIN (Optional)
              </label>
              <input
                type="password"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="Leave blank to keep current PIN"
                className="w-full h-10 px-3 rounded-lg border border-[#1C2541]/18 text-sm font-mono bg-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-2 px-6 h-11 rounded-lg bg-[#0B132B] hover:bg-[#1C2541] text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? 'Saving Storefront...' : 'Save Storefront Changes'}</span>
            </button>
          </div>
        </form>
      ) : null}

      {/* TAB 3: PICKUP ORDERS */}
      {activeTab === 'orders' ? (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="elevated-card rounded-2xl p-8 text-center text-sm text-[#45464D]">
              No customer reservations yet.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="elevated-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-[#0B132B]">#{order.orderNumber}</span>
                    <span aria-hidden="true" className="text-[#C6C6CE]">·</span>
                    <span className="font-semibold text-[#111A36]">{order.customerName}</span>
                    <span aria-hidden="true" className="text-[#C6C6CE]">·</span>
                    <span className="font-mono text-[#45464D]">{order.customerPhone}</span>
                    <span aria-hidden="true" className="text-[#C6C6CE]">·</span>
                    <span className="text-[#0051D5] font-medium">
                      {order.fulfillment === 'pickup' ? 'Counter Pickup' : 'Local Courier'}
                    </span>
                  </div>
                  <p className="text-xs text-[#45464D]">{order.pickupWindowOrAddress}</p>
                  <p className="text-xs text-[#111A36]">
                    {order.items
                      .map((i) => `${i.quantity}x ${i.name} (${i.variantLabel})`)
                      .join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <p className="font-display text-base font-extrabold text-[#0B132B] tabular-nums">
                    {formatPrice(order.subtotal)}
                  </p>
                  <select
                    value={order.status}
                    onChange={(e) => handleOrderStatus(order.id, e.target.value as OrderStatus)}
                    className="h-9 px-3 rounded-lg border border-[#1C2541]/18 text-xs font-semibold bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Ready at Counter">Ready at Counter</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {/* TAB 4: TECH INQUIRIES */}
      {activeTab === 'inquiries' ? (
        <div className="space-y-3">
          {inquiries.length === 0 ? (
            <div className="elevated-card rounded-2xl p-8 text-center text-sm text-[#45464D]">
              No tech desk inquiries yet.
            </div>
          ) : (
            inquiries.map((inq) => (
              <div
                key={inq.id}
                className="elevated-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-[#0B132B]">{inq.customerName}</span>
                    <span aria-hidden="true" className="text-[#C6C6CE]">·</span>
                    <span className="font-mono text-[#45464D]">{inq.customerPhone}</span>
                    <span aria-hidden="true" className="text-[#C6C6CE]">·</span>
                    <span className="text-[#128C7E] font-semibold">{inq.topic}</span>
                    {inq.productName ? (
                      <>
                        <span aria-hidden="true" className="text-[#C6C6CE]">·</span>
                        <span className="text-[#0051D5]">{inq.productName}</span>
                      </>
                    ) : null}
                  </div>
                  <p className="text-sm text-[#111A36]">{inq.message}</p>
                </div>

                <select
                  value={inq.status}
                  onChange={(e) => handleInquiryStatus(inq.id, e.target.value as InquiryStatus)}
                  className="h-9 px-3 rounded-lg border border-[#1C2541]/18 text-xs font-semibold bg-white self-start md:self-center"
                >
                  <option value="Open">Open</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}
