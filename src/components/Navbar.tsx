import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  shopName: string;
  activeView: 'store' | 'owner';
  bagCount: number;
  onNavigateView: (view: 'store' | 'owner', sectionId?: string) => void;
  onOpenBag: () => void;
  promoBannerText?: string;
  showPromoBanner?: boolean;
  onDismissPromo?: () => void;
}

export function Navbar({
  shopName,
  activeView,
  bagCount,
  onNavigateView,
  onOpenBag,
  promoBannerText,
  showPromoBanner,
  onDismissPromo,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLink = (view: 'store' | 'owner', sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigateView(view, sectionId);
  };

  return (
    <div className="sticky top-0 z-40 bg-[#FAF8FF]/95 backdrop-blur-md border-b border-[#1C2541]/10">
      {showPromoBanner && promoBannerText ? (
        <div className="bg-[#0B132B] text-[#EFF0FF] text-xs px-4 py-2 flex items-center justify-center gap-4">
          <p className="truncate text-center font-medium">{promoBannerText}</p>
          {onDismissPromo ? (
            <button
              type="button"
              onClick={onDismissPromo}
              aria-label="Dismiss announcement"
              className="text-[#BEC5E5] hover:text-white transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      ) : null}

      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleLink('store')}
          className="font-display text-lg font-extrabold tracking-tight text-[#0B132B] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB]"
        >
          {shopName}
        </button>

        {/* Zone 2: 4 concise single-line text links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#45464D]">
          <button
            type="button"
            onClick={() => handleLink('store', 'catalog')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#0B132B] hover:underline underline-offset-4 cursor-pointer ${
              activeView === 'store' ? 'text-[#0B132B]' : ''
            }`}
          >
            Catalog
          </button>
          <button
            type="button"
            onClick={() => handleLink('store', 'showroom')}
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#0B132B] hover:underline underline-offset-4 cursor-pointer"
          >
            Showroom
          </button>
          <button
            type="button"
            onClick={() => handleLink('store', 'tech-desk')}
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#0B132B] hover:underline underline-offset-4 cursor-pointer"
          >
            Tech Desk
          </button>
          <button
            type="button"
            onClick={() => handleLink('owner')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#0B132B] hover:underline underline-offset-4 cursor-pointer ${
              activeView === 'owner' ? 'text-[#0051D5] font-semibold underline' : ''
            }`}
          >
            Owner Studio
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenBag}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B132B] hover:bg-[#1C2541] active:scale-[0.98] rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Reserve Bag</span>
            <span className="tabular-nums text-[#8FF4E3]">({bagCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg border border-[#1C2541]/15 text-[#1C2541] hover:bg-[#F2F3FF]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="md:hidden border-t border-[#1C2541]/10 bg-white px-4 py-3 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => handleLink('store', 'catalog')}
            className="text-left py-2.5 px-2 text-sm font-medium text-[#111A36] hover:bg-[#F2F3FF] rounded-lg"
          >
            Catalog
          </button>
          <button
            type="button"
            onClick={() => handleLink('store', 'showroom')}
            className="text-left py-2.5 px-2 text-sm font-medium text-[#111A36] hover:bg-[#F2F3FF] rounded-lg"
          >
            Showroom
          </button>
          <button
            type="button"
            onClick={() => handleLink('store', 'tech-desk')}
            className="text-left py-2.5 px-2 text-sm font-medium text-[#111A36] hover:bg-[#F2F3FF] rounded-lg"
          >
            Tech Desk
          </button>
          <button
            type="button"
            onClick={() => handleLink('owner')}
            className="text-left py-2.5 px-2 text-sm font-semibold text-[#0051D5] hover:bg-[#F2F3FF] rounded-lg"
          >
            Owner Studio
          </button>
        </div>
      ) : null}
    </div>
  );
}
