import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'LiveShop Demo',
      slug: 'liveshop-demo',
      plan: 'pro',
    },
  });
  console.log('✅ Created tenant:', tenant.name);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@liveshop.io',
      password: hashPassword('admin123'),
      role: 'super_admin',
      emailVerified: new Date(),
      profile: {
        firstName: 'Super',
        lastName: 'Admin',
      },
    },
  });
  console.log('✅ Created admin:', admin.email);

  // Create customer
  const customer = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'customer@example.com',
      password: hashPassword('customer123'),
      role: 'customer',
      emailVerified: new Date(),
      profile: {
        firstName: 'John',
        lastName: 'Doe',
      },
    },
  });
  console.log('✅ Created customer:', customer.email);

  // Create store owner
  const storeOwner = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'store@example.com',
      password: hashPassword('store123'),
      role: 'store_owner',
      emailVerified: new Date(),
      profile: {
        firstName: 'Jane',
        lastName: 'Smith',
      },
    },
  });
  console.log('✅ Created store owner:', storeOwner.email);

  // Create store
  const store = await prisma.store.create({
    data: {
      tenantId: tenant.id,
      ownerId: storeOwner.id,
      name: 'Fashion Boutique',
      slug: 'fashion-boutique',
      description: 'Trendy fashion items at affordable prices',
      category: 'fashion',
      address: {
        street: '123 Fashion Ave',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        coordinates: { lat: 40.7128, lng: -74.0060 },
      },
      settings: {
        workingHours: {
          monday: { open: '09:00', close: '18:00', isOpen: true },
          tuesday: { open: '09:00', close: '18:00', isOpen: true },
          wednesday: { open: '09:00', close: '18:00', isOpen: true },
          thursday: { open: '09:00', close: '18:00', isOpen: true },
          friday: { open: '09:00', close: '18:00', isOpen: true },
          saturday: { open: '10:00', close: '16:00', isOpen: true },
          sunday: { open: null, close: null, isOpen: false },
        },
        deliveryRadius: 10,
        minimumOrder: 25,
        preparationTime: 30,
      },
      verificationStatus: 'verified',
      verifiedAt: new Date(),
    },
  });
  console.log('✅ Created store:', store.name);

  // Create products
  const products = await prisma.product.createMany({
    data: [
      {
        storeId: store.id,
        name: 'Premium Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt in various colors',
        sku: 'TSHIRT-001',
        price: 29.99,
        compareAtPrice: 39.99,
        inventoryQuantity: 100,
        images: ['https://placehold.co/600x600/FF2D8D/white?text=T-Shirt'],
        variants: [
          { id: 'v1', name: 'Small / Black', options: { size: 'S', color: 'Black' }, price: 29.99, quantity: 25 },
          { id: 'v2', name: 'Medium / Black', options: { size: 'M', color: 'Black' }, price: 29.99, quantity: 25 },
          { id: 'v3', name: 'Large / Black', options: { size: 'L', color: 'Black' }, price: 29.99, quantity: 25 },
          { id: 'v4', name: 'Small / White', options: { size: 'S', color: 'White' }, price: 29.99, quantity: 25 },
        ],
        tags: ['t-shirt', 'cotton', 'basics'],
      },
      {
        storeId: store.id,
        name: 'Slim Fit Jeans',
        description: 'Classic slim fit jeans with stretch comfort',
        sku: 'JEANS-001',
        price: 79.99,
        inventoryQuantity: 50,
        images: ['https://placehold.co/600x600/00F0FF/black?text=Jeans'],
        variants: [
          { id: 'v1', name: '30x32', options: { waist: '30', length: '32' }, price: 79.99, quantity: 15 },
          { id: 'v2', name: '32x32', options: { waist: '32', length: '32' }, price: 79.99, quantity: 20 },
          { id: 'v3', name: '34x32', options: { waist: '34', length: '32' }, price: 79.99, quantity: 15 },
        ],
        tags: ['jeans', 'pants', 'denim'],
      },
      {
        storeId: store.id,
        name: 'Summer Dress',
        description: 'Light and flowy summer dress perfect for any occasion',
        sku: 'DRESS-001',
        price: 59.99,
        compareAtPrice: 89.99,
        inventoryQuantity: 30,
        images: ['https://placehold.co/600x600/FF69B4/white?text=Dress'],
        variants: [
          { id: 'v1', name: 'Small / Floral', options: { size: 'S', pattern: 'Floral' }, price: 59.99, quantity: 10 },
          { id: 'v2', name: 'Medium / Floral', options: { size: 'M', pattern: 'Floral' }, price: 59.99, quantity: 10 },
          { id: 'v3', name: 'Large / Floral', options: { size: 'L', pattern: 'Floral' }, price: 59.99, quantity: 10 },
        ],
        tags: ['dress', 'summer', 'floral'],
      },
      {
        storeId: store.id,
        name: 'Leather Handbag',
        description: 'Genuine leather handbag with multiple compartments',
        sku: 'BAG-001',
        price: 149.99,
        inventoryQuantity: 20,
        images: ['https://placehold.co/600x600/8B4513/white?text=Handbag'],
        tags: ['bag', 'leather', 'accessories'],
      },
      {
        storeId: store.id,
        name: 'Running Sneakers',
        description: 'Lightweight running shoes with cushioned sole',
        sku: 'SHOES-001',
        price: 99.99,
        inventoryQuantity: 40,
        images: ['https://placehold.co/600x600/32CD32/white?text=Sneakers'],
        variants: [
          { id: 'v1', name: 'US 8', options: { size: 'US 8' }, price: 99.99, quantity: 10 },
          { id: 'v2', name: 'US 9', options: { size: 'US 9' }, price: 99.99, quantity: 10 },
          { id: 'v3', name: 'US 10', options: { size: 'US 10' }, price: 99.99, quantity: 10 },
          { id: 'v4', name: 'US 11', options: { size: 'US 11' }, price: 99.99, quantity: 10 },
        ],
        tags: ['shoes', 'sneakers', 'running'],
      },
    ],
  });
  console.log('✅ Created', products.count, 'products');

  // Create driver
  const driver = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'driver@example.com',
      password: hashPassword('driver123'),
      role: 'driver',
      emailVerified: new Date(),
      profile: {
        firstName: 'Mike',
        lastName: 'Johnson',
      },
    },
  });
  console.log('✅ Created driver:', driver.email);

  // Create driver profile
  await prisma.driverProfile.create({
    data: {
      userId: driver.id,
      vehicleType: 'car',
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      vehicleYear: 2020,
      vehicleColor: 'Silver',
      vehiclePlateNumber: 'ABC123',
      licenseNumber: 'DL123456',
      backgroundCheckStatus: 'passed',
      backgroundCheckPassedAt: new Date(),
      isOnline: true,
      preferredZones: ['Manhattan', 'Brooklyn'],
    },
  });
  console.log('✅ Created driver profile');

  // Create a scheduled stream
  const stream = await prisma.liveStream.create({
    data: {
      storeId: store.id,
      hostId: storeOwner.id,
      title: 'Summer Collection Launch!',
      description: 'Check out our latest summer styles with exclusive live discounts',
      type: 'scheduled',
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      chatEnabled: true,
      reactionsEnabled: true,
    },
  });
  console.log('✅ Created stream:', stream.title);

  console.log('\n✨ Database seed completed!');
  console.log('\nTest accounts:');
  console.log('  Admin:    admin@liveshop.io / admin123');
  console.log('  Customer: customer@example.com / customer123');
  console.log('  Store:    store@example.com / store123');
  console.log('  Driver:   driver@example.com / driver123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
