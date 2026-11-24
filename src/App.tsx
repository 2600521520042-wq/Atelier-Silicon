import { Check, MessageCircle, Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CartDrawer } from './components/CartDrawer';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { OwnerStudio } from './components/OwnerStudio';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { TechConsultModal } from './components/TechConsultModal';
import { fetchStoreData } from './lib/api';
import type {
  CartItem,
  PickupOrder,
  Product,
  ProductCategory,
  ProductVariant,
  ShopSettings,
} from './types';

const CATEGORY_TABS: ('All' | ProductCategory)[] = [
  'All',
  'Workstations',
  'Graphics & Core',
  'Displays',
  'Peripherals',
];

export default function App() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [activeView, setActiveView] = useState<'store' | 'owner'>('store');
  const [promoDismissed, setPromoDismissed] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [pickupOnly, setPickupOnly] = useState(false);

  // Interactive modals & drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [techModalOpen, setTechModalOpen] = useState(false);
  const [techContextProduct, setTechContextProduct] = useState<Product | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bagToast, setBagToast] = useState('');

  useEffect(() => {
    let active = true;
    fetchStoreData()
      .then((data) => {
        if (!active) return;
        setSettings(data.settings);
        setProducts(data.products);
        document.title = `${data.settings.shopName} — Precision Electronics Boutique`;
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : 'Unable to load shop inventory.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!bagToast) return;
    const t = setTimeout(() => setBagToast(''), 2600);
    return () => clearTimeout(t);
  }, [bagToast]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (pickupOnly && (!p.pickupAvailable || p.stock <= 0)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.specSnippet.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });
  }, [products, selectedCategory, pickupOnly, searchQuery]);

  const inStockCount = useMemo(
    () => products.filter((p) => p.stock > 0).length,
    [products],
  );

  const bagCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const handleNavigateView = (view: 'store' | 'owner', sectionId?: string) => {
    setActiveView(view);
    if (view === 'store' && sectionId) {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 40);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const addToBag = (product: Product, variant?: ProductVariant) => {
    const chosenVariant = variant || product.variants[0] || {
      id: 'default',
      label: 'Standard',
      priceDelta: 0,
      stock: product.stock,
    };
    const unitPrice = Math.max(0, product.price + chosenVariant.priceDelta);

    setCart((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === product.id && i.variantId === chosenVariant.id,
      );
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
        return copy;
      }
      return [
        ...prev,
        {
          productId: product.id,
          variantId: chosenVariant.id,
          variantLabel: chosenVariant.label,
          brand: product.brand,
          name: product.name,
          sku: product.sku,
          unitPrice,
          quantity: 1,
          imageUrl: product.imageUrl,
        },
      ];
    });
    setSelectedProduct(null);
    setBagToast(`Reserved ${product.name} in bag`);
  };

  const handleUpdateQty = (productId: string, variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveItem = (productId: string, variantId: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variantId === variantId)),
    );
  };

  const handleOrderCompleted = (_order: PickupOrder) => {
    setCart([]);
    fetchStoreData()
      .then((data) => {
        setSettings(data.settings);
        setProducts(data.products);
      })
      .catch(() => {});
  };

  const handleOpenTechChat = (product: Product | null = null) => {
    setSelectedProduct(null);
    setTechContextProduct(product);
    setTechModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF]">
        <div className="space-y-2 text-center">
          <p className="font-display text-lg font-bold text-[#0B132B]">Loading showroom catalog...</p>
          <p className="text-xs text-[#45464D]">Fetching live shelf inventory</p>
        </div>
      </div>
    );
  }

  if (loadError || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] p-6">
        <div className="elevated-card rounded-2xl p-6 max-w-md text-center space-y-3">
          <p className="font-display font-bold text-lg text-[#0B132B]">Unable to reach store server</p>
          <p className="text-sm text-[#45464D]">{loadError || 'Please refresh to retry.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF] pb-16 sm:pb-0">
      <Navbar
        shopName={settings.shopName}
        activeView={activeView}
        bagCount={bagCount}
        onNavigateView={handleNavigateView}
        onOpenBag={() => setBagOpen(true)}
        promoBannerText={settings.promoBannerText}
        showPromoBanner={settings.showPromoBanner && !promoDismissed && activeView === 'store'}
        onDismissPromo={() => setPromoDismissed(true)}
      />

      {bagToast ? (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-[#0B132B] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold">
          <Check className="w-4 h-4 text-[#8FF4E3]" />
          <span>{bagToast}</span>
          <button
            type="button"
            onClick={() => setBagOpen(true)}
            className="text-[#8FF4E3] underline ml-1 cursor-pointer"
          >
            View Bag
          </button>
        </div>
      ) : null}

      <main className="flex-1">
        {activeView === 'owner' ? (
          <OwnerStudio
            settings={settings}
            products={products}
            onBackToStore={() => handleNavigateView('store')}
            onStoreUpdated={(nextSettings, nextProducts) => {
              setSettings(nextSettings);
              setProducts(nextProducts);
              document.title = `${nextSettings.shopName} — Precision Electronics Boutique`;
            }}
          />
        ) : (
          <>
            {/* Section 1: Hero Showcase */}
            <HeroSection
              settings={settings}
              inStockCount={inStockCount}
              onExploreCatalog={() =>
                document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
              }
              onOpenTechChat={() => handleOpenTechChat(null)}
            />

            {/* Section 2: Curated Hardware Catalog */}
            <section
              id="catalog"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
                    In-Store Hardware Catalog
                  </h2>
                  <p className="text-sm text-[#45464D] mt-1">
                    Select any specification to inspect component clearances or hold for 45-minute
                    pickup.
                  </p>
                </div>

                {/* Search Box */}
                <div className="relative w-full lg:w-80">
                  <Search className="w-4 h-4 text-[#76767E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search model, GPU, SKU..."
                    aria-label="Search hardware catalog"
                    className="w-full h-11 pl-10 pr-9 rounded-lg bg-white border border-[#1C2541]/16 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-[#2563EB]/12"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76767E] hover:text-[#0B132B] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-[#EBEDFF] rounded-xl">
                  {CATEGORY_TABS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-white text-[#0B132B] shadow-xs'
                          : 'text-[#45464D] hover:text-[#0B132B]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setPickupOnly((prev) => !prev)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    pickupOnly
                      ? 'border-[#2563EB] bg-[#2563EB]/8 text-[#0051D5]'
                      : 'border-[#1C2541]/15 bg-white text-[#1C2541] hover:bg-[#F2F3FF]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Ready for Today Pickup</span>
                </button>
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="elevated-card rounded-2xl p-10 text-center space-y-3">
                  <p className="font-display font-bold text-lg text-[#0B132B]">
                    No hardware matched your filter
                  </p>
                  <p className="text-sm text-[#45464D]">
                    Try clearing your search term or ask our bench engineer to source a special
                    order.
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setPickupOnly(false);
                      }}
                      className="px-4 py-2 rounded-lg border border-[#1C2541]/15 text-xs font-semibold text-[#1C2541] hover:bg-[#F2F3FF] cursor-pointer"
                    >
                      Reset Filters
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenTechChat(null)}
                      className="px-4 py-2 rounded-lg bg-[#128C7E] text-white text-xs font-semibold cursor-pointer"
                    >
                      Ask Tech Desk
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(prod) => setSelectedProduct(prod)}
                      onQuickAdd={(prod) => addToBag(prod)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Section 3: Neighborhood Tech Desk & Custom Builds */}
            <section
              id="tech-desk"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14"
            >
              <div className="rounded-2xl bg-[#0B132B] text-white p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2.5 max-w-2xl">
                  <p className="text-xs font-semibold tracking-[0.04em] text-[#8FF4E3]">
                    Direct Technician Consultation · {settings.neighborhood}
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-balance">
                    {settings.consultationTitle}
                  </h2>
                  <p className="text-sm sm:text-base text-[#BEC5E5] leading-relaxed">
                    {settings.consultationDescription}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenTechChat(null)}
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-[#128C7E] hover:bg-[#25D366] hover:text-[#0B132B] text-white text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-[0_6px_20px_-2px_rgba(18,140,126,0.35)]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat with Hardware Tech</span>
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-[#1C2541]/10 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#45464D]">
          <div className="space-y-1">
            <p className="font-display font-bold text-sm text-[#0B132B]">{settings.shopName}</p>
            <p>
              {settings.address} · {settings.hours}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => handleOpenTechChat(null)}
              className="hover:text-[#0B132B] font-medium cursor-pointer"
            >
              Tech Concierge
            </button>
            <button
              type="button"
              onClick={() => handleNavigateView('owner')}
              className="hover:text-[#0051D5] font-semibold text-[#0B132B] cursor-pointer"
            >
              Owner Studio
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Dual-Action Bar (Compact <= 10% viewport height) */}
      {activeView === 'store' ? (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#1C2541]/12 px-3 py-2 flex items-center gap-2 shadow-[0_-4px_16px_rgba(11,19,43,0.08)]">
          <button
            type="button"
            onClick={() => handleOpenTechChat(null)}
            className="flex-1 h-11 rounded-lg bg-[#128C7E] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat with Tech</span>
          </button>
          <button
            type="button"
            onClick={() => setBagOpen(true)}
            className="flex-1 h-11 rounded-lg bg-[#0B132B] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Reserve Bag ({bagCount})</span>
          </button>
        </div>
      ) : null}

      {/* Product Detail Modal (PDP) */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onReserve={(prod, variant) => addToBag(prod, variant)}
        onOpenTechChat={(prod) => handleOpenTechChat(prod)}
      />

      {/* Slide-over Reservation & Bag Drawer */}
      <CartDrawer
        open={bagOpen}
        items={cart}
        settings={settings}
        onClose={() => setBagOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* WhatsApp / Hardware Tech Concierge Modal */}
      <TechConsultModal
        open={techModalOpen}
        settings={settings}
        contextProduct={techContextProduct}
        onClose={() => setTechModalOpen(false)}
      />
    </div>
  );
}
