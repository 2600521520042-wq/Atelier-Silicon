import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { formatPrice, submitOrder } from '../lib/api';
import type { CartItem, OrderFulfillment, PickupOrder, ShopSettings } from '../types';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  settings: ShopSettings;
  onClose: () => void;
  onUpdateQty: (productId: string, variantId: string, delta: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onOrderCompleted: (order: PickupOrder) => void;
}

export function CartDrawer({
  open,
  items,
  settings,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onOrderCompleted,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [fulfillment, setFulfillment] = useState<OrderFulfillment>('pickup');
  const [pickupWindowOrAddress, setPickupWindowOrAddress] = useState('Today · Next 45-min pickup');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<PickupOrder | null>(null);

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Please enter your full name and mobile number.');
      return;
    }
    setSubmitting(true);
    try {
      const order = await submitOrder({
        customerName,
        customerPhone,
        fulfillment,
        pickupWindowOrAddress,
        notes,
        items,
      });
      setConfirmedOrder(order);
      onOrderCompleted(order);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to complete reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedOrder(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0B132B]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Reservation Bag"
    >
      <div className="elevated-sheet w-full max-w-md h-full flex flex-col bg-white border-l border-[#1C2541]/10">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#1C2541]/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#0051D5]" />
            <h2 className="font-display text-base font-bold text-[#0B132B]">
              {confirmedOrder ? 'Reservation Confirmed' : 'Pickup & Order Bag'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close bag"
            className="p-2 rounded-lg text-[#45464D] hover:text-[#0B132B] hover:bg-[#F2F3FF] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {confirmedOrder ? (
            <div className="space-y-5">
              <div className="p-5 rounded-xl bg-[#DCFCE7]/60 border border-[#166534]/20 space-y-2">
                <div className="flex items-center gap-2 text-[#166534]">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="font-display font-bold text-base">
                    Order #{confirmedOrder.orderNumber} Confirmed
                  </span>
                </div>
                <p className="text-sm text-[#111A36]">
                  Held for <span className="font-semibold">{confirmedOrder.customerName}</span> at{' '}
                  {settings.address}. Pay in store upon inspection or via local courier terminal.
                </p>
              </div>

              <div className="border border-[#1C2541]/10 rounded-xl p-4 space-y-3 bg-[#FAF8FF]">
                <div className="flex justify-between text-xs text-[#45464D]">
                  <span>Fulfillment</span>
                  <span className="font-semibold text-[#0B132B]">
                    {confirmedOrder.fulfillment === 'pickup' ? 'Counter Pickup' : 'Same-Day Local Courier'}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[#45464D]">
                  <span>Schedule / Destination</span>
                  <span className="font-medium text-[#0B132B] text-right">
                    {confirmedOrder.pickupWindowOrAddress}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#1C2541]/10 space-y-1.5">
                  {confirmedOrder.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex justify-between text-xs text-[#111A36]"
                    >
                      <span>
                        {item.quantity}x {item.name} ({item.variantLabel})
                      </span>
                      <span className="font-mono tabular-nums font-semibold">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#1C2541]/10 flex justify-between font-display font-bold text-sm text-[#0B132B]">
                  <span>Total Held</span>
                  <span className="tabular-nums">{formatPrice(confirmedOrder.subtotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full h-11 rounded-lg bg-[#0B132B] hover:bg-[#1C2541] text-white text-sm font-semibold cursor-pointer"
              >
                Return to Storefront
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center gap-3 px-4">
              <ShoppingBag className="w-10 h-10 text-[#C6C6CE]" />
              <p className="font-display font-bold text-base text-[#0B132B]">
                Your reservation bag is empty
              </p>
              <p className="text-sm text-[#45464D]">
                Select any workstation, GPU, display, or peripheral to hold it for counter pickup.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Itemized List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="p-3.5 rounded-xl border border-[#1C2541]/10 bg-[#FAF8FF] flex gap-3.5"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover bg-[#F1F5F9] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-[#45464D]">{item.brand}</p>
                          <p className="font-display text-sm font-bold text-[#0B132B] truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-[#45464D] truncate">{item.variantLabel}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.productId, item.variantId)}
                          aria-label={`Remove ${item.name}`}
                          className="text-[#76767E] hover:text-[#BA1A1A] p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center border border-[#1C2541]/15 rounded-lg bg-white">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.productId, item.variantId, -1)}
                            aria-label="Decrease quantity"
                            className="p-1.5 text-[#1C2541] hover:bg-[#F2F3FF] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-mono font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.productId, item.variantId, 1)}
                            aria-label="Increase quantity"
                            className="p-1.5 text-[#1C2541] hover:bg-[#F2F3FF] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="font-display text-sm font-bold text-[#0B132B] tabular-nums">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fulfillment & Verification Form */}
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-[#1C2541]/10">
                <div>
                  <label className="block text-xs font-semibold text-[#1C2541] mb-2">
                    Fulfillment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#F2F3FF] rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setFulfillment('pickup');
                        setPickupWindowOrAddress('Today · Next 45-min pickup');
                      }}
                      className={`py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        fulfillment === 'pickup'
                          ? 'bg-white text-[#0B132B] shadow-xs'
                          : 'text-[#45464D] hover:text-[#0B132B]'
                      }`}
                    >
                      Counter Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFulfillment('courier');
                        setPickupWindowOrAddress('');
                      }}
                      className={`py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        fulfillment === 'courier'
                          ? 'bg-white text-[#0B132B] shadow-xs'
                          : 'text-[#45464D] hover:text-[#0B132B]'
                      }`}
                    >
                      Local Courier
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="res-name" className="block text-xs font-semibold text-[#1C2541] mb-1">
                    Full Name
                  </label>
                  <input
                    id="res-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Jordan Patel"
                    className="w-full h-10 px-3 rounded-lg bg-white border border-[#1C2541]/18 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-[#2563EB]/12"
                  />
                </div>

                <div>
                  <label htmlFor="res-phone" className="block text-xs font-semibold text-[#1C2541] mb-1">
                    Mobile Number (SMS Ready Alert)
                  </label>
                  <input
                    id="res-phone"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (415) 555-0199"
                    className="w-full h-10 px-3 rounded-lg bg-white border border-[#1C2541]/18 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-[#2563EB]/12"
                  />
                </div>

                <div>
                  <label htmlFor="res-window" className="block text-xs font-semibold text-[#1C2541] mb-1">
                    {fulfillment === 'pickup' ? 'Preferred Pickup Window' : 'Delivery Street Address'}
                  </label>
                  <input
                    id="res-window"
                    type="text"
                    required
                    value={pickupWindowOrAddress}
                    onChange={(e) => setPickupWindowOrAddress(e.target.value)}
                    placeholder={
                      fulfillment === 'pickup' ? 'Today 5:00 PM – 6:00 PM' : '240 Lafayette St, Apt 4A'
                    }
                    className="w-full h-10 px-3 rounded-lg bg-white border border-[#1C2541]/18 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-[#2563EB]/12"
                  />
                </div>

                <div>
                  <label htmlFor="res-notes" className="block text-xs font-semibold text-[#1C2541] mb-1">
                    Bench Notes (Optional)
                  </label>
                  <input
                    id="res-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Pre-install BIOS update, keep retail box sealed, etc."
                    className="w-full h-10 px-3 rounded-lg bg-white border border-[#1C2541]/18 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-[#2563EB]/12"
                  />
                </div>

                {errorMsg ? (
                  <p className="text-xs font-medium text-[#BA1A1A]">{errorMsg}</p>
                ) : null}
              </form>
            </div>
          )}
        </div>

        {/* Sticky Footer inside Drawer */}
        {!confirmedOrder && items.length > 0 ? (
          <div className="p-5 border-t border-[#1C2541]/10 bg-white space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#45464D]">Subtotal (Pay at counter or courier)</span>
              <span className="font-display text-lg font-extrabold text-[#0B132B] tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="w-full h-12 rounded-lg bg-[#0B132B] hover:bg-[#1C2541] disabled:opacity-60 active:scale-[0.98] text-white text-sm font-semibold transition-all cursor-pointer"
            >
              {submitting ? 'Confirming Reservation...' : 'Confirm Pickup Reservation'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
