import { ArrowRight, MapPin, MessageCircle, ShieldCheck, Cpu } from 'lucide-react';
import { useState } from 'react';
import type { ShopSettings } from '../types';

interface HeroSectionProps {
  settings: ShopSettings;
  inStockCount: number;
  onExploreCatalog: () => void;
  onOpenTechChat: () => void;
}

export function HeroSection({
  settings,
  inStockCount,
  onExploreCatalog,
  onOpenTechChat,
}: HeroSectionProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section id="showroom" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 lg:pt-12 lg:pb-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* Left editorial column */}
        <div className="lg:col-span-6 flex flex-col justify-between py-2">
          <div className="space-y-5">
            <p className="text-xs font-semibold tracking-[0.04em] text-[#0051D5]">
              {settings.neighborhood} · {settings.heroKicker}
            </p>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.12] tracking-[-0.03em] text-[#0B132B] text-balance">
              {settings.heroHeadline}
            </h1>

            <p className="text-base leading-relaxed text-[#45464D] max-w-xl">
              {settings.heroSubheadline}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onExploreCatalog}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#0B132B] hover:bg-[#1C2541] active:scale-[0.98] text-white text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
              >
                <span>{settings.heroCtaLabel || 'Browse Catalog'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenTechChat}
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-lg bg-[#128C7E] hover:bg-[#0F766A] active:scale-[0.98] text-white text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-[0_6px_20px_-2px_rgba(18,140,126,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Hardware Tech</span>
              </button>
            </div>
          </div>

          {/* Local boutique coordinates placed inside hero, never in top bar */}
          <div className="mt-8 pt-5 border-t border-[#1C2541]/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#45464D]">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#111A36]">
              <MapPin className="w-3.5 h-3.5 text-[#0051D5]" />
              {settings.address}
            </span>
            <span aria-hidden="true" className="text-[#C6C6CE]">·</span>
            <span>{settings.hours}</span>
            <span aria-hidden="true" className="text-[#C6C6CE]">·</span>
            <span className="tabular-nums font-medium text-[#166534]">
              {inStockCount} models ready on shelf
            </span>
          </div>
        </div>

        {/* Right visual showcase */}
        <div className="lg:col-span-6">
          <div className="h-full min-h-[260px] sm:min-h-[340px] rounded-2xl overflow-hidden bg-[#F1F5F9] border border-[#1C2541]/10 shadow-[0_4px_16px_-2px_rgba(11,19,43,0.06)] relative">
            {!imgFailed && settings.heroImageUrl ? (
              <img
                src={settings.heroImageUrl}
                alt={`${settings.shopName} showroom workstation bench`}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#EBEDFF] to-[#DBE1FF] text-[#1C2541] p-8 text-center">
                <Cpu className="w-10 h-10 text-[#0051D5]" />
                <p className="font-display font-bold text-lg">{settings.shopName} Showroom</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4-column proof strip anchored directly below hero split */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="elevated-card rounded-xl px-4 py-3.5">
          <p className="font-display text-sm font-bold text-[#0B132B] tabular-nums">45-Min Counter Hold</p>
          <p className="text-xs text-[#45464D] mt-0.5">Reserve online, inspect sealed box in store</p>
        </div>
        <div className="elevated-card rounded-xl px-4 py-3.5">
          <p className="font-display text-sm font-bold text-[#0B132B] tabular-nums">Delta-E &amp; Burn-In Tested</p>
          <p className="text-xs text-[#45464D] mt-0.5">Pre-verified thermals and panel uniformity</p>
        </div>
        <div className="elevated-card rounded-xl px-4 py-3.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0051D5] shrink-0" />
            <p className="font-display text-sm font-bold text-[#0B132B]">Direct Bench Warranty</p>
          </div>
          <p className="text-xs text-[#45464D] mt-0.5">Local counter swaps without mail-in delays</p>
        </div>
        <div className="elevated-card rounded-xl px-4 py-3.5">
          <p className="font-display text-sm font-bold text-[#0B132B]">Live Engineer Desk</p>
          <p className="text-xs text-[#45464D] mt-0.5">WhatsApp compatibility &amp; build quotes</p>
        </div>
      </div>
    </section>
  );
}
