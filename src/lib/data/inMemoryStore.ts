import { rawSeedData } from "../../../backend/prisma/seed";
import { KERALA_AGRO_CLIMATIC_ZONES, CROP_PROFILES } from "@/data/agroClimaticZones";

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

// Global persistent in-memory store across Next.js requests in the same Node runtime
const globalStore = (global as any).__AGRINOVA_STORE__ || {
  carts: new Map<string, CartItemRecord[]>(),
  orders: [] as OrderRecord[],
  products: [...rawSeedData.products],
  cultivations: new Map<string, any[]>()
};
(global as any).__AGRINOVA_STORE__ = globalStore;

// Initialize some sample orders for buyer if empty
if (globalStore.orders.length === 0) {
  const p1 = rawSeedData.products[0];
  const p2 = rawSeedData.products[1] || rawSeedData.products[0];
  globalStore.orders.push({
    id: "ord-seed-001",
    buyerId: "u-buyer-01",
    totalAmount: (p1 ? p1.price * 2 : 120) + 50,
    status: "CONFIRMED",
    paymentMethod: "UPI",
    deliveryAddress: "FreshBasket Hub | Phone: 9812345678 | MG Road, Ernakulam - 682016",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    orderItems: [
      {
        id: "item-seed-01",
        productId: p1?.id || "prod-01",
        quantity: 2,
        unitPrice: p1?.price || 60,
        product: {
          id: p1?.id || "prod-01",
          title: p1?.title || "Organic Malabar Black Pepper",
          imageUrl: p1?.imageUrl || "/images/crops/black-pepper.jpg",
          unit: p1?.unit || "kg",
          category: p1?.category || "SPICES",
          price: p1?.price || 60,
          location: p1?.location || "Idukki, Kerala"
        }
      }
    ],
    deliveries: [
      {
        id: "del-01",
        driver: {
          id: "u-delivery-01",
          name: "AgriExpress Logistics",
          phone: "+91 98989 89898",
          avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150"
        }
      }
    ]
  });
}

export const inMemoryStore = {
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

      // Decrement stock in product catalog
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

  // ZONES & CROPS
  getAgroClimaticZones() {
    return KERALA_AGRO_CLIMATIC_ZONES;
  },

  getCropProfiles() {
    return CROP_PROFILES;
  }
};
