import { CheckCircle2, AlertTriangle, Cpu, Plus } from 'lucide-react';
import { useState } from 'react';
import { formatPrice } from '../lib/api';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export function ProductCard({ product, onSelect, onQuickAdd }: ProductCardProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 2;

  return (
    <article className="elevated-card rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(11,19,43,0.08)]">
      {/* Studio Image Container */}
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="relative aspect-[4/3] w-full bg-[#F1F5F9] overflow-hidden text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
      >
        {!imgFailed && product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={`${product.brand} ${product.name}`}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#F1F5F9] to-[#E3E7FF] text-[#1C2541] p-4">
            <Cpu className="w-8 h-8 text-[#0051D5]" />
            <span className="text-xs font-medium text-center">{product.name}</span>
          </div>
        )}
      </button>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          {/* Unboxed metadata line — zero pills */}
          <div className="flex items-center justify-between gap-2 text-xs text-[#45464D]">
            <span className="font-semibold tracking-[0.03em] text-[#1C2541] truncate">
              {product.brand} · {product.category}
            </span>
            <span className="font-mono text-[11px] text-[#76767E] shrink-0">{product.sku}</span>
          </div>

          <button
            type="button"
            onClick={() => onSelect(product)}
            className="block text-left w-full cursor-pointer group"
          >
            <h3 className="font-display text-base font-bold text-[#0B132B] leading-snug group-hover:text-[#0051D5] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </button>

          <p className="font-mono text-xs text-[#45464D] truncate">{product.specSnippet}</p>

          {/* Accessible non-pill stock status */}
          <div className="pt-0.5 flex items-center gap-1.5 text-xs font-medium">
            {isOutOfStock ? (
              <span className="text-[#93000A]">Out of stock · Order lead time 3 days</span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1.5 text-[#92400E]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span className="tabular-nums">Low stock ({product.stock} left in store)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[#166534]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="tabular-nums">
                  {product.pickupAvailable ? `In-store pickup (${product.stock})` : `In stock (${product.stock})`}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Price + Action Baseline */}
        <div className="pt-3 border-t border-[#1C2541]/8 flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg font-extrabold text-[#0B132B] tabular-nums">
              {formatPrice(product.price)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(product)}
              className="px-3 py-2 text-xs font-semibold text-[#1C2541] border border-[#1C2541]/15 hover:bg-[#F2F3FF] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Specs
            </button>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => onQuickAdd(product)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#0051D5] disabled:bg-[#C6C6CE] disabled:cursor-not-allowed active:scale-[0.98] rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Reserve</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
