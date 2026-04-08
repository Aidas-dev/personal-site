import type { Product, Category } from '@/types';

/** Placeholder image generator with hexagon theme */
function placeholderImage(label: string): string {
  return `https://placehold.co/600x400/2d5a3d/ffffff?text=${encodeURIComponent(label)}&shape=hexagon`;
}

/** Mock categories hierarchy */
export const mockCategories: Category[] = [
  // Root categories
  {
    id: 'cat-bike-parts',
    name: 'Bike Parts',
    slug: 'bike-parts',
    description: 'High-quality bicycle components and accessories',
    productCount: 10,
  },
  {
    id: 'cat-parking-solutions',
    name: 'Parking Solutions',
    slug: 'parking-solutions',
    description: 'Secure parking infrastructure for bicycles',
    productCount: 9,
  },

  // Bike Parts sub-categories
  {
    id: 'cat-brakes',
    name: 'Brakes',
    slug: 'brakes',
    parentId: 'cat-bike-parts',
    description: 'Disc and rim brake systems',
    productCount: 2,
  },
  {
    id: 'cat-gears',
    name: 'Gears & Drivetrain',
    slug: 'gears-drivetrain',
    parentId: 'cat-bike-parts',
    description: 'Gears, chains, and drivetrain components',
    productCount: 2,
  },
  {
    id: 'cat-tires',
    name: 'Tires & Wheels',
    slug: 'tires-wheels',
    parentId: 'cat-bike-parts',
    description: 'Tires, wheels, and related components',
    productCount: 2,
  },

  // Parking Solutions sub-categories
  {
    id: 'cat-bike-stands',
    name: 'Bike Stands',
    slug: 'bike-stands',
    parentId: 'cat-parking-solutions',
    description: 'Freestanding and wall-mounted bike stands',
    productCount: 3,
  },
  {
    id: 'cat-bike-shelters',
    name: 'Bike Shelters',
    slug: 'bike-shelters',
    parentId: 'cat-parking-solutions',
    description: 'Weather-protected bike shelters',
    productCount: 3,
  },
  {
    id: 'cat-bike-locks',
    name: 'Bike Locks',
    slug: 'bike-locks',
    parentId: 'cat-parking-solutions',
    description: 'Security locks and anchoring systems',
    productCount: 3,
  },
];

/** Mock products - bike parts and parking solutions */
export const mockProducts: Product[] = [
  // --- Brakes ---
  {
    id: 'prod-hydraulic-disc-brake',
    name: 'Hydraulic Disc Brake Set',
    description:
      'High-performance hydraulic disc brake set for mountain bikes. Features ceramic pistons and mineral oil for consistent braking in all conditions.',
    slug: 'hydraulic-disc-brake',
    categoryId: 'cat-brakes',
    price: {
      amount: 89.99,
      currency: 'EUR',
      b2bAmount: 72.0,
    },
    images: [
      {
        url: placeholderImage('Hydraulic+Disc+Brake'),
        alt: 'Front view of hydraulic disc brake',
      },
      {
        url: placeholderImage('Brake+Detail'),
        alt: 'Close-up of brake caliper',
      },
    ],
    availability: 'in_stock',
    sku: 'HDB-2024',
    specs: [
      { key: 'Type', value: 'Hydraulic' },
      { key: 'Fluid', value: 'Mineral Oil' },
      { key: 'Weight', value: '350g per brake' },
      { key: 'Rotor', value: '160mm / 180mm compatible' },
    ],
    tags: ['mountain', 'hydraulic', 'disc'],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'prod-mechanical-disc-brake',
    name: 'Mechanical Disc Brake',
    description:
      'Reliable cable-actuated mechanical disc brake for commuting and touring. Easy to maintain and adjust in the field.',
    slug: 'mechanical-disc-brake',
    categoryId: 'cat-brakes',
    price: {
      amount: 45.0,
      currency: 'EUR',
      saleAmount: 38.0,
    },
    images: [
      {
        url: placeholderImage('Mechanical+Disc+Brake'),
        alt: 'Mechanical disc brake caliper',
      },
    ],
    availability: 'in_stock',
    sku: 'MDB-2024',
    specs: [
      { key: 'Type', value: 'Mechanical (Cable)' },
      { key: 'Weight', value: '280g' },
      { key: 'Cable', value: 'Standard brake cable' },
    ],
    tags: ['commuting', 'mechanical', 'budget'],
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-03-15T14:30:00Z',
  },

  // --- Gears ---
  {
    id: 'prod-12speed-cassette',
    name: '12-Speed Cassette',
    description:
      'Wide-range 12-speed cassette for modern mountain and gravel bikes. Precision-machined cogs for smooth shifting.',
    slug: '12speed-cassette',
    categoryId: 'cat-gears',
    price: {
      amount: 129.99,
      currency: 'EUR',
      b2bAmount: 104.0,
    },
    images: [
      {
        url: placeholderImage('12+Speed+Cassette'),
        alt: '12-speed bicycle cassette',
      },
    ],
    availability: 'in_stock',
    sku: 'CAS-12S',
    specs: [
      { key: 'Speeds', value: '12' },
      { key: 'Range', value: '10-50T' },
      { key: 'Weight', value: '465g' },
      { key: 'Material', value: 'Steel/Aluminum' },
    ],
    tags: ['mountain', 'gravel', '12-speed'],
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'prod-kmc-chain',
    name: 'KMC X12 Chain',
    description:
      'Premium 12-speed bicycle chain with missing link for easy installation. Compatible with all major 12-speed drivetrains.',
    slug: 'kmc-x12-chain',
    categoryId: 'cat-gears',
    price: {
      amount: 34.99,
      currency: 'EUR',
    },
    images: [
      {
        url: placeholderImage('KMC+X12+Chain'),
        alt: 'KMC 12-speed chain',
      },
    ],
    availability: 'low_stock',
    sku: 'KMC-X12',
    specs: [
      { key: 'Speeds', value: '12' },
      { key: 'Links', value: '126' },
      { key: 'Weight', value: '253g' },
    ],
    tags: ['chain', '12-speed', 'kmc'],
    createdAt: '2026-02-05T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },

  // --- Tires ---
  {
    id: 'prod-mtb-tire-29',
    name: 'Mountain Bike Tire 29"',
    description:
      'All-terrain 29-inch mountain bike tire with aggressive tread pattern. Tubeless-ready for lower pressure and better grip.',
    slug: 'mtb-tire-29',
    categoryId: 'cat-tires',
    price: {
      amount: 45.0,
      currency: 'EUR',
      saleAmount: 35.0,
    },
    images: [
      {
        url: placeholderImage('MTB+Tire+29'),
        alt: '29-inch mountain bike tire',
      },
    ],
    availability: 'in_stock',
    sku: 'MTB-TIRE-29',
    specs: [
      { key: 'Size', value: '29"' },
      { key: 'Width', value: '2.4"' },
      { key: 'TPI', value: '120' },
      { key: 'Tubeless', value: 'Yes' },
    ],
    tags: ['mountain', 'all-terrain', 'tubeless', '29er'],
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-03-12T00:00:00Z',
  },
  {
    id: 'prod-alloy-wheelset',
    name: 'Alloy Wheelset 700c',
    description:
      'Lightweight aluminum alloy wheelset for road and gravel bikes. Tubeless compatible with 25mm internal width.',
    slug: 'alloy-wheelset-700c',
    categoryId: 'cat-tires',
    price: {
      amount: 299.99,
      currency: 'EUR',
      b2bAmount: 240.0,
    },
    images: [
      {
        url: placeholderImage('Alloy+Wheelset'),
        alt: '700c alloy wheelset',
      },
    ],
    availability: 'in_stock',
    sku: 'ALY-700C',
    specs: [
      { key: 'Size', value: '700c' },
      { key: 'Internal Width', value: '25mm' },
      { key: 'Weight', value: '1650g (pair)' },
      { key: 'Tubeless', value: 'Yes' },
    ],
    tags: ['road', 'gravel', 'alloy', 'tubeless'],
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-18T00:00:00Z',
  },

  // --- Bike Stands ---
  {
    id: 'prod-floor-stand',
    name: 'Floor Bike Stand',
    description:
      'Sturdy freestanding floor bike stand with rubber-coated cradle. Holds any bike up to 30kg. No wall mounting needed.',
    slug: 'floor-bike-stand',
    categoryId: 'cat-bike-stands',
    price: {
      amount: 49.99,
      currency: 'EUR',
    },
    images: [
      {
        url: placeholderImage('Floor+Bike+Stand'),
        alt: 'Freestanding floor bike stand',
      },
    ],
    availability: 'in_stock',
    sku: 'FST-001',
    specs: [
      { key: 'Max Weight', value: '30kg' },
      { key: 'Material', value: 'Steel' },
      { key: 'Mounting', value: 'Freestanding' },
    ],
    tags: ['indoor', 'freestanding', 'universal'],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
  },
  {
    id: 'prod-wall-mount-stand',
    name: 'Wall Mount Bike Stand',
    description:
      'Space-saving wall-mounted bike stand with folding arm. Perfect for apartments and garages.',
    slug: 'wall-mount-bike-stand',
    categoryId: 'cat-bike-stands',
    price: {
      amount: 34.99,
      currency: 'EUR',
      b2bAmount: 28.0,
    },
    images: [
      {
        url: placeholderImage('Wall+Mount+Stand'),
        alt: 'Wall-mounted bike stand',
      },
    ],
    availability: 'in_stock',
    sku: 'WMS-002',
    specs: [
      { key: 'Max Weight', value: '25kg' },
      { key: 'Material', value: 'Aluminum' },
      { key: 'Mounting', value: 'Wall' },
    ],
    tags: ['indoor', 'wall-mount', 'folding'],
    createdAt: '2026-01-12T00:00:00Z',
    updatedAt: '2026-03-08T00:00:00Z',
  },
  {
    id: 'prod-double-decker-stand',
    name: 'Double Decker Bike Stand',
    description:
      'Commercial double-decker bike stand for high-density parking. Holds two bikes in the footprint of one.',
    slug: 'double-decker-bike-stand',
    categoryId: 'cat-bike-stands',
    price: {
      amount: 189.99,
      currency: 'EUR',
      b2bAmount: 152.0,
    },
    images: [
      {
        url: placeholderImage('Double+Decker+Stand'),
        alt: 'Double decker commercial bike stand',
      },
    ],
    availability: 'low_stock',
    sku: 'DDS-003',
    specs: [
      { key: 'Max Weight', value: '40kg (2x 20kg)' },
      { key: 'Material', value: 'Galvanized Steel' },
      { key: 'Mounting', value: 'Floor Bolt' },
    ],
    tags: ['commercial', 'high-density', 'outdoor'],
    createdAt: '2026-01-14T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },

  // --- Bike Shelters ---
  {
    id: 'prod-single-shelter',
    name: 'Single Bike Shelter',
    description:
      'Compact weather-resistant shelter for one bicycle. Galvanized steel frame with polycarbonate roof.',
    slug: 'single-bike-shelter',
    categoryId: 'cat-bike-shelters',
    price: {
      amount: 499.99,
      currency: 'EUR',
      b2bAmount: 400.0,
    },
    images: [
      {
        url: placeholderImage('Single+Bike+Shelter'),
        alt: 'Single bicycle shelter',
      },
    ],
    availability: 'in_stock',
    sku: 'SBS-001',
    specs: [
      { key: 'Capacity', value: '1 bike' },
      { key: 'Dimensions', value: '200 x 80 x 120 cm' },
      { key: 'Material', value: 'Galvanized Steel + Polycarbonate' },
    ],
    tags: ['outdoor', 'weather-resistant', 'single'],
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
  },
  {
    id: 'prod-double-shelter',
    name: 'Double Bike Shelter',
    description:
      'Dual-capacity bike shelter with lockable doors. Ideal for residential use.',
    slug: 'double-bike-shelter',
    categoryId: 'cat-bike-shelters',
    price: {
      amount: 799.99,
      currency: 'EUR',
    },
    images: [
      {
        url: placeholderImage('Double+Bike+Shelter'),
        alt: 'Double bicycle shelter',
      },
    ],
    availability: 'in_stock',
    sku: 'DBS-002',
    specs: [
      { key: 'Capacity', value: '2 bikes' },
      { key: 'Dimensions', value: '200 x 150 x 120 cm' },
      { key: 'Lockable', value: 'Yes' },
    ],
    tags: ['outdoor', 'residential', 'lockable'],
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-03-16T00:00:00Z',
  },
  {
    id: 'prod-commercial-shelter',
    name: 'Commercial Bike Shelter',
    description:
      'Heavy-duty commercial bike shelter for public spaces. Holds up to 10 bicycles with integrated lighting.',
    slug: 'commercial-bike-shelter',
    categoryId: 'cat-bike-shelters',
    price: {
      amount: 2499.99,
      currency: 'EUR',
      b2bAmount: 2000.0,
    },
    images: [
      {
        url: placeholderImage('Commercial+Shelter'),
        alt: 'Commercial bicycle shelter',
      },
    ],
    availability: 'low_stock',
    sku: 'CBS-003',
    specs: [
      { key: 'Capacity', value: '10 bikes' },
      { key: 'Dimensions', value: '400 x 200 x 200 cm' },
      { key: 'Lighting', value: 'Integrated LED' },
    ],
    tags: ['commercial', 'public', 'lighting'],
    createdAt: '2026-01-25T00:00:00Z',
    updatedAt: '2026-03-18T00:00:00Z',
  },

  // --- Bike Locks ---
  {
    id: 'prod-u-lock',
    name: 'Heavy Duty U-Lock',
    description:
      'Sold Secure Gold rated U-lock with 16mm shackle. Includes mounting bracket and 2 keys.',
    slug: 'heavy-duty-u-lock',
    categoryId: 'cat-bike-locks',
    price: {
      amount: 59.99,
      currency: 'EUR',
    },
    images: [
      {
        url: placeholderImage('U-Lock'),
        alt: 'Heavy duty U-lock',
      },
    ],
    availability: 'in_stock',
    sku: 'ULOCK-001',
    specs: [
      { key: 'Shackle', value: '16mm hardened steel' },
      { key: 'Rating', value: 'Sold Secure Gold' },
      { key: 'Keys', value: '2' },
    ],
    tags: ['security', 'gold-rated', 'portable'],
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-03-20T00:00:00Z',
  },
  {
    id: 'prod-chain-lock',
    name: 'Security Chain Lock',
    description:
      '120cm heavy-duty chain lock with fabric sleeve to protect paint. Keyed alike option available.',
    slug: 'security-chain-lock',
    categoryId: 'cat-bike-locks',
    price: {
      amount: 44.99,
      currency: 'EUR',
      saleAmount: 36.0,
    },
    images: [
      {
        url: placeholderImage('Chain+Lock'),
        alt: 'Security chain lock',
      },
    ],
    availability: 'in_stock',
    sku: 'CLOCK-002',
    specs: [
      { key: 'Length', value: '120cm' },
      { key: 'Chain', value: '10mm square chain' },
      { key: 'Sleeve', value: 'Fabric protection' },
    ],
    tags: ['security', 'chain', 'flexible'],
    createdAt: '2026-02-03T00:00:00Z',
    updatedAt: '2026-03-19T00:00:00Z',
  },
  {
    id: 'prod-anchor-lock',
    name: 'Ground Anchor Lock System',
    description:
      'Permanent ground anchor with integrated lock. Bolt to concrete or embed in asphalt for maximum security.',
    slug: 'ground-anchor-lock',
    categoryId: 'cat-bike-locks',
    price: {
      amount: 149.99,
      currency: 'EUR',
      b2bAmount: 120.0,
    },
    images: [
      {
        url: placeholderImage('Ground+Anchor'),
        alt: 'Ground anchor lock system',
      },
    ],
    availability: 'in_stock',
    sku: 'GALOCK-003',
    specs: [
      { key: 'Material', value: 'Cast iron' },
      { key: 'Fixing', value: 'Bolt or embed' },
      { key: 'Rating', value: 'Sold Secure Gold' },
    ],
    tags: ['security', 'permanent', 'commercial'],
    createdAt: '2026-02-05T00:00:00Z',
    updatedAt: '2026-03-21T00:00:00Z',
  },
];

/** Get all categories */
export function getCategories(): Category[] {
  return [...mockCategories];
}

/** Get all products */
export function getProducts(): Product[] {
  return [...mockProducts];
}

/** Get a product by its slug */
export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

/** Get products filtered by category ID */
export function getProductsByCategory(categoryId: string): Product[] {
  return mockProducts.filter((p) => p.categoryId === categoryId);
}

/** Get a product by its ID */
export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id);
}
