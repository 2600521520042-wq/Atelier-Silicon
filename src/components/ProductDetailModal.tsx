import { CheckCircle2, MessageCircle, ShieldCheck, X, Cpu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatPrice } from '../lib/api';
import type { Product, ProductVariant } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onReserve: (product: Product, variant: ProductVariant) => void;
  onOpenTechChat: (product: Product) => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onReserve,
  onOpenTechChat,
}: ProductDetailModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (product && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
      setImgFailed(false);
    }
  }, [product]);

  if (!product) return null;

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const computedPrice = Math.max(0, product.price + (activeVariant?.priceDelta ?? 0));
  const availableStock = activeVariant ? Math.min(product.stock, activeVariant.stock) : product.stock;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B132B]/55 backdrop-blur-xs p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
    >
      <div className="elevated-sheet w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-[#1C2541]/10">
        {/* Top Close Strip */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#1C2541]/8 px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="text-xs text-[#45464D] truncate">
            <span className="font-semibold text-[#0B132B]">{product.brand}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>{product.category}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span className="font-mono">{product.sku}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="p-2 rounded-lg text-[#45464D] hover:text-[#0B132B] hover:bg-[#F2F3FF] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Gallery + Spec Table */}
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-[4/3] rounded-xl bg-[#F1F5F9] overflow-hidden border border-[#1C2541]/8">
              {!imgFailed && product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={`${product.brand} ${product.name}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#1C2541]">
                  <Cpu className="w-10 h-10 text-[#0051D5]" />
                  <span className="text-sm font-medium">{product.name}</span>
                </div>
              )}
            </div>

            {product.specs.length > 0 ? (
              <div>
                <h3 className="font-display text-sm font-bold text-[#0B132B] mb-3">
                  Technical Specifications
                </h3>
                <div className="border border-[#1C2541]/10 rounded-xl overflow-hidden divide-y divide-[#1C2541]/8 bg-[#FAF8FF]">
                  {product.specs.map((row) => (
                    <div
                      key={`${row.label}-${row.value}`}
                      className="px-4 py-2.5 flex items-center justify-between gap-4 text-xs sm:text-sm"
                    >
                      <span className="text-[#45464D] shrink-0">{row.label}</span>
                      <span className="font-mono font-medium text-[#0B132B] text-right tabular-nums">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div>
                <h2 id="pdp-title" className="font-display text-2xl font-extrabold text-[#0B132B] tracking-tight">
                  {product.name}
                </h2>
                <p className="mt-2 font-display text-3xl font-extrabold text-[#0B132B] tabular-nums">
                  {formatPrice(computedPrice)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium">
                <span className="inline-flex items-center gap-1.5 text-[#166534]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="tabular-nums">
                    {availableStock > 0
                      ? `${availableStock} units available for pickup`
                      : 'Currently out of stock'}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#0051D5]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{product.warranty}</span>
                </span>
              </div>

              <p className="text-sm leading-relaxed text-[#45464D]">{product.description}</p>

              {/* Configuration Variants */}
              {product.variants.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-[#1C2541]">Configuration</p>
                  <div className="space-y-2">
                    {product.variants.map((variant) => {
                      const isSelected = activeVariant?.id === variant.id;
                      const variantPrice = Math.max(0, product.price + variant.priceDelta);
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`w-full px-3.5 py-3 rounded-lg border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#2563EB] bg-[#2563EB]/5 ring-2 ring-[#2563EB]/15'
                              : 'border-[#1C2541]/15 bg-white hover:border-[#1C2541]/35'
                          }`}
                        >
                          <span className="text-sm font-medium text-[#0B132B]">{variant.label}</span>
                          <span className="font-display text-sm font-bold text-[#0B132B] tabular-nums shrink-0">
                            {formatPrice(variantPrice)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Dual Action Bar */}
            <div className="pt-4 border-t border-[#1C2541]/10 flex flex-col gap-2.5">
              <button
                type="button"
                disabled={availableStock <= 0}
                onClick={() => {
                  if (activeVariant) {
                    onReserve(product, activeVariant);
                  }
                }}
                className="w-full h-12 px-5 rounded-lg bg-[#2563EB] hover:bg-[#0051D5] disabled:bg-[#C6C6CE] disabled:cursor-not-allowed active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-[0_0_14px_rgba(37,99,235,0.28)] cursor-pointer"
              >
                {availableStock > 0 ? 'Reserve for Counter Pickup' : 'Out of Stock'}
              </button>

              <button
                type="button"
                onClick={() => onOpenTechChat(product)}
                className="w-full h-11 px-5 rounded-lg bg-[#128C7E] hover:bg-[#0F766A] active:scale-[0.98] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Hardware Tech</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
