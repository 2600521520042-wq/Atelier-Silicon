import { CheckCircle2, ExternalLink, MessageCircle, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { submitInquiry } from '../lib/api';
import type { Product, ShopSettings } from '../types';

interface TechConsultModalProps {
  open: boolean;
  settings: ShopSettings;
  contextProduct: Product | null;
  onClose: () => void;
}

export function TechConsultModal({
  open,
  settings,
  contextProduct,
  onClose,
}: TechConsultModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [topic, setTopic] = useState('Inventory & Compatibility Check');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      setSubmitted(false);
      setErrorMsg('');
      if (contextProduct) {
        setTopic('Product Spec & Stock Check');
        setMessage(
          `Hi ${settings.shopName} team — is the ${contextProduct.brand} ${contextProduct.name} (${contextProduct.sku}) ready for counter pickup today?`,
        );
      } else {
        setTopic('Custom Build Quote');
        setMessage('');
      }
    }
  }, [open, contextProduct, settings.shopName]);

  if (!open) return null;

  const cleanWaDigits = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const waHref = `https://wa.me/${cleanWaDigits}?text=${encodeURIComponent(
    message || `Hi ${settings.shopName}, I'd like to speak with a hardware technician.`,
  )}`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!customerName.trim() || !message.trim()) {
      setErrorMsg('Please enter your name and technical question.');
      return;
    }
    setSubmitting(true);
    try {
      await submitInquiry({
        customerName,
        customerPhone,
        topic,
        productName: contextProduct ? `${contextProduct.brand} ${contextProduct.name}` : undefined,
        message,
      });
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B132B]/55 backdrop-blur-xs p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tech-consult-title"
    >
      <div className="elevated-sheet w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-[#1C2541]/10 overflow-hidden">
        <div className="bg-[#0B132B] text-white px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
            <div>
              <h2 id="tech-consult-title" className="font-display text-base font-bold">
                Hardware Tech Concierge
              </h2>
              <p className="text-xs text-[#BEC5E5]">Direct bench support · {settings.shopName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tech concierge"
            className="p-1.5 rounded-lg text-[#BEC5E5] hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {submitted ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#DCFCE7]/60 border border-[#166534]/20 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#166534] shrink-0 mt-0.5" />
                <div>
                  <p className="font-display text-sm font-bold text-[#166534]">
                    Sent to {settings.shopName} Tech Desk
                  </p>
                  <p className="text-xs text-[#111A36] mt-1">
                    Our bench engineer received your request and will reply shortly. You can also
                    continue directly in WhatsApp below.
                  </p>
                </div>
              </div>

              {cleanWaDigits ? (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 rounded-lg bg-[#128C7E] hover:bg-[#0F766A] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open in WhatsApp ({settings.whatsappNumber})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null}

              <button
                type="button"
                onClick={onClose}
                className="w-full h-10 rounded-lg border border-[#1C2541]/15 text-sm font-semibold text-[#1C2541] hover:bg-[#F2F3FF] cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tech-name" className="block text-xs font-semibold text-[#1C2541] mb-1">
                    Your Name
                  </label>
                  <input
                    id="tech-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full h-10 px-3 rounded-lg bg-white border border-[#1C2541]/18 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-[#2563EB]/12"
                  />
                </div>
                <div>
                  <label htmlFor="tech-phone" className="block text-xs font-semibold text-[#1C2541] mb-1">
                    WhatsApp / Phone
                  </label>
                  <input
                    id="tech-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (415) 555-0124"
                    className="w-full h-10 px-3 rounded-lg bg-white border border-[#1C2541]/18 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-[#2563EB]/12"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tech-topic" className="block text-xs font-semibold text-[#1C2541] mb-1">
                  Consultation Topic
                </label>
                <select
                  id="tech-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-white border border-[#1C2541]/18 text-sm focus:outline-none focus:border-[#2563EB]"
                >
                  <option>Inventory &amp; Compatibility Check</option>
                  <option>Custom Build Quote</option>
                  <option>Product Spec &amp; Stock Check</option>
                  <option>Warranty &amp; Bench Calibration</option>
                </select>
              </div>

              <div>
                <label htmlFor="tech-msg" className="block text-xs font-semibold text-[#1C2541] mb-1">
                  Hardware Question or Build Spec
                </label>
                <textarea
                  id="tech-msg"
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about thermal clearance, PCIe lanes, RAM speeds, or request a custom PC quote..."
                  className="w-full p-3 rounded-lg bg-white border border-[#1C2541]/18 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-[#2563EB]/12"
                />
              </div>

              {errorMsg ? <p className="text-xs font-medium text-[#BA1A1A]">{errorMsg}</p> : null}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-11 rounded-lg bg-[#0B132B] hover:bg-[#1C2541] text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Sending...' : 'Send to Shop Tech Desk'}
                </button>
                {cleanWaDigits ? (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 px-4 rounded-lg bg-[#128C7E] hover:bg-[#0F766A] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Direct</span>
                  </a>
                ) : null}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
