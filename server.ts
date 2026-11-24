import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  InquiryStatus,
  OrderStatus,
  PickupOrder,
  Product,
  ShopSettings,
  TechInquiry,
} from './src/types.ts';

interface PersistedStore {
  ownerPin: string;
  settings: ShopSettings;
  products: Product[];
  orders: PickupOrder[];
  inquiries: TechInquiry[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const DEFAULT_STORE: PersistedStore = {
  ownerPin: '2026',
  settings: {
    shopName: 'Atelier Silicon',
    neighborhood: 'SoHo Hardware District',
    address: '142 Mercer Street, Suite 1B',
    hours: 'Tue–Sun · 10:00 AM – 7:30 PM',
    whatsappNumber: '+14155550192',
    heroKicker: 'Bench-tested workstations & studio components',
    heroHeadline: 'Precision computing built for your desk, ready today.',
    heroSubheadline:
      'Every laptop, GPU, and calibrated display in our showroom is bench-verified by senior technicians and held for same-day local pickup.',
    heroCtaLabel: 'Browse Catalog',
    heroImageUrl: '/src/assets/images/hero_workstation_atelier_1795518953644.jpg',
    consultationTitle: 'Need a custom workstation spec or compatibility check?',
    consultationDescription:
      'Message our bench engineers directly to confirm physical shelf inventory, thermal clearances, or request a tailored multi-GPU build quote.',
    promoBannerText:
      'Same-day counter pickup in 45 minutes · Free local courier on orders over $1,200',
    showPromoBanner: true,
  },
  products: [
    {
      id: 'prod-1',
      sku: 'AS-WS-16M',
      brand: 'PROART',
      name: 'StudioBook 16 Pro OLED',
      category: 'Workstations',
      price: 2699,
      stock: 5,
      pickupAvailable: true,
      featured: true,
      specSnippet: 'Ultra 9 · 64GB DDR5 · RTX 4070',
      warranty: '2-Year Boutique Bench Warranty',
      description:
        'CNC-anodized aluminum mobile workstation calibrated to Delta-E < 1 out of the box. Ideal for 3D look-dev, CAD assemblies, and multi-stream 4K color grading.',
      imageUrl: '/src/assets/images/product_pro_laptop_1795518953665.jpg',
      specs: [
        { label: 'Processor', value: 'Intel Core Ultra 9 185H (16-Core)' },
        { label: 'Display', value: '16.0" 3.2K 120Hz Pantone OLED' },
        { label: 'Memory', value: '64GB LPDDR5X-7467' },
        { label: 'Storage', value: '2TB PCIe 4.0 NVMe SSD' },
        { label: 'Graphics', value: 'NVIDIA RTX 4070 8GB Studio' },
        { label: 'Chassis Weight', value: '1.85 kg Unibody Aluminum' },
      ],
      variants: [
        { id: 'v-1a', label: '32GB RAM / 1TB NVMe', priceDelta: -300, stock: 3 },
        { id: 'v-1b', label: '64GB RAM / 2TB NVMe', priceDelta: 0, stock: 5 },
        { id: 'v-1c', label: '64GB RAM / 4TB RAID-0', priceDelta: 420, stock: 2 },
      ],
    },
    {
      id: 'prod-2',
      sku: 'AS-GPU-5090',
      brand: 'NVIDIA FOUNDERS',
      name: 'GeForce RTX 5080 Titanium',
      category: 'Graphics & Core',
      price: 1199,
      stock: 3,
      pickupAvailable: true,
      featured: true,
      specSnippet: '16GB GDDR7 · 360W · Dual-Axial',
      warranty: '3-Year Serial Replacement',
      description:
        'Flow-through brushed titanium thermal shroud engineered for quiet workstation acoustic profiles and high-throughput local LLM inference or real-time raytracing.',
      imageUrl: '/src/assets/images/product_rtx_gpu_1795518953668.jpg',
      specs: [
        { label: 'VRAM', value: '16GB GDDR7 256-bit' },
        { label: 'Boost Clock', value: '2,617 MHz' },
        { label: 'Interface', value: 'PCIe 5.0 x16' },
        { label: 'Power Draw', value: '360W (16-pin 12V-2x6)' },
        { label: 'Outputs', value: '3x DP 2.1b · 1x HDMI 2.1b' },
        { label: 'Slot Width', value: '2.5-Slot (304 mm Length)' },
      ],
      variants: [
        { id: 'v-2a', label: 'Founders Titanium Edition', priceDelta: 0, stock: 3 },
        { id: 'v-2b', label: 'OC + Braided 12V-2x6 Kit', priceDelta: 90, stock: 2 },
      ],
    },
    {
      id: 'prod-3',
      sku: 'AS-DSP-32Q',
      brand: 'ULTRASHARP',
      name: 'Reference 32 4K QD-OLED',
      category: 'Displays',
      price: 1349,
      stock: 4,
      pickupAvailable: true,
      featured: true,
      specSnippet: '32" 4K · 240Hz · 99% DCI-P3',
      warranty: '3-Year Zero Bright Pixel Guarantee',
      description:
        'Factory-verified color grading and engineering monitor with single-cable 140W USB-C power delivery, hardware LUT calibration, and machined aluminum stand.',
      imageUrl: '/src/assets/images/product_oled_monitor_1795518953786.jpg',
      specs: [
        { label: 'Panel', value: '31.5" 3840x2160 QD-OLED' },
        { label: 'Refresh Rate', value: '240Hz Adaptive Sync' },
        { label: 'Color Space', value: '99.2% DCI-P3 · Delta-E < 0.8' },
        { label: 'Upstream PD', value: '140W USB-C + KVM Switch' },
        { label: 'Brightness', value: '1000 nits HDR Peak' },
        { label: 'Mount', value: 'VESA 100x100 + Aluminum Stand' },
      ],
      variants: [
        { id: 'v-3a', label: 'Standard Aluminum Stand', priceDelta: 0, stock: 4 },
        { id: 'v-3b', label: 'With Articulated Studio Arm', priceDelta: 180, stock: 2 },
      ],
    },
    {
      id: 'prod-4',
      sku: 'AS-KEY-75C',
      brand: 'MODE LABS',
      name: 'Sonnet 75 CNC Mechanical',
      category: 'Peripherals',
      price: 389,
      stock: 8,
      pickupAvailable: true,
      featured: false,
      specSnippet: '6063 Aluminum · QMK/VIA · Gasket',
      warranty: '2-Year Switch & PCB Support',
      description:
        'Milled from solid 6063 bead-blasted aluminum with isolated lattice block mounting, dye-sublimated charcoal PBT keycaps, and hand-lubed linear switches.',
      imageUrl: '/src/assets/images/product_mech_keyboard_1795518954838.jpg',
      specs: [
        { label: 'Layout', value: '75% Compact (82 Keys)' },
        { label: 'Chassis', value: 'CNC 6063 Anodized Silver' },
        { label: 'Switches', value: 'Lubed Obscura Linear 50g' },
        { label: 'Firmware', value: 'QMK / VIA Programmable' },
        { label: 'Connectivity', value: 'USB-C Braided + 2.4GHz' },
        { label: 'Weight', value: '1.92 kg Built' },
      ],
      variants: [
        { id: 'v-4a', label: 'Linear Switches (Quiet)', priceDelta: 0, stock: 8 },
        { id: 'v-4b', label: 'Tactile Brown Switches', priceDelta: 15, stock: 5 },
      ],
    },
    {
      id: 'prod-5',
      sku: 'AS-HUB-TB5',
      brand: 'CALDIGIT',
      name: 'Element TB5 Studio Dock & Audio',
      category: 'Peripherals',
      price: 459,
      stock: 2,
      pickupAvailable: true,
      featured: false,
      specSnippet: '120Gbps TB5 · 10GbE · 140W Host',
      warranty: '2-Year Local Counter Swap',
      description:
        'Compact anodized desktop dock delivering dual 6K display output, 10Gb Ethernet, UHS-II SD 4.0 reader, and reference-grade balanced headphone output.',
      imageUrl: '/src/assets/images/product_tb_dock_audio_1795518959335.jpg',
      specs: [
        { label: 'Bandwidth', value: '120 Gbps Thunderbolt 5' },
        { label: 'Host Charging', value: '140W USB-PD EPR' },
        { label: 'Networking', value: '10 Gigabit Ethernet RJ45' },
        { label: 'Ports', value: '4x TB5 · 3x USB-A 10G · SD 4.0' },
        { label: 'Audio DAC', value: '32-bit/384kHz Balanced 4.4mm' },
        { label: 'Enclosure', value: 'Passive Finned Aluminum' },
      ],
      variants: [
        { id: 'v-5a', label: 'TB5 Studio Dock Only', priceDelta: 0, stock: 2 },
        { id: 'v-5b', label: 'Dock + Reference Headphones', priceDelta: 290, stock: 2 },
      ],
    },
    {
      id: 'prod-6',
      sku: 'AS-WS-M4X',
      brand: 'APPLE STUDIO',
      name: 'MacBook Pro 16 M4 Max',
      category: 'Workstations',
      price: 3499,
      stock: 2,
      pickupAvailable: true,
      featured: true,
      specSnippet: '16-Core · 48GB Unified · 1TB',
      warranty: '1-Year AppleCare+ Eligible',
      description:
        'Space Black flagship mobile workstation with 546GB/s unified memory bandwidth for on-device foundation models, Xcode builds, and ProRes RAW timelines.',
      imageUrl: '/src/assets/images/product_pro_laptop_1795518953665.jpg',
      specs: [
        { label: 'Chip', value: 'Apple M4 Max (16-Core CPU / 40-Core GPU)' },
        { label: 'Memory', value: '48GB Unified (546GB/s)' },
        { label: 'Storage', value: '1TB High-Speed SSD' },
        { label: 'Display', value: '16.2" Liquid Retina XDR 120Hz' },
        { label: 'Ports', value: '3x Thunderbolt 5 · HDMI · SDXC' },
        { label: 'Battery', value: 'Up to 21 Hours' },
      ],
      variants: [
        { id: 'v-6a', label: '48GB Unified / 1TB SSD', priceDelta: 0, stock: 2 },
        { id: 'v-6b', label: '64GB Unified / 2TB SSD', priceDelta: 600, stock: 1 },
      ],
    },
  ],
  orders: [
    {
      id: 'ord-1041',
      orderNumber: 'AS-1041',
      customerName: 'Elena Vance',
      customerPhone: '+1 (415) 555-0148',
      fulfillment: 'pickup',
      pickupWindowOrAddress: 'Today · 4:30 PM – 5:30 PM',
      notes: 'Please keep box sealed if possible.',
      items: [
        {
          productId: 'prod-4',
          variantId: 'v-4a',
          variantLabel: 'Linear Switches (Quiet)',
          brand: 'MODE LABS',
          name: 'Sonnet 75 CNC Mechanical',
          sku: 'AS-KEY-75C',
          unitPrice: 389,
          quantity: 1,
          imageUrl: '/src/assets/images/product_mech_keyboard_1795518954838.jpg',
        },
      ],
      subtotal: 389,
      createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
      status: 'Ready at Counter',
    },
  ],
  inquiries: [
    {
      id: 'inq-201',
      customerName: 'Marcus Chen',
      customerPhone: '+1 (415) 555-0183',
      topic: 'Custom Build Quote',
      productName: 'GeForce RTX 5080 Titanium',
      message: 'Checking if the 5080 Titanium fits inside a Fractal Terra with an SF850 PSU.',
      createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
      status: 'Open',
    },
  ],
};

function ensureStoreLoaded(): PersistedStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
    return structuredClone(DEFAULT_STORE);
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as PersistedStore;
    if (!parsed.settings || !Array.isArray(parsed.products)) {
      throw new Error('Invalid store format');
    }
    return parsed;
  } catch {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
    return structuredClone(DEFAULT_STORE);
  }
}

function saveStore(store: PersistedStore): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

function isValidOwner(req: express.Request, store: PersistedStore): boolean {
  const pinHeader = req.header('X-Owner-Pin');
  return Boolean(pinHeader && pinHeader === store.ownerPin);
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  // Public storefront endpoint
  app.get('/api/store', (_req, res) => {
    const store = ensureStoreLoaded();
    res.json({
      settings: store.settings,
      products: store.products,
    });
  });

  // Owner PIN verification
  app.post('/api/owner/verify', (req, res) => {
    const store = ensureStoreLoaded();
    const pin = typeof req.body?.pin === 'string' ? req.body.pin.trim() : '';
    if (!pin || pin !== store.ownerPin) {
      res.status(401).json({ ok: false, error: 'Incorrect owner PIN.' });
      return;
    }
    res.json({ ok: true });
  });

  // Update owner PIN
  app.put('/api/owner/pin', (req, res) => {
    const store = ensureStoreLoaded();
    if (!isValidOwner(req, store)) {
      res.status(401).json({ error: 'Owner authorization required.' });
      return;
    }
    const newPin = typeof req.body?.newPin === 'string' ? req.body.newPin.trim() : '';
    if (newPin.length < 4 || newPin.length > 16) {
      res.status(400).json({ error: 'PIN must be between 4 and 16 characters.' });
      return;
    }
    store.ownerPin = newPin;
    saveStore(store);
    res.json({ ok: true });
  });

  // Update store settings (owner only)
  app.put('/api/settings', (req, res) => {
    const store = ensureStoreLoaded();
    if (!isValidOwner(req, store)) {
      res.status(401).json({ error: 'Owner authorization required.' });
      return;
    }
    const incoming = req.body as Partial<ShopSettings>;
    store.settings = {
      ...store.settings,
      shopName: String(incoming.shopName ?? store.settings.shopName).trim() || store.settings.shopName,
      neighborhood: String(incoming.neighborhood ?? store.settings.neighborhood).trim(),
      address: String(incoming.address ?? store.settings.address).trim(),
      hours: String(incoming.hours ?? store.settings.hours).trim(),
      whatsappNumber: String(incoming.whatsappNumber ?? store.settings.whatsappNumber).trim(),
      heroKicker: String(incoming.heroKicker ?? store.settings.heroKicker).trim(),
      heroHeadline: String(incoming.heroHeadline ?? store.settings.heroHeadline).trim(),
      heroSubheadline: String(incoming.heroSubheadline ?? store.settings.heroSubheadline).trim(),
      heroCtaLabel: String(incoming.heroCtaLabel ?? store.settings.heroCtaLabel).trim(),
      heroImageUrl: String(incoming.heroImageUrl ?? store.settings.heroImageUrl).trim(),
      consultationTitle: String(incoming.consultationTitle ?? store.settings.consultationTitle).trim(),
      consultationDescription: String(
        incoming.consultationDescription ?? store.settings.consultationDescription,
      ).trim(),
      promoBannerText: String(incoming.promoBannerText ?? store.settings.promoBannerText).trim(),
      showPromoBanner:
        typeof incoming.showPromoBanner === 'boolean'
          ? incoming.showPromoBanner
          : store.settings.showPromoBanner,
    };
    saveStore(store);
    res.json(store.settings);
  });

  // Create product (owner only)
  app.post('/api/products', (req, res) => {
    const store = ensureStoreLoaded();
    if (!isValidOwner(req, store)) {
      res.status(401).json({ error: 'Owner authorization required.' });
      return;
    }
    const body = req.body as Partial<Product>;
    if (!body.name || !body.brand || typeof body.price !== 'number') {
      res.status(400).json({ error: 'Brand, product name, and numeric price are required.' });
      return;
    }
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      id,
      sku: String(body.sku || `AS-${Math.floor(1000 + Math.random() * 9000)}`).trim(),
      brand: String(body.brand).trim().toUpperCase(),
      name: String(body.name).trim(),
      category: body.category || 'Workstations',
      price: Math.max(0, Number(body.price)),
      stock: Math.max(0, Math.floor(Number(body.stock ?? 1))),
      pickupAvailable: body.pickupAvailable ?? true,
      featured: body.featured ?? false,
      specSnippet: String(body.specSnippet || 'Bench Verified').trim(),
      warranty: String(body.warranty || '2-Year Boutique Bench Warranty').trim(),
      description: String(body.description || '').trim(),
      imageUrl:
        String(body.imageUrl || '').trim() ||
        '/src/assets/images/product_pro_laptop_1795518953665.jpg',
      specs: Array.isArray(body.specs) ? body.specs : [],
      variants:
        Array.isArray(body.variants) && body.variants.length > 0
          ? body.variants
          : [
              {
                id: `v-${Date.now()}`,
                label: 'Standard Configuration',
                priceDelta: 0,
                stock: Math.max(0, Math.floor(Number(body.stock ?? 1))),
              },
            ],
    };
    store.products.unshift(newProduct);
    saveStore(store);
    res.status(201).json(newProduct);
  });

  // Update product (owner only)
  app.put('/api/products/:id', (req, res) => {
    const store = ensureStoreLoaded();
    if (!isValidOwner(req, store)) {
      res.status(401).json({ error: 'Owner authorization required.' });
      return;
    }
    const idx = store.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    const existing = store.products[idx];
    const body = req.body as Partial<Product>;
    const updated: Product = {
      ...existing,
      sku: body.sku !== undefined ? String(body.sku).trim() : existing.sku,
      brand: body.brand !== undefined ? String(body.brand).trim().toUpperCase() : existing.brand,
      name: body.name !== undefined ? String(body.name).trim() : existing.name,
      category: body.category ?? existing.category,
      price: body.price !== undefined ? Math.max(0, Number(body.price)) : existing.price,
      stock: body.stock !== undefined ? Math.max(0, Math.floor(Number(body.stock))) : existing.stock,
      pickupAvailable: body.pickupAvailable ?? existing.pickupAvailable,
      featured: body.featured ?? existing.featured,
      specSnippet: body.specSnippet !== undefined ? String(body.specSnippet).trim() : existing.specSnippet,
      warranty: body.warranty !== undefined ? String(body.warranty).trim() : existing.warranty,
      description: body.description !== undefined ? String(body.description).trim() : existing.description,
      imageUrl: body.imageUrl !== undefined ? String(body.imageUrl).trim() : existing.imageUrl,
      specs: Array.isArray(body.specs) ? body.specs : existing.specs,
      variants: Array.isArray(body.variants) && body.variants.length > 0 ? body.variants : existing.variants,
    };
    store.products[idx] = updated;
    saveStore(store);
    res.json(updated);
  });

  // Delete product (owner only)
  app.delete('/api/products/:id', (req, res) => {
    const store = ensureStoreLoaded();
    if (!isValidOwner(req, store)) {
      res.status(401).json({ error: 'Owner authorization required.' });
      return;
    }
    const before = store.products.length;
    store.products = store.products.filter((p) => p.id !== req.params.id);
    if (store.products.length === before) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    saveStore(store);
    res.json({ ok: true });
  });

  // Customer pickup reservation / order creation
  app.post('/api/orders', (req, res) => {
    const store = ensureStoreLoaded();
    const { customerName, customerPhone, fulfillment, pickupWindowOrAddress, notes, items } = req.body ?? {};
    if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Customer name, phone, and at least one item are required.' });
      return;
    }
    const subtotal = items.reduce(
      (sum: number, item: { unitPrice: number; quantity: number }) =>
        sum + Number(item.unitPrice || 0) * Number(item.quantity || 1),
      0,
    );
    const nextNum = 1042 + store.orders.length;
    const order: PickupOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `AS-${nextNum}`,
      customerName: String(customerName).trim(),
      customerPhone: String(customerPhone).trim(),
      fulfillment: fulfillment === 'courier' ? 'courier' : 'pickup',
      pickupWindowOrAddress: String(pickupWindowOrAddress || 'Today · Next available slot').trim(),
      notes: String(notes || '').trim(),
      items,
      subtotal,
      createdAt: new Date().toISOString(),
      status: 'Pending',
    };

    // Decrement product stock gently where applicable
    for (const item of items) {
      const prod = store.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - Number(item.quantity || 1));
      }
    }

    store.orders.unshift(order);
    saveStore(store);
    res.status(201).json(order);
  });

  // Owner: list orders
  app.get('/api/orders', (req, res) => {
    const store = ensureStoreLoaded();
    if (!isValidOwner(req, store)) {
      res.status(401).json({ error: 'Owner authorization required.' });
      return;
    }
    res.json(store.orders);
  });

  // Owner: update order status
  app.patch('/api/orders/:id', (req, res) => {
    const store = ensureStoreLoaded();
    if (!isValidOwner(req, store)) {
      res.status(401).json({ error: 'Owner authorization required.' });
      return;
    }
    const order = store.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    const status = req.body?.status as OrderStatus;
    if (status === 'Pending' || status === 'Ready at Counter' || status === 'Completed') {
      order.status = status;
      saveStore(store);
    }
    res.json(order);
  });

  // Customer: submit tech consultation / WhatsApp inquiry
  app.post('/api/inquiries', (req, res) => {
    const store = ensureStoreLoaded();
    const { customerName, customerPhone, topic, productName, message } = req.body ?? {};
    if (!customerName || !message) {
      res.status(400).json({ error: 'Name and technical question are required.' });
      return;
    }
    const inquiry: TechInquiry = {
      id: `inq-${Date.now()}`,
      customerName: String(customerName).trim(),
      customerPhone: String(customerPhone || 'Direct Web Desk').trim(),
      topic: String(topic || 'Hardware Consultation').trim(),
      productName: productName ? String(productName).trim() : undefined,
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
      status: 'Open',
    };
    store.inquiries.unshift(inquiry);
    saveStore(store);
    res.status(201).json(inquiry);
  });

  // Owner: list inquiries
  app.get('/api/inquiries', (req, res) => {
    const store = ensureStoreLoaded();
    if (!isValidOwner(req, store)) {
      res.status(401).json({ error: 'Owner authorization required.' });
      return;
    }
    res.json(store.inquiries);
  });

  // Owner: update inquiry status
  app.patch('/api/inquiries/:id', (req, res) => {
    const store = ensureStoreLoaded();
    if (!isValidOwner(req, store)) {
      res.status(401).json({ error: 'Owner authorization required.' });
      return;
    }
    const inquiry = store.inquiries.find((i) => i.id === req.params.id);
    if (!inquiry) {
      res.status(404).json({ error: 'Inquiry not found.' });
      return;
    }
    const status = req.body?.status as InquiryStatus;
    if (status === 'Open' || status === 'Quoted' || status === 'Resolved') {
      inquiry.status = status;
      saveStore(store);
    }
    res.json(inquiry);
  });

  // Reset store to factory default (owner only)
  app.post('/api/owner/reset', (req, res) => {
    const store = ensureStoreLoaded();
    if (!isValidOwner(req, store)) {
      res.status(401).json({ error: 'Owner authorization required.' });
      return;
    }
    const resetCopy = structuredClone(DEFAULT_STORE);
    resetCopy.ownerPin = store.ownerPin;
    saveStore(resetCopy);
    res.json({ settings: resetCopy.settings, products: resetCopy.products });
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
