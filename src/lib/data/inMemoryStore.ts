import { rawSeedData } from "../../../backend/prisma/seed";
import { KERALA_AGRO_CLIMATIC_ZONES, CROP_PROFILES, CROP_PROFILES_ARRAY } from "@/data/agroClimaticZones";
import { getCropKnowledge } from "@/data/cropKnowledge";

export interface CartItemRecord {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  unit: string;
  stockQuantity: number;
  sellerName?: string;
  location?: string;
  createdAt: number;
}

export interface OrderRecord {
  id: string;
  buyerId: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  paymentMethod: string;
  deliveryAddress: string;
  createdAt: string;
  orderItems: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    product: {
      id: string;
      title: string;
      imageUrl: string;
      unit: string;
      category: string;
      price: number;
      location?: string;
    };
  }>;
  deliveries?: Array<{
    id: string;
    driver: {
      id: string;
      name: string;
      phone: string;
      avatarUrl?: string;
    };
  }>;
}

export interface EquipmentRecord {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  dailyRate: number;
  hourlyRate: number;
  locationName: string;
  imageUrl: string;
  available: boolean;
  rating?: number;
  ownerName?: string;
  createdAt?: string;
}

export interface EquipmentBookingRecord {
  id: string;
  equipmentId: string;
  farmerId: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  equipment?: EquipmentRecord;
  farmer?: {
    id: string;
    name: string;
    phone: string;
    avatarUrl?: string;
  };
  renter?: {
    id: string;
    name: string;
    phone: string;
    avatarUrl?: string;
  };
}

export interface SchemeRecord {
  id: string;
  title: string;
  department: string;
  category: string;
  description: string;
  subsidyAmount: string;
  linkUrl: string;
  isActive: boolean;
}

export interface VetConsultationRecord {
  id: string;
  vetId: string;
  farmerId: string;
  scheduledAt: string;
  notes: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  farmer?: { id: string; name: string };
  vet?: { id: string; name: string };
}

export interface DeliveryTaskRecord {
  id: string;
  orderId: string;
  driverId: string;
  pickupLocation: string;
  deliveryLocation: string;
  earnings: number;
  status: "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED";
  order?: any;
}

// Global persistent in-memory store across Next.js requests in the same Node runtime
const globalStore = (global as any).__AGRINOVA_STORE__ || {
  users: [...rawSeedData.users],
  carts: new Map<string, CartItemRecord[]>(),
  orders: [] as OrderRecord[],
  products: [...rawSeedData.products],
  equipment: [
    {
      id: "eq-01",
      ownerId: "u-equipment-01",
      name: "Mahindra 575 DI Power Plus (47 HP)",
      category: "Tractors",
      dailyRate: 2200,
      hourlyRate: 350,
      locationName: "Palakkad, Kerala",
      imageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600",
      available: true,
      rating: 4.9,
      ownerName: "Kisan Agro Rentals"
    },
    {
      id: "eq-02",
      ownerId: "u-equipment-01",
      name: "Kubota Multi-Row Paddy Harvester & Thresher",
      category: "Harvesters",
      dailyRate: 4800,
      hourlyRate: 650,
      locationName: "Kottayam, Kerala",
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
      available: true,
      rating: 4.8,
      ownerName: "Kisan Agro Rentals"
    },
    {
      id: "eq-03",
      ownerId: "u-equipment-01",
      name: "Shrachi Rotary Power Tiller (13 HP)",
      category: "Tillers",
      dailyRate: 1100,
      hourlyRate: 180,
      locationName: "Wayanad, Kerala",
      imageUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600",
      available: true,
      rating: 4.9,
      ownerName: "Kisan Agro Rentals"
    },
    {
      id: "eq-04",
      ownerId: "u-equipment-01",
      name: "DJI Agras T40 Smart Aerial Spraying Drone",
      category: "Drones",
      dailyRate: 3500,
      hourlyRate: 800,
      locationName: "Idukki, Kerala",
      imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600",
      available: true,
      rating: 5.0,
      ownerName: "Kisan Agro Rentals"
    }
  ] as EquipmentRecord[],
  equipmentBookings: [
    {
      id: "bk-01",
      equipmentId: "eq-01",
      farmerId: "u-farmer-01",
      startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      totalCost: 4400,
      status: "APPROVED",
      equipment: {
        id: "eq-01",
        ownerId: "u-equipment-01",
        name: "Mahindra 575 DI Power Plus (47 HP)",
        category: "Tractors",
        dailyRate: 2200,
        hourlyRate: 350,
        locationName: "Palakkad, Kerala",
        imageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600",
        available: true
      },
      farmer: {
        id: "u-farmer-01",
        name: "Rajesh Kumar",
        phone: "+91 98765 43210",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      },
      renter: {
        id: "u-farmer-01",
        name: "Rajesh Kumar",
        phone: "+91 98765 43210",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      }
    },
    {
      id: "bk-02",
      equipmentId: "eq-02",
      farmerId: "u-farmer-02",
      startDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      totalCost: 9600,
      status: "PENDING",
      equipment: {
        id: "eq-02",
        ownerId: "u-equipment-01",
        name: "Kubota Multi-Row Paddy Harvester & Thresher",
        category: "Harvesters",
        dailyRate: 4800,
        hourlyRate: 650,
        locationName: "Kottayam, Kerala",
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
        available: true
      },
      farmer: {
        id: "u-farmer-02",
        name: "Suresh Pillai",
        phone: "+91 94471 23456",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
      },
      renter: {
        id: "u-farmer-02",
        name: "Suresh Pillai",
        phone: "+91 94471 23456",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
      }
    },
    {
      id: "bk-03",
      equipmentId: "eq-04",
      farmerId: "u-farmer-03",
      startDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      endDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      totalCost: 3500,
      status: "COMPLETED",
      equipment: {
        id: "eq-04",
        ownerId: "u-equipment-01",
        name: "DJI Agras T40 Smart Aerial Spraying Drone",
        category: "Drones",
        dailyRate: 3500,
        hourlyRate: 800,
        locationName: "Idukki, Kerala",
        imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600",
        available: true
      },
      farmer: {
        id: "u-farmer-03",
        name: "Devika Menon",
        phone: "+91 97455 88990",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"
      },
      renter: {
        id: "u-farmer-03",
        name: "Devika Menon",
        phone: "+91 97455 88990",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"
      }
    }
  ] as EquipmentBookingRecord[],
  schemes: [
    {
      id: "sch-01",
      title: "PM-KISAN Samman Nidhi Yojana",
      department: "Ministry of Agriculture & Farmers Welfare",
      category: "Income Support",
      description: "Direct annual income support of ₹6,000 in three equal four-monthly installments to all landholding farmers.",
      subsidyAmount: "₹6,000 / year",
      linkUrl: "https://pmkisan.gov.in",
      isActive: true
    },
    {
      id: "sch-02",
      title: "Sub-Mission on Agricultural Mechanization (SMAM)",
      department: "Department of Agriculture and Farmers Welfare",
      category: "Machinery Subsidy",
      description: "Financial assistance up to 40%-50% for procurement of agricultural machinery and equipment for small and marginal farmers.",
      subsidyAmount: "40% - 50% Subsidy",
      linkUrl: "https://agrimachinery.nic.in",
      isActive: true
    },
    {
      id: "sch-03",
      title: "Kerala State Horticulture Mission (SHM) Subsidy",
      department: "Agriculture Development and Farmers' Welfare Dept, Kerala",
      category: "Horticulture",
      description: "Promoting high-density banana, spice planting, polyhouses, micro-irrigation, and solar farm pump installations across Kerala.",
      subsidyAmount: "Up to ₹1,50,000",
      linkUrl: "https://shm.kerala.gov.in",
      isActive: true
    },
    {
      id: "sch-04",
      title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      department: "Ministry of Agriculture",
      category: "Crop Insurance",
      description: "Comprehensive risk insurance for crop loss due to non-preventable natural risks from pre-sowing to post-harvest.",
      subsidyAmount: "Full Risk Coverage",
      linkUrl: "https://pmfby.gov.in",
      isActive: true
    }
  ] as SchemeRecord[],
  vetConsultations: [
    {
      id: "vet-01",
      vetId: "u-vet-01",
      farmerId: "u-farmer-01",
      scheduledAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      notes: "Animal: Dairy Cow (Vechur breed)\nSymptoms: Mild mastitis symptoms and decreased lactation volume.",
      status: "SCHEDULED",
      farmer: { id: "u-farmer-01", name: "Rajesh Kumar" },
      vet: { id: "u-vet-01", name: "Dr. Ananya Sharma, DVM" }
    },
    {
      id: "vet-02",
      vetId: "u-vet-01",
      farmerId: "u-farmer-02",
      scheduledAt: new Date(Date.now() + 1 * 86400000).toISOString(),
      notes: "Animal: Murrah Buffalo\nSymptoms: Annual FMD vaccination and routine reproductive ultrasound screening.",
      status: "SCHEDULED",
      farmer: { id: "u-farmer-02", name: "Suresh Pillai" },
      vet: { id: "u-vet-01", name: "Dr. Ananya Sharma, DVM" }
    },
    {
      id: "vet-03",
      vetId: "u-vet-01",
      farmerId: "u-farmer-03",
      scheduledAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      notes: "Animal: Malabari Goat Herd\nSymptoms: Deworming consultation and kids nutritional assessment.",
      status: "COMPLETED",
      farmer: { id: "u-farmer-03", name: "Devika Menon" },
      vet: { id: "u-vet-01", name: "Dr. Ananya Sharma, DVM" }
    }
  ] as VetConsultationRecord[],
  deliveryTasks: [
    {
      id: "task-01",
      orderId: "ord-seed-001",
      driverId: "u-delivery-01",
      pickupLocation: "Kottayam Farm Gate #3, Kerala",
      deliveryLocation: "FreshBasket Hub | MG Road, Ernakulam - 682016",
      earnings: 120,
      status: "ASSIGNED",
      order: {
        id: "ord-seed-001",
        totalAmount: 170,
        paymentMethod: "UPI",
        deliveryAddress: "FreshBasket Hub | Phone: 9812345678 | MG Road, Ernakulam - 682016",
        orderItems: [
          {
            id: "oi-01",
            quantity: 2,
            unitPrice: 60,
            product: {
              title: "Organic Malabar Black Pepper",
              imageUrl: "/images/crops/black-pepper.jpg",
              unit: "kg"
            }
          }
        ]
      }
    }
  ] as DeliveryTaskRecord[],
  cultivations: new Map<string, any[]>()
};
(global as any).__AGRINOVA_STORE__ = globalStore;

// Ensure active seed user credentials in persistent globalStore
const seedSync = [
  { id: "u-buyer-01", email: "Subin@gmail.com", name: "FreshBasket Supermarkets (Subin)", role: "BUYER" },
  { id: "u-equipment-01", email: "equipment@agrinova.com", name: "Kisan Agro Rentals", role: "EQUIPMENT_OWNER" },
  { id: "u-vet-01", email: "Vet@agrinova.com", name: "Dr. Ananya Sharma, DVM", role: "VETERINARY_EXPERT" },
  { id: "u-admin-01", email: "admin@agrinova.com", name: "Enterprise Admin", role: "ADMIN" },
  { id: "u-farmer-01", email: "farmer@agri-nova.com", name: "Rajesh Kumar", role: "FARMER" },
  { id: "u-delivery-01", email: "delivery@agri-nova.com", name: "AgriExpress Logistics", role: "DELIVERY_PARTNER" }
];
for (const s of seedSync) {
  const match = globalStore.users.find((u: any) => u.id === s.id || u.role === s.role);
  if (match) {
    match.email = s.email;
    match.name = s.name;
    match.role = s.role;
  }
}

// Initialize farmer cultivation if empty
if (!globalStore.cultivations.has("u-farmer-01") || globalStore.cultivations.get("u-farmer-01").length === 0) {
  const coconutKnowledge = getCropKnowledge("Coconut");
  globalStore.cultivations.set("u-farmer-01", [
    {
      id: "cult-farmer-01",
      farmerId: "u-farmer-01",
      cropProfileId: "profile_coconut",
      cropName: "Coconut",
      region: "Southern Coastal Plain",
      startDate: new Date(Date.now() - 3 * 86400000).toISOString(),
      status: "IN_PROGRESS",
      currentStage: "Stage 1: Planting & Seedling Establishment",
      currentStageNumber: 1,
      totalStages: 4,
      healthStatus: "EXCELLENT",
      cropProfile: {
        id: "profile_coconut",
        name: "Coconut",
        category: "PLANTATION",
        expectedYield: "60 - 80 Nuts/Palm/Year",
        growingPeriod: "Perennial (Starts in 4-6 yrs)",
        waterRequirement: 4,
        imageUrl: "/images/crops/coconut.jpg",
        cultivationGuide: {
          id: "guide-coconut",
          landPreparation: coconutKnowledge.landPreparation,
          seedInformation: coconutKnowledge.seedInformation,
          spacing: coconutKnowledge.spacing,
          cultivationStages: [
            { id: "st-01", stageOrder: 1, name: "Pit Preparation & Planting", duration: "Day 1-14", instructions: "Dig pits of 1m x 1m x 1m size. Fill with topsoil and compost up to 60cm before planting seedling.", isCompleted: false },
            { id: "st-02", stageOrder: 2, name: "Early Vegetative Establishment", duration: "Months 1-12", instructions: "Provide shade in summer and regular bi-weekly watering during dry months.", isCompleted: false },
            { id: "st-03", stageOrder: 3, name: "Crown Development & Trunking", duration: "Years 2-4", instructions: "Apply balanced NPK + organic manure twice annually before and after monsoon.", isCompleted: false },
            { id: "st-04", stageOrder: 4, name: "Flowering & Nut Bearing", duration: "Year 5 onwards", instructions: "Regular bunch inspection and prophylactic pest control against rhinoceros beetle.", isCompleted: false }
          ],
          wateringSchedules: [
            { id: "ws-01", frequency: "Every 3-4 days in dry summer", method: "Basin or Drip Irrigation", waterAmount: "40-50 Litres/palm" }
          ],
          manureFertilizers: [
            { id: "mf-01", name: "Farmyard Manure (FYM)", dosage: "25-50 kg/palm/year", applicationTime: "Onset of South-West Monsoon" },
            { id: "mf-02", name: "NPK 14-14-14 Mixture", dosage: "1.3 kg/palm/year", applicationTime: "Post-monsoon (September-October)" }
          ],
          pestDiseases: [
            { id: "pd-01", name: "Rhinoceros Beetle (Oryctes rhinoceros)", symptoms: "V-shaped cuts on leaves", treatment: "Place naphthalene balls (3-4 pcs) in leaf axils" }
          ]
        }
      },
      stageSubmissions: [
        {
          id: "sub-01",
          stageId: "st-01",
          stageName: "Pit Preparation & Planting",
          imageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600",
          farmerNotes: "Initial pit preparation photograph submitted upon supervised cultivation enrollment.",
          status: "APPROVED",
          submittedAt: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      ],
      weeklyPhotos: [],
      activities: [
        { id: "act-01", title: "Planting Pit Verification", scheduledDate: new Date(Date.now() - 2 * 86400000).toISOString(), isCompleted: true },
        { id: "act-02", title: "Week 1 Basin Irrigation", scheduledDate: new Date(Date.now() + 86400000).toISOString(), isCompleted: false },
        { id: "act-03", title: "Organic Manure Application", scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString(), isCompleted: false }
      ]
    }
  ]);
}

export const inMemoryStore = {
  // USERS
  getUsers() {
    return globalStore.users;
  },

  getUserByEmail(email: string) {
    const norm = email.trim().toLowerCase();
    // Subin@gmail.com and buyer aliases
    if (norm === "subin@gmail.com" || norm === "buyer@agri-nova.com" || norm === "buyer@agrinova.com") {
      const buyerUser = globalStore.users.find((u: any) => u.id === "u-buyer-01" || u.email.toLowerCase() === norm || u.role === "BUYER");
      if (buyerUser) {
        buyerUser.email = "Subin@gmail.com";
        return buyerUser;
      }
    }
    const altNorm = norm.includes('@agri-nova.com')
      ? norm.replace('@agri-nova.com', '@agrinova.com')
      : norm.includes('@agrinova.com')
      ? norm.replace('@agrinova.com', '@agri-nova.com')
      : norm;
    return globalStore.users.find((u: any) => u.email.toLowerCase() === norm || u.email.toLowerCase() === altNorm) || null;
  },

  getUserById(id: string) {
    return globalStore.users.find((u: any) => u.id === id) || null;
  },

  getUserByPhone(phone: string) {
    const clean = phone.trim().replace(/[\s-()]/g, "");
    return globalStore.users.find((u: any) => u.phone && u.phone.replace(/[\s-()]/g, "") === clean) || null;
  },

  updateUser(id: string, data: any) {
    const user = this.getUserById(id);
    if (!user) return null;
    Object.assign(user, data);
    return user;
  },

  registerUser(userData: any) {
    // Only FARMER and BUYER can register new accounts
    if (userData.role !== "FARMER" && userData.role !== "BUYER") {
      return { success: false, error: "Access denied. Only Farmer and Buyer accounts can be registered. Other user roles cannot create a new account." };
    }

    const existing = this.getUserByEmail(userData.email);
    if (existing) return { success: false, error: "An account with this email already exists." };

    const newUser = {
      id: `u-${Date.now()}`,
      ...userData,
      kycStatus: "VERIFIED",
      createdAt: new Date().toISOString()
    };
    globalStore.users.push(newUser);
    return { success: true, user: newUser };
  },

  updateUserProfile(userId: string, data: any) {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: "User not found." };
    Object.assign(user, data);
    return { success: true, user };
  },

  // PRODUCTS
  getProducts() {
    return globalStore.products;
  },

  getProductById(id: string) {
    return globalStore.products.find((p: any) => p.id === id) || null;
  },

  // CART
  getCart(buyerId: string): CartItemRecord[] {
    return globalStore.carts.get(buyerId) || [];
  },

  addToCart(buyerId: string, productId: string, quantity: number): { success: boolean; error?: string; cart?: CartItemRecord[] } {
    const product = globalStore.products.find((p: any) => p.id === productId);
    if (!product) {
      return { success: false, error: "This product is currently unavailable." };
    }

    const currentItems: CartItemRecord[] = globalStore.carts.get(buyerId) || [];
    const existingIndex = currentItems.findIndex(i => i.productId === productId);
    const existingQuantity = existingIndex > -1 ? currentItems[existingIndex].quantity : 0;
    const newQuantity = existingQuantity + quantity;

    if (newQuantity > (product.stockQuantity || 9999)) {
      return { 
        success: false, 
        error: `Only ${product.stockQuantity} ${product.unit} available in stock.` 
      };
    }

    if (existingIndex > -1) {
      currentItems[existingIndex].quantity = newQuantity;
    } else {
      currentItems.push({
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: quantity,
        imageUrl: product.imageUrl,
        unit: product.unit,
        stockQuantity: product.stockQuantity,
        sellerName: "Rajesh Kumar (Verified Farmer)",
        location: product.location || "Kerala",
        createdAt: Date.now()
      });
    }

    globalStore.carts.set(buyerId, currentItems);
    return { success: true, cart: currentItems };
  },

  updateCartQuantity(buyerId: string, cartItemId: string, quantity: number): { success: boolean; error?: string } {
    const currentItems: CartItemRecord[] = globalStore.carts.get(buyerId) || [];
    const item = currentItems.find(i => i.id === cartItemId);
    if (!item) {
      return { success: false, error: "Cart item not found." };
    }

    if (quantity > item.stockQuantity) {
      return { success: false, error: `Only ${item.stockQuantity} ${item.unit} available.` };
    }

    item.quantity = quantity;
    globalStore.carts.set(buyerId, currentItems);
    return { success: true };
  },

  removeFromCart(buyerId: string, cartItemId: string): boolean {
    const currentItems: CartItemRecord[] = globalStore.carts.get(buyerId) || [];
    const filtered = currentItems.filter(i => i.id !== cartItemId);
    globalStore.carts.set(buyerId, filtered);
    return true;
  },

  clearCart(buyerId: string) {
    globalStore.carts.set(buyerId, []);
  },

  // CHECKOUT & ORDERS
  checkout(buyerId: string, data: {
    recipientName: string;
    phone: string;
    deliveryAddress: string;
    city: string;
    pincode: string;
    paymentMethod: string;
    deliverySlot?: string;
    deliveryNotes?: string;
  }): { success: boolean; orderId?: string; order?: OrderRecord; error?: string } {
    const cartItems = this.getCart(buyerId);
    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "Your cart is empty. Please add items before checking out." };
    }

    let subtotal = 0;
    const orderItems = cartItems.map(item => {
      const lineTotal = item.quantity * item.price;
      subtotal += lineTotal;

      const prod = globalStore.products.find((p: any) => p.id === item.productId);
      if (prod && prod.stockQuantity !== undefined) {
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
      }

      return {
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        product: {
          id: item.productId,
          title: item.title,
          imageUrl: item.imageUrl,
          unit: item.unit,
          category: "PRODUCE",
          price: item.price,
          location: item.location || "Kerala"
        }
      };
    });

    const deliveryFee = 50;
    const totalAmount = subtotal + deliveryFee;
    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const formattedAddress = `${data.recipientName.trim()} | Phone: ${data.phone.trim()} | ${data.deliveryAddress.trim()}, ${data.city.trim()} - ${data.pincode.trim()}${data.deliverySlot ? ` | Slot: ${data.deliverySlot}` : ''}${data.deliveryNotes ? ` | Note: ${data.deliveryNotes.trim()}` : ''}`;

    const newOrder: OrderRecord = {
      id: orderId,
      buyerId,
      totalAmount,
      status: "CONFIRMED",
      paymentMethod: data.paymentMethod || "UPI",
      deliveryAddress: formattedAddress,
      createdAt: new Date().toISOString(),
      orderItems,
      deliveries: [
        {
          id: `del-${Date.now()}`,
          driver: {
            id: "u-delivery-01",
            name: "AgriExpress Logistics (Partner)",
            phone: "+91 98989 89898",
            avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150"
          }
        }
      ]
    };

    globalStore.orders.unshift(newOrder);

    // Also push a delivery task for delivery partner
    globalStore.deliveryTasks.unshift({
      id: `task-${Date.now()}`,
      orderId: newOrder.id,
      driverId: "u-delivery-01",
      pickupLocation: "Central Agricultural Terminal, Kerala",
      deliveryLocation: formattedAddress,
      earnings: 65,
      status: "ASSIGNED",
      order: newOrder
    });

    this.clearCart(buyerId);
    return { success: true, orderId, order: newOrder };
  },

  getBuyerOrders(buyerId: string): OrderRecord[] {
    return globalStore.orders.filter((o: OrderRecord) => o.buyerId === buyerId);
  },

  updateOrderStatus(orderId: string, buyerId: string, action: string): { success: boolean; order?: OrderRecord; error?: string } {
    const order = globalStore.orders.find((o: OrderRecord) => o.id === orderId && o.buyerId === buyerId);
    if (!order) {
      return { success: false, error: "Order not found." };
    }

    if (action === "CONFIRM_INSPECTION") {
      order.status = "DELIVERED";
    } else if (action === "CANCEL") {
      if (order.status === "DELIVERED") {
        return { success: false, error: "Cannot cancel an already delivered order." };
      }
      order.status = "CANCELLED";
    }

    return { success: true, order };
  },

  // EQUIPMENT
  getEquipment(filter?: { category?: string; available?: boolean; ownerId?: string }) {
    let list = [...globalStore.equipment];
    if (filter?.category) list = list.filter(e => e.category === filter.category);
    if (filter?.available !== undefined) list = list.filter(e => e.available === filter.available);
    if (filter?.ownerId) list = list.filter(e => e.ownerId === filter.ownerId);
    return list;
  },

  getEquipmentById(id: string) {
    return globalStore.equipment.find(e => e.id === id) || null;
  },

  addEquipment(ownerId: string, data: any) {
    const newEq: EquipmentRecord = {
      id: `eq-${Date.now()}`,
      ownerId,
      name: data.name,
      category: data.category,
      dailyRate: Number(data.dailyRate),
      hourlyRate: Number(data.hourlyRate),
      locationName: data.locationName,
      imageUrl: data.imageUrl,
      available: data.available !== undefined ? data.available : true,
      rating: 5.0,
      ownerName: "Kisan Agro Rentals",
      createdAt: new Date().toISOString()
    };
    globalStore.equipment.unshift(newEq);
    return newEq;
  },

  updateEquipment(id: string, ownerId: string, data: any) {
    const eq = globalStore.equipment.find(e => e.id === id && e.ownerId === ownerId);
    if (!eq) return null;
    Object.assign(eq, data);
    return eq;
  },

  deleteEquipment(id: string, ownerId: string) {
    const index = globalStore.equipment.findIndex(e => e.id === id && e.ownerId === ownerId);
    if (index > -1) {
      globalStore.equipment.splice(index, 1);
      return true;
    }
    return false;
  },

  bookEquipment(bookingData: { equipmentId: string; farmerId: string; startDate: string; endDate: string; totalCost: number }) {
    const eq = this.getEquipmentById(bookingData.equipmentId);
    const booking: EquipmentBookingRecord = {
      id: `bk-${Date.now()}`,
      equipmentId: bookingData.equipmentId,
      farmerId: bookingData.farmerId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      totalCost: bookingData.totalCost,
      status: "PENDING",
      equipment: eq || undefined,
      farmer: {
        id: bookingData.farmerId,
        name: "Rajesh Kumar",
        phone: "+91 98765 43210",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      },
      renter: {
        id: bookingData.farmerId,
        name: "Rajesh Kumar",
        phone: "+91 98765 43210",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      }
    };
    globalStore.equipmentBookings.unshift(booking);
    return booking;
  },

  getEquipmentBookings(ownerId?: string, farmerId?: string) {
    let list = [...globalStore.equipmentBookings];
    if (ownerId) {
      list = list.filter(b => b.equipment?.ownerId === ownerId);
    }
    if (farmerId) {
      list = list.filter(b => b.farmerId === farmerId);
    }
    return list.map(b => ({
      ...b,
      renter: b.renter || b.farmer || {
        id: b.farmerId,
        name: "Rajesh Kumar",
        phone: "+91 98765 43210",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      },
      farmer: b.farmer || b.renter || {
        id: b.farmerId,
        name: "Rajesh Kumar",
        phone: "+91 98765 43210",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      }
    }));
  },

  updateEquipmentBookingStatus(bookingId: string, status: "APPROVED" | "REJECTED") {
    const booking = globalStore.equipmentBookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = status;
      return booking;
    }
    return null;
  },

  // GOVERNMENT SCHEMES
  getSchemes(filter?: { category?: string; isActive?: boolean }) {
    let list = [...globalStore.schemes];
    if (filter?.category) list = list.filter(s => s.category === filter.category);
    if (filter?.isActive !== undefined) list = list.filter(s => s.isActive === filter.isActive);
    return list;
  },

  addScheme(data: any) {
    const newSch: SchemeRecord = {
      id: `sch-${Date.now()}`,
      title: data.title,
      department: data.department,
      category: data.category,
      description: data.description,
      subsidyAmount: data.subsidyAmount,
      linkUrl: data.linkUrl,
      isActive: data.isActive !== undefined ? data.isActive : true
    };
    globalStore.schemes.push(newSch);
    return newSch;
  },

  // VETERINARY
  getVetConsultations(userId?: string) {
    if (!userId) return globalStore.vetConsultations;
    return globalStore.vetConsultations.filter(v => v.farmerId === userId || v.vetId === userId);
  },

  bookVetConsultation(data: { farmerId: string; scheduledAt: string; notes: string }) {
    const newConsultation: VetConsultationRecord = {
      id: `vet-${Date.now()}`,
      vetId: "u-vet-01",
      farmerId: data.farmerId,
      scheduledAt: data.scheduledAt,
      notes: data.notes,
      status: "SCHEDULED",
      farmer: { id: data.farmerId, name: "Rajesh Kumar" },
      vet: { id: "u-vet-01", name: "Dr. Ananya Sharma, DVM" }
    };
    globalStore.vetConsultations.unshift(newConsultation);
    return newConsultation;
  },

  // DELIVERY TASKS
  getDeliveryTasks(driverId?: string) {
    if (!driverId) return globalStore.deliveryTasks;
    return globalStore.deliveryTasks.filter(t => t.driverId === driverId && t.status !== "DELIVERED");
  },

  updateDeliveryTaskStatus(taskId: string, status: "PICKED_UP" | "IN_TRANSIT" | "DELIVERED") {
    const task = globalStore.deliveryTasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      return task;
    }
    return null;
  },

  // CULTIVATIONS
  getCultivations(farmerId: string) {
    return globalStore.cultivations.get(farmerId) || [];
  },

  getCultivationById(farmerId: string, id: string) {
    const list = this.getCultivations(farmerId);
    return list.find(c => c.id === id) || list[0] || null;
  },

  startCultivation(farmerId: string, cropName: string, region: string) {
    const knowledge = getCropKnowledge(cropName);
    const existingList = this.getCultivations(farmerId);

    const newCult = {
      id: `cult-${Date.now()}`,
      farmerId,
      cropProfileId: `profile_${cropName.toLowerCase().replace(/\s+/g, '_')}`,
      cropName,
      region: region || "Kerala Farm Field",
      startDate: new Date().toISOString(),
      status: "IN_PROGRESS",
      currentStage: "Stage 1: Planting & Seedling Establishment",
      currentStageNumber: 1,
      totalStages: 4,
      healthStatus: "EXCELLENT",
      cropProfile: {
        id: `profile_${cropName.toLowerCase().replace(/\s+/g, '_')}`,
        name: cropName,
        category: knowledge.category,
        expectedYield: knowledge.expectedYield,
        growingPeriod: knowledge.growingPeriod,
        waterRequirement: knowledge.waterRequirement,
        imageUrl: `/images/crops/${cropName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        cultivationGuide: {
          id: `guide-${cropName.toLowerCase().replace(/\s+/g, '-')}`,
          landPreparation: knowledge.landPreparation,
          seedInformation: knowledge.seedInformation,
          spacing: knowledge.spacing,
          cultivationStages: [
            { id: `st-${Date.now()}-1`, stageOrder: 1, name: "Land Preparation & Sowing", duration: "Day 1-14", instructions: "Ensure weed-free, well-aerated soil. Sow at recommended spacing.", isCompleted: false },
            { id: `st-${Date.now()}-2`, stageOrder: 2, name: "Vegetative Growth & Weeding", duration: "Day 15-45", instructions: "Apply first top-dressing of fertilizer. Maintain regular irrigation.", isCompleted: false },
            { id: `st-${Date.now()}-3`, stageOrder: 3, name: "Flowering & Fruit Setting", duration: "Day 46-75", instructions: "Monitor closely for insect pests. Ensure optimal soil moisture.", isCompleted: false },
            { id: `st-${Date.now()}-4`, stageOrder: 4, name: "Maturity & Harvesting", duration: "Day 76-90", instructions: "Harvest during dry, cool hours of the morning for peak freshness.", isCompleted: false }
          ],
          wateringSchedules: [
            { id: "ws-1", frequency: "Every 2-3 days", method: "Drip Irrigation", waterAmount: "3-5 Litres / plant" }
          ],
          manureFertilizers: [
            { id: "mf-1", name: "Vermicompost", dosage: "2 Tons / acre", applicationTime: "Basal dressing" }
          ],
          pestDiseases: [
            { id: "pd-1", name: "Common Sucking Pests", symptoms: "Leaf curling and yellowing", treatment: "Spray 2% Neem oil solution" }
          ]
        }
      },
      stageSubmissions: [],
      weeklyPhotos: [],
      activities: [
        { id: `act-${Date.now()}-1`, title: "72-Hour Planting Photo Evidence", scheduledDate: new Date().toISOString(), isCompleted: false },
        { id: `act-${Date.now()}-2`, title: "First Scheduled Irrigation", scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString(), isCompleted: false }
      ]
    };

    existingList.unshift(newCult);
    globalStore.cultivations.set(farmerId, existingList);
    return newCult;
  },

  submitStageEvidence(farmerId: string, cultivationId: string, stageId: string, imageUrl: string, notes: string) {
    const list = this.getCultivations(farmerId);
    const cult = list.find(c => c.id === cultivationId);
    if (!cult) return null;

    const submission = {
      id: `sub-${Date.now()}`,
      stageId,
      stageName: "Cultivation Evidence Submission",
      imageUrl,
      farmerNotes: notes,
      status: "APPROVED",
      submittedAt: new Date().toISOString()
    };
    cult.stageSubmissions.unshift(submission);
    return submission;
  },

  submitWeeklyPhoto(farmerId: string, cultivationId: string, weekNumber: number, imageUrl: string, notes: string) {
    const list = this.getCultivations(farmerId);
    const cult = list.find(c => c.id === cultivationId);
    if (!cult) return null;

    const weekly = {
      id: `wk-${Date.now()}`,
      weekNumber,
      imageUrl,
      notes,
      uploadedAt: new Date().toISOString()
    };
    cult.weeklyPhotos.push(weekly);
    return weekly;
  },

  deleteCultivation(farmerId: string, cultivationId: string) {
    const list = this.getCultivations(farmerId);
    const filtered = list.filter(c => c.id !== cultivationId);
    globalStore.cultivations.set(farmerId, filtered);
    return true;
  },

  // ZONES & CROPS
  getAgroClimaticZones() {
    return KERALA_AGRO_CLIMATIC_ZONES;
  },

  getCropProfiles() {
    return CROP_PROFILES_ARRAY;
  }
};
