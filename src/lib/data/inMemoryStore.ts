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

export interface RegionalLivestockRecord {
  id: string;
  district: string;
  primaryLivestock: string;
  focusAreas: string;
  climateSuitability?: string;
  imageUrl?: string;
}

export interface LivestockRecommendationRecord {
  id: string;
  breedName: string;
  expectedYield: string;
  fatContent: string;
  maintenanceLevel: string;
  location: string;
  imageUrl?: string;
  category?: string;
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
  cultivations: new Map<string, any[]>(),
  regionalLivestock: [
    {
      id: "reg-01",
      district: "Thiruvananthapuram",
      primaryLivestock: "Crossbred Dairy Cows (Jersey x HF), Malabari Goats, Broiler & Layer Poultry, Commercial Rabbits",
      focusAreas: "Extensive dairy cooperatives, organized urban milk supply, organized backyard poultry & meat rabbit farms.",
      climateSuitability: "Coastal & midland tropical humid; requires well-ventilated housing and regular ectoparasite prevention.",
      imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600"
    },
    {
      id: "reg-02",
      district: "Kollam",
      primaryLivestock: "Crossbred Dairy Cows, Malabari Goats, Kuttanad & Vigova Ducks, Murrah Buffaloes",
      focusAreas: "Wetland duck rearing in backwaters, peri-urban dairy farming, and fodder cultivation along paddy bunds.",
      climateSuitability: "High humidity coastal belt; excellent for waterfowl and crossbred cattle with shaded loose housing.",
      imageUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?w=600"
    },
    {
      id: "reg-03",
      district: "Pathanamthitta",
      primaryLivestock: "High-Yielding Dairy Cattle, Swamp & River Buffaloes, Malabari Goats, Upper Kuttanad Ducks",
      focusAreas: "Dairy farming in midland tracts, Upper Kuttanad duck grazing, and commercial silage feeding units.",
      climateSuitability: "Midland & foot-hill climate with heavy monsoon; elevated slatted floor housing recommended for goats.",
      imageUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600"
    },
    {
      id: "reg-04",
      district: "Alappuzha",
      primaryLivestock: "Kuttanad Ducks (Chara & Chemballi), Dwarf Vechur Cows, River Buffaloes, Crossbred Dairy Cattle",
      focusAreas: "State capital for wetland duck farming (Kuttanad basin), duck-fish integrated farming, and flood-resilient dwarf cattle.",
      climateSuitability: "Wetland & aquatic ecosystem below sea level; high natural water availability for duck swimming and forage.",
      imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600"
    },
    {
      id: "reg-05",
      district: "Kottayam",
      primaryLivestock: "Indigenous Vechur Cattle, Murrah Buffaloes, Kuttanad Ducks, Crossbred Dairy Cows, Commercial Piggery",
      focusAreas: "Global conservation center of the ultra-resilient dwarf Vechur breed; extensive rubber-plantation integrated cattle grazing.",
      climateSuitability: "Tropical humid midland; Vechur cows show outstanding natural immunity and high A2 medicinal milk quality.",
      imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600"
    },
    {
      id: "reg-06",
      district: "Idukki",
      primaryLivestock: "Highland HF & Jersey Dairy Cattle, Large White Yorkshire Pigs, Boer & Malabari Cross Goats",
      focusAreas: "High-altitude cool climate dairy belt (High Ranges); top milk yield per cow in Kerala with commercial temperate piggeries.",
      climateSuitability: "Cool high-range climate (12°C - 24°C); ideal for exotic temperate breeds (Holstein Friesian) with low heat stress.",
      imageUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600"
    },
    {
      id: "reg-07",
      district: "Ernakulam",
      primaryLivestock: "Commercial Broiler & Layer Poultry, Crossbred Dairy Cattle, Malabari Goats, Piggery Units",
      focusAreas: "State-of-the-art commercial poultry and egg production hubs, automated peri-urban dairies, and meat processing supply chains.",
      climateSuitability: "Central industrial-agricultural belt with high market access; closed bio-secure poultry housing highly recommended.",
      imageUrl: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600"
    },
    {
      id: "reg-08",
      district: "Thrissur",
      primaryLivestock: "Murrah & Surti Buffaloes, Crossbred Dairy Cows, Malabari Goats, Pig Breeding Stations",
      focusAreas: "Major agricultural buffalo and dairy cluster (Mannuthy Veterinary Hub); advanced animal genetics and commercial feed factories.",
      climateSuitability: "Central plain and coastal basin; abundant paddy straw and agricultural by-products for ruminant feed.",
      imageUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600"
    },
    {
      id: "reg-09",
      district: "Palakkad",
      primaryLivestock: "Attappady Black Goats, Murrah Buffaloes, High-Yielding Dairy Cows, Kenguri Sheep, Backyard Poultry",
      focusAreas: "Largest livestock population in Kerala; home to native Attappady Black drought-resistant goats and extensive dairy farming across the Palakkad Gap.",
      climateSuitability: "Semi-arid tropical dry belt with higher daytime temperatures; native breeds (Attappady Black) thrive with minimal water.",
      imageUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?w=600"
    },
    {
      id: "reg-10",
      district: "Malappuram",
      primaryLivestock: "Malabari Goats (Tellicherry), Commercial Broilers, Crossbred Dairy Cows, Buffaloes, Ducks",
      focusAreas: "Largest goat population in South India; premier breeding hub for prolific Malabari twinning goats and commercial poultry.",
      climateSuitability: "Midland tropical climate; slatted wooden floor housing for goats prevents foot rot during the South-West monsoon.",
      imageUrl: "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=600"
    },
    {
      id: "reg-11",
      district: "Kozhikode",
      primaryLivestock: "Malabari Goats, Commercial Layer & Country Chicken, Crossbred Dairy Cows, Meat Rabbits",
      focusAreas: "Specialized Tellicherry/Malabari goat germplasm center, urban dairy cooperatives, and backyard quail and poultry production.",
      climateSuitability: "Coastal tropical climate; elevated sheds with cross-ventilation provide optimal protection against coastal humidity.",
      imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600"
    },
    {
      id: "reg-12",
      district: "Wayanad",
      primaryLivestock: "High-Altitude Dairy Cattle (HF x Jersey), Commercial Piggeries, Free-Range Country Poultry, Boer Goats",
      focusAreas: "Cool hill-tract dairy production, coffee and tea plantation integrated dairy grazing, and commercial pork farming.",
      climateSuitability: "Sub-tropical highland plateau (700m - 2100m elevation); minimal heat stress allows temperate dairy breeds to achieve peak genetic lactation.",
      imageUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600"
    },
    {
      id: "reg-13",
      district: "Kannur",
      primaryLivestock: "Malabari Goats, Crossbred Dairy Cows, Commercial Piggery, Japanese Quail & Broiler Poultry",
      focusAreas: "Purebred Malabari goat conservation and pedigree record keeping, North Malabar commercial pig farming, and intensive poultry.",
      climateSuitability: "Humid coastal-midland climate; regular vaccination against PPR in goats and FMD in cattle recommended.",
      imageUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?w=600"
    },
    {
      id: "reg-14",
      district: "Kasaragod",
      primaryLivestock: "Kasaragod Dwarf Cattle, Malabari Goats, Backyard Poultry, Crossbred Dairy Cows",
      focusAreas: "Native Kasaragod Dwarf cattle conservation (smallest cattle breed with high disease immunity and low maintenance), and zero-grazing dairy units.",
      climateSuitability: "Northern coastal tropical belt; native dwarf cattle can graze on steep terrains and withstand monsoon rains without hoof damage.",
      imageUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600"
    }
  ] as RegionalLivestockRecord[],
  livestockRecommendations: [
    {
      id: "rec-01",
      breedName: "Vechur Cow (Indigenous Dwarf)",
      expectedYield: "3 - 4 L/day (Medicinal A2 Milk)",
      fatContent: "4.7% - 5.8%",
      maintenanceLevel: "Extremely Low (High Heat & Disease Resistance)",
      location: "Kottayam, Alappuzha, Pathanamthitta, Ernakulam & Central Kerala",
      category: "Cattle",
      imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500"
    },
    {
      id: "rec-02",
      breedName: "Kasaragod Dwarf Cattle",
      expectedYield: "2 - 3 L/day (Zero Grazing Tolerant)",
      fatContent: "4.5% - 5.2%",
      maintenanceLevel: "Very Low (Survives on local roughage)",
      location: "Kasaragod, Kannur, Wayanad & North Kerala",
      category: "Cattle",
      imageUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500"
    },
    {
      id: "rec-03",
      breedName: "Malabari Goat (Tellicherry)",
      expectedYield: "1.5 - 2.5 L/day (Prolific Twinning 80%+)",
      fatContent: "3.8% - 4.5%",
      maintenanceLevel: "Low to Moderate",
      location: "Kozhikode, Kannur, Malappuram, Wayanad, Palakkad & All Kerala",
      category: "Goat",
      imageUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?w=500"
    },
    {
      id: "rec-04",
      breedName: "Attappady Black Goat",
      expectedYield: "1.0 - 1.5 L/day (Lean bronze meat, high heat tolerance)",
      fatContent: "4.0% - 4.8%",
      maintenanceLevel: "Very Low (Western Ghats Foothills)",
      location: "Palakkad, Thrissur & Malappuram",
      category: "Goat",
      imageUrl: "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=500"
    },
    {
      id: "rec-05",
      breedName: "Murrah Buffalo",
      expectedYield: "12 - 18 L/day (High Milk Fat & Solids)",
      fatContent: "6.5% - 7.5%",
      maintenanceLevel: "Moderate to High",
      location: "Palakkad, Thrissur, Ernakulam & Kollam",
      category: "Buffalo",
      imageUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500"
    },
    {
      id: "rec-06",
      breedName: "Kuttanad Duck (Chara & Chemballi)",
      expectedYield: "200 - 240 Eggs/Year (Post-harvest paddy feeder)",
      fatContent: "Rich Yolk Lipids",
      maintenanceLevel: "Low (Paddy field grazer)",
      location: "Alappuzha, Kottayam, Pathanamthitta & Kollam",
      category: "Duck",
      imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500"
    },
    {
      id: "rec-07",
      breedName: "Highland Crossbred Dairy Cow (HF x Jersey)",
      expectedYield: "16 - 22 L/day (High Commercial Output)",
      fatContent: "3.8% - 4.2%",
      maintenanceLevel: "Moderate (Cool Hill Environment)",
      location: "Idukki, Wayanad & Highland Tracts",
      category: "Cattle",
      imageUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=500"
    },
    {
      id: "rec-08",
      breedName: "Large White Yorkshire Cross Pig",
      expectedYield: "Litter size 10-12 (80kg at 7 months)",
      fatContent: "Lean pork with high feed conversion",
      maintenanceLevel: "Moderate (Hygienic Pens)",
      location: "Idukki, Wayanad, Kottayam, Thrissur & Ernakulam",
      category: "Pig",
      imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500"
    },
    {
      id: "rec-09",
      breedName: "Gramalakshmi / BV-380 Layer Poultry",
      expectedYield: "200 - 230 Brown Eggs/Year",
      fatContent: "Nutritious Country Eggs",
      maintenanceLevel: "Very Low (Backyard scavenging)",
      location: "Thiruvananthapuram, Kollam, Ernakulam & All Kerala",
      category: "Poultry",
      imageUrl: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500"
    }
  ] as LivestockRecommendationRecord[],
  cropProfiles: CROP_PROFILES_ARRAY.map((c, idx) => ({
    id: c.id || `crop-${idx + 1}`,
    name: c.name,
    category: (c as any).category || "General Crop",
    expectedYield: c.expectedYield,
    growingPeriod: c.growingPeriod,
    waterRequirement: c.waterRequirement,
    fertilizer: c.fertilizer,
    pesticide: c.pesticide,
    imageUrl: c.imageUrl || `/images/crops/${c.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
  })) as any[]
};
(global as any).__AGRINOVA_STORE__ = globalStore;
if (!globalStore.cropProfiles || globalStore.cropProfiles.length === 0) {
  globalStore.cropProfiles = CROP_PROFILES_ARRAY.map((c, idx) => ({
    id: c.id || `crop-${idx + 1}`,
    name: c.name,
    category: (c as any).category || "General Crop",
    expectedYield: c.expectedYield,
    growingPeriod: c.growingPeriod,
    waterRequirement: c.waterRequirement,
    fertilizer: c.fertilizer,
    pesticide: c.pesticide,
    imageUrl: c.imageUrl || `/images/crops/${c.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
  }));
}

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

// Initialize farmer cultivations if empty
if (!globalStore.cultivations.has("u-farmer-01") || globalStore.cultivations.get("u-farmer-01").length === 0) {
  const tomatoKnowledge = getCropKnowledge("Tomato");
  const coconutKnowledge = getCropKnowledge("Coconut");

  const tomatoStages = [
    { id: "st-tomato-01", stageOrder: 1, stageName: "Seed Sowing & Sapling Planting", duration: "Day 1-10", description: "Transplant healthy seedlings into prepared beds with organic compost.", instructions: "Maintain soil moisture and verify initial planting within 72 hours.", isCompleted: false },
    { id: "st-tomato-02", stageOrder: 2, stageName: "Vegetative Growth & Staking", duration: "Day 11-30", description: "Install bamboo stakes and perform side shoot pruning.", instructions: "Apply neem oil preventative spray against leaf miners.", isCompleted: false },
    { id: "st-tomato-03", stageOrder: 3, stageName: "Flowering & Fruit Setting", duration: "Day 31-55", description: "Flowering phase requiring consistent drip irrigation.", instructions: "Apply balanced micronutrient spray.", isCompleted: false },
    { id: "st-tomato-04", stageOrder: 4, stageName: "Fruit Maturation & Harvesting", duration: "Day 56-80", description: "Harvest firm red tomatoes during early morning.", instructions: "Sort by size and crate immediately.", isCompleted: false }
  ];

  const coconutStages = [
    { id: "st-01", stageOrder: 1, stageName: "Pit Preparation & Planting", duration: "Day 1-14", description: "Dig pits of 1m x 1m x 1m size and plant certified seedling.", instructions: "Fill with topsoil and compost up to 60cm.", isCompleted: true },
    { id: "st-02", stageOrder: 2, stageName: "Early Vegetative Establishment", duration: "Months 1-12", description: "Establish root system and crown fronds.", instructions: "Provide shade in summer and regular bi-weekly watering.", isCompleted: false },
    { id: "st-03", stageOrder: 3, stageName: "Crown Development & Trunking", duration: "Years 2-4", description: "Trunk formation and nutrient application.", instructions: "Apply balanced NPK + organic manure twice annually.", isCompleted: false },
    { id: "st-04", stageOrder: 4, stageName: "Flowering & Nut Bearing", duration: "Year 5 onwards", description: "Active yield and bunch formation.", instructions: "Regular bunch inspection and prophylactic pest control.", isCompleted: false }
  ];

  globalStore.cultivations.set("u-farmer-01", [
    {
      id: "cult-tomato-01",
      farmerId: "u-farmer-01",
      cropProfileId: "profile_tomato",
      cropName: "Tomato",
      region: "Palakkad Agricultural Belt",
      startDate: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), // 36h ago -> active 72h window
      status: "PLANTING_PENDING",
      currentStageId: "st-tomato-01",
      currentStage: "Stage 1: Seed Sowing & Sapling Planting",
      currentStageNumber: 1,
      totalStages: 4,
      progress: 10,
      weeklyPhotoStatus: "NOT DUE",
      healthStatus: "EXCELLENT",
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
      farmer: {
        id: "u-farmer-01",
        name: "Rajesh Kumar",
        email: "farmer@agri-nova.com",
        phone: "+91 98765 43210",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      },
      cropProfile: {
        id: "profile_tomato",
        name: "Tomato",
        category: tomatoKnowledge.category || "VEGETABLE",
        expectedYield: tomatoKnowledge.expectedYield || "25-30 Tons / Hectare",
        growingPeriod: tomatoKnowledge.growingPeriod || "75-90 Days",
        waterRequirement: 3.5,
        imageUrl: "/images/crops/tomato.jpg",
        cultivationGuide: {
          id: "guide-tomato",
          landPreparation: tomatoKnowledge.landPreparation,
          seedInformation: tomatoKnowledge.seedInformation,
          spacing: tomatoKnowledge.spacing,
          plantingMethod: tomatoKnowledge.plantingMethod,
          harvesting: tomatoKnowledge.harvesting,
          postHarvest: tomatoKnowledge.postHarvest,
          cultivationStages: tomatoStages,
          wateringSchedules: [
            { id: "ws-tom-1", frequency: "Every 2 days", method: "Drip Irrigation", waterAmount: "2-3 Litres / plant" }
          ],
          manureFertilizers: [
            { id: "mf-tom-1", name: "Vermicompost & Neem Cake", dosage: "500g / pit", applicationTime: "Basal dressing" }
          ],
          pestDiseases: [
            { id: "pd-tom-1", name: "Early Blight & Whitefly", symptoms: "Spotted foliage, leaf curling", treatment: "Spray 2% Neem oil emulsion" }
          ]
        }
      },
      stageSubmissions: [
        {
          id: "sub-tomato-01",
          cultivationId: "cult-tomato-01",
          stageId: "st-tomato-01",
          stageName: "Seed Sowing & Sapling Planting",
          imageUrl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800",
          farmerNotes: "Transplanted 450 hybrid tomato saplings. Drip line connected and soil well aerated.",
          status: "PENDING REVIEW",
          submittedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
          stage: {
            id: "st-tomato-01",
            stageOrder: 1,
            stageName: "Seed Sowing & Sapling Planting",
            description: "Transplant healthy seedlings into prepared beds with organic compost."
          }
        }
      ],
      weeklyPhotos: [],
      activities: [
        { id: "act-t1", activityName: "72-Hour Planting Evidence Submitted", activityType: "PLANTING", scheduledDate: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), isCompleted: true },
        { id: "act-t2", activityName: "Stage 2: Staking & Top Dressing", activityType: "STAGE_TRANSITION", scheduledDate: new Date(Date.now() + 10 * 86400000).toISOString(), isCompleted: false }
      ]
    },
    {
      id: "cult-coconut-01",
      farmerId: "u-farmer-01",
      cropProfileId: "profile_coconut",
      cropName: "Coconut",
      region: "Kottayam Green Belt",
      startDate: new Date(Date.now() - 14 * 86400000).toISOString(),
      status: "ACTIVE",
      currentStageId: "st-02",
      currentStage: "Stage 2: Early Vegetative Establishment",
      currentStageNumber: 2,
      totalStages: 4,
      progress: 35,
      weeklyPhotoStatus: "NOT DUE",
      healthStatus: "EXCELLENT",
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      farmer: {
        id: "u-farmer-01",
        name: "Rajesh Kumar",
        email: "farmer@agri-nova.com",
        phone: "+91 98765 43210",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      },
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
          cultivationStages: coconutStages,
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
          cultivationId: "cult-coconut-01",
          stageId: "st-01",
          stageName: "Pit Preparation & Planting",
          imageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600",
          farmerNotes: "Initial pit preparation photograph verified and approved.",
          status: "APPROVED",
          submittedAt: new Date(Date.now() - 13 * 86400000).toISOString(),
          adminComment: "Planting approved by Administrator. Stage 2 unlocked.",
          stage: { id: "st-01", stageOrder: 1, stageName: "Pit Preparation & Planting", description: "Dig pits of 1m x 1m x 1m size and plant certified seedling." }
        }
      ],
      weeklyPhotos: [],
      activities: [
        { id: "act-01", activityName: "Planting Pit Verification", scheduledDate: new Date(Date.now() - 13 * 86400000).toISOString(), isCompleted: true },
        { id: "act-02", activityName: "Week 1 Basin Irrigation", scheduledDate: new Date(Date.now() + 86400000).toISOString(), isCompleted: false }
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
    return globalStore.equipment.find((e: any) => e.id === id) || null;
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
    const eq = globalStore.equipment.find((e: any) => e.id === id && e.ownerId === ownerId);
    if (!eq) return null;
    Object.assign(eq, data);
    return eq;
  },

  deleteEquipment(id: string, ownerId: string) {
    const index = globalStore.equipment.findIndex((e: any) => e.id === id && e.ownerId === ownerId);
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
      list = list.filter((b: any) => b.equipment?.ownerId === ownerId);
    }
    if (farmerId) {
      list = list.filter((b: any) => b.farmerId === farmerId);
    }
    return list.map((b: any) => ({
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
    const booking = globalStore.equipmentBookings.find((b: any) => b.id === bookingId);
    if (booking) {
      booking.status = status;
      return booking;
    }
    return null;
  },

  // GOVERNMENT SCHEMES
  getSchemes(filter?: { category?: string; isActive?: boolean }) {
    let list = [...globalStore.schemes];
    if (filter?.category) list = list.filter((s: any) => s.category === filter.category);
    if (filter?.isActive !== undefined) list = list.filter((s: any) => s.isActive === filter.isActive);
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
    return globalStore.vetConsultations.filter((v: any) => v.farmerId === userId || v.vetId === userId);
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

  // REGIONAL LIVESTOCK & LIVESTOCK RECOMMENDATIONS
  getRegionalLivestock(district?: string): RegionalLivestockRecord[] {
    if (!district) return globalStore.regionalLivestock;
    const clean = district.trim().toLowerCase();
    const found = globalStore.regionalLivestock.filter((r: RegionalLivestockRecord) => 
      r.district.toLowerCase() === clean || 
      r.district.toLowerCase().includes(clean) || 
      clean.includes(r.district.toLowerCase())
    );
    return found.length > 0 ? found : globalStore.regionalLivestock;
  },

  getRegionalLivestockByDistrict(district: string): RegionalLivestockRecord | null {
    if (!district) return null;
    const clean = district.trim().toLowerCase();
    return globalStore.regionalLivestock.find((r: RegionalLivestockRecord) => 
      r.district.toLowerCase() === clean || 
      r.district.toLowerCase().includes(clean) || 
      clean.includes(r.district.toLowerCase())
    ) || null;
  },

  addRegionalLivestock(data: any): RegionalLivestockRecord {
    const newRecord: RegionalLivestockRecord = {
      id: `reg-${Date.now()}`,
      district: data.district,
      primaryLivestock: data.primaryLivestock,
      focusAreas: data.focusAreas,
      climateSuitability: data.climateSuitability || "Optimal tropical climate with regular veterinary care.",
      imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600"
    };
    globalStore.regionalLivestock.push(newRecord);
    return newRecord;
  },

  updateRegionalLivestock(id: string, data: any): RegionalLivestockRecord {
    const idClean = (id || "").toLowerCase();
    const distClean = (data.district || "").toLowerCase();
    let reg = globalStore.regionalLivestock.find((r: RegionalLivestockRecord) => 
      r.id === id || 
      (idClean && r.id.toLowerCase() === idClean) ||
      (idClean && r.district.toLowerCase() === idClean) ||
      (distClean && r.district.toLowerCase() === distClean)
    );
    if (!reg) {
      reg = {
        id: id || `reg-${Date.now()}`,
        district: data.district || "Kerala District",
        primaryLivestock: data.primaryLivestock || "Dairy Cattle & Goats",
        focusAreas: data.focusAreas || "Sustainable livestock development",
        climateSuitability: data.climateSuitability || "Optimal tropical climate with regular veterinary care.",
        imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600"
      };
      globalStore.regionalLivestock.push(reg);
    }
    Object.assign(reg, data);
    return reg;
  },

  deleteRegionalLivestock(id: string): boolean {
    const idClean = (id || "").toLowerCase();
    const idx = globalStore.regionalLivestock.findIndex((r: RegionalLivestockRecord) => 
      r.id === id || (idClean && r.id.toLowerCase() === idClean) || (idClean && r.district.toLowerCase() === idClean)
    );
    if (idx > -1) {
      globalStore.regionalLivestock.splice(idx, 1);
      return true;
    }
    return false;
  },

  getLivestockRecommendations(location?: string): LivestockRecommendationRecord[] {
    if (!location) return globalStore.livestockRecommendations;
    const clean = location.trim().toLowerCase();
    const filtered = globalStore.livestockRecommendations.filter((rec: LivestockRecommendationRecord) => {
      const loc = rec.location.toLowerCase();
      return loc.includes(clean) || 
        loc.includes("all") ||
        loc.includes("all regions") ||
        loc.includes("all kerala") ||
        (loc.includes("central kerala") && ["kottayam", "ernakulam", "alappuzha", "idukki", "thrissur"].some(d => clean.includes(d))) ||
        (loc.includes("malabar") && ["kozhikode", "kannur", "malappuram", "kasaragod", "wayanad"].some(d => clean.includes(d))) ||
        (loc.includes("north kerala") && ["kasaragod", "kannur"].some(d => clean.includes(d))) ||
        (loc.includes("south kerala") && ["thiruvananthapuram", "kollam", "pathanamthitta"].some(d => clean.includes(d))) ||
        (loc.includes("highland") && ["idukki", "wayanad"].some(d => clean.includes(d)));
    });
    return filtered.length > 0 ? filtered : globalStore.livestockRecommendations;
  },

  addLivestockRecommendation(data: any): LivestockRecommendationRecord {
    const newBreed: LivestockRecommendationRecord = {
      id: `rec-${Date.now()}`,
      breedName: data.breedName,
      expectedYield: data.expectedYield,
      fatContent: data.fatContent,
      maintenanceLevel: data.maintenanceLevel,
      location: data.location,
      imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500",
      category: data.category || "Cattle"
    };
    globalStore.livestockRecommendations.push(newBreed);
    return newBreed;
  },

  updateLivestockRecommendation(id: string, data: any): LivestockRecommendationRecord {
    const idClean = (id || "").toLowerCase();
    const nameClean = (data.breedName || "").toLowerCase();
    let breed = globalStore.livestockRecommendations.find((b: LivestockRecommendationRecord) => 
      b.id === id || 
      (idClean && b.id.toLowerCase() === idClean) ||
      (idClean && b.breedName.toLowerCase() === idClean) ||
      (nameClean && b.breedName.toLowerCase() === nameClean)
    );
    if (!breed) {
      breed = {
        id: id || `rec-${Date.now()}`,
        breedName: data.breedName || "Livestock Breed",
        expectedYield: data.expectedYield || "N/A",
        fatContent: data.fatContent || "N/A",
        maintenanceLevel: data.maintenanceLevel || "Medium",
        location: data.location || "All Kerala",
        category: data.category || "Cattle",
        imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500"
      };
      globalStore.livestockRecommendations.push(breed);
    }
    Object.assign(breed, data);
    return breed;
  },

  deleteLivestockRecommendation(id: string): boolean {
    const idClean = (id || "").toLowerCase();
    const idx = globalStore.livestockRecommendations.findIndex((b: LivestockRecommendationRecord) => 
      b.id === id || (idClean && b.id.toLowerCase() === idClean) || (idClean && b.breedName.toLowerCase() === idClean)
    );
    if (idx > -1) {
      globalStore.livestockRecommendations.splice(idx, 1);
      return true;
    }
    return false;
  },

  // DELIVERY TASKS
  getDeliveryTasks(driverId?: string) {
    if (!driverId) return globalStore.deliveryTasks;
    return globalStore.deliveryTasks.filter((t: any) => t.driverId === driverId && t.status !== "DELIVERED");
  },

  updateDeliveryTaskStatus(taskId: string, status: "PICKED_UP" | "IN_TRANSIT" | "DELIVERED") {
    const task = globalStore.deliveryTasks.find((t: any) => t.id === taskId);
    if (task) {
      task.status = status;
      return task;
    }
    return null;
  },

  // CULTIVATIONS
  getCultivations(farmerId: string) {
    const list = globalStore.cultivations.get(farmerId) || [];
    return list;
  },

  getAllCultivations() {
    const all: any[] = [];
    for (const [fId, list] of globalStore.cultivations.entries()) {
      const farmer = this.getUserById(fId);
      for (const cult of list) {
        if (!cult.farmer && farmer) {
          cult.farmer = {
            id: farmer.id,
            name: farmer.name,
            email: farmer.email,
            phone: farmer.phone,
            avatarUrl: farmer.avatarUrl
          };
        }
        all.push(cult);
      }
    }
    // Return newest first
    return all.sort((a, b) => new Date(b.startDate || b.createdAt || 0).getTime() - new Date(a.startDate || a.createdAt || 0).getTime());
  },

  getCultivationById(farmerId: string, id: string) {
    const list = this.getCultivations(farmerId);
    return list.find((c: any) => c.id === id) || null;
  },

  getCultivationByIdAny(id: string) {
    for (const list of globalStore.cultivations.values()) {
      const found = list.find((c: any) => c.id === id);
      if (found) return found;
    }
    return null;
  },

  startCultivation(farmerId: string, cropName: string, region: string) {
    const knowledge = getCropKnowledge(cropName);
    const existingList = this.getCultivations(farmerId);
    const farmer = this.getUserById(farmerId) || {
      id: farmerId,
      name: "Rajesh Kumar",
      email: "farmer@agri-nova.com",
      phone: "+91 98765 43210",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    };

    const stages = (knowledge.cultivationStages || []).map((s: any, idx: number) => ({
      id: `st-${cropName.toLowerCase().replace(/\s+/g, '_')}-${idx + 1}`,
      stageOrder: s.stageOrder || idx + 1,
      stageName: s.stageName || `Stage ${idx + 1}`,
      duration: `Day ${s.startDay || idx * 15 + 1}-${s.endDay || (idx + 1) * 20}`,
      description: s.description || "Care and monitoring phase",
      instructions: s.careInstructions || "Follow recommended cultivation protocols.",
      isCompleted: false
    }));

    const firstStage = stages[0] || {
      id: `st-${Date.now()}-1`,
      stageOrder: 1,
      stageName: "Stage 1: Seed Sowing & Sapling Planting",
      duration: "Day 1-14",
      description: "Initial planting and land preparation",
      instructions: "Upload photo proof within 72 hours of planting.",
      isCompleted: false
    };

    const newCult = {
      id: `cult-${Date.now()}`,
      farmerId,
      cropProfileId: `profile_${cropName.toLowerCase().replace(/\s+/g, '_')}`,
      cropName,
      region: region || "Kerala Farm Field",
      startDate: new Date().toISOString(),
      status: "PLANTING_PENDING",
      currentStageId: firstStage.id,
      currentStage: firstStage.stageName,
      currentStageNumber: 1,
      totalStages: Math.max(stages.length, 4),
      progress: 0,
      weeklyPhotoStatus: "NOT DUE",
      healthStatus: "EXCELLENT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      farmer: {
        id: farmer.id,
        name: farmer.name,
        email: farmer.email,
        phone: farmer.phone,
        avatarUrl: farmer.avatarUrl
      },
      cropProfile: {
        id: `profile_${cropName.toLowerCase().replace(/\s+/g, '_')}`,
        name: cropName,
        category: knowledge.category || "CROP",
        expectedYield: knowledge.expectedYield || "Standard Agricultural Yield",
        growingPeriod: knowledge.growingPeriod || "Seasonal",
        waterRequirement: typeof knowledge.waterRequirement === "number" ? knowledge.waterRequirement : 3.5,
        imageUrl: `/images/crops/${cropName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        cultivationGuide: {
          id: `guide-${cropName.toLowerCase().replace(/\s+/g, '-')}`,
          landPreparation: knowledge.landPreparation || "",
          seedInformation: knowledge.seedInformation || "",
          spacing: knowledge.spacing || "",
          plantingMethod: knowledge.plantingMethod || "",
          harvesting: knowledge.harvesting || "",
          postHarvest: knowledge.postHarvest || "",
          cultivationStages: stages.length > 0 ? stages : [firstStage],
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
      stageSubmissions: [] as any[],
      weeklyPhotos: [] as any[],
      activities: [
        { id: `act-${Date.now()}-1`, activityName: "72-Hour Planting Photo Evidence", scheduledDate: new Date().toISOString(), isCompleted: false },
        { id: `act-${Date.now()}-2`, activityName: "First Scheduled Irrigation", scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString(), isCompleted: false }
      ]
    };

    // Replace if existing for same crop, or unshift
    const filtered = existingList.filter((c: any) => c.cropName !== cropName);
    filtered.unshift(newCult);
    globalStore.cultivations.set(farmerId, filtered);
    return newCult;
  },

  submitStageEvidence(farmerId: string, cultivationId: string, stageId: string, imageUrl: string, notes: string) {
    const list = this.getCultivations(farmerId);
    let cult = list.find((c: any) => c.id === cultivationId);
    if (!cult) {
      cult = this.getCultivationByIdAny(cultivationId);
    }
    if (!cult) return null;

    const stages = cult.cropProfile?.cultivationGuide?.cultivationStages || [];
    const stageObj = stages.find((s: any) => s.id === stageId || s.stageOrder === 1) || {
      id: stageId,
      stageOrder: 1,
      stageName: "Seed Sowing & Planting",
      description: "Planting proof submitted by farmer"
    };

    const submission = {
      id: `sub-${Date.now()}`,
      cultivationId,
      stageId: stageObj.id,
      stageName: stageObj.stageName,
      imageUrl,
      farmerNotes: notes,
      status: "PENDING REVIEW",
      submittedAt: new Date().toISOString(),
      stage: stageObj,
      cultivation: {
        id: cult.id,
        status: cult.status,
        cropProfile: cult.cropProfile,
        farmer: cult.farmer
      }
    };

    cult.stageSubmissions = [submission, ...(cult.stageSubmissions || [])];
    cult.updatedAt = new Date().toISOString();
    return submission;
  },

  submitWeeklyPhoto(farmerId: string, cultivationId: string, weekNumber: number, imageUrl: string, notes: string) {
    const list = this.getCultivations(farmerId);
    let cult = list.find((c: any) => c.id === cultivationId);
    if (!cult) {
      cult = this.getCultivationByIdAny(cultivationId);
    }
    if (!cult) return null;

    const weekly = {
      id: `wk-${Date.now()}`,
      cultivationId,
      weekNumber,
      imageUrl,
      farmerNotes: notes,
      status: "PENDING REVIEW",
      submittedAt: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      cultivation: {
        id: cult.id,
        cropProfile: cult.cropProfile,
        farmer: cult.farmer
      }
    };

    cult.weeklyPhotos = [weekly, ...(cult.weeklyPhotos || [])];
    cult.weeklyPhotoStatus = "PENDING REVIEW";
    cult.updatedAt = new Date().toISOString();
    return weekly;
  },

  getPendingPlantingCultivations() {
    return this.getAllCultivations().filter((c: any) => c.status === "PLANTING_PENDING");
  },

  getPendingStageSubmissions() {
    const submissions: any[] = [];
    for (const cult of this.getAllCultivations()) {
      for (const s of cult.stageSubmissions || []) {
        if (s.status === "PENDING REVIEW" || s.status === "RESUBMISSION REQUIRED") {
          submissions.push({
            ...s,
            cultivation: {
              id: cult.id,
              status: cult.status,
              cropProfile: cult.cropProfile,
              farmer: cult.farmer
            }
          });
        }
      }
    }
    return submissions.sort((a, b) => new Date(a.submittedAt || 0).getTime() - new Date(b.submittedAt || 0).getTime());
  },

  getPendingWeeklyRecords() {
    const records: any[] = [];
    for (const cult of this.getAllCultivations()) {
      for (const w of cult.weeklyPhotos || []) {
        if (w.status === "PENDING REVIEW" || w.status === "RESUBMISSION REQUIRED") {
          records.push({
            ...w,
            cultivation: {
              id: cult.id,
              status: cult.status,
              cropProfile: cult.cropProfile,
              farmer: cult.farmer
            }
          });
        }
      }
    }
    return records.sort((a, b) => new Date(a.submittedAt || 0).getTime() - new Date(b.submittedAt || 0).getTime());
  },

  getCultivationStats() {
    const all = this.getAllCultivations();
    const activeCount = all.filter((c: any) => c.status === "ACTIVE").length;
    const plantingPendingCount = all.filter((c: any) => c.status === "PLANTING_PENDING").length;
    const completedCount = all.filter((c: any) => c.status === "COMPLETED").length;
    const pendingStagesList = this.getPendingStageSubmissions();
    const pendingWeeklyList = this.getPendingWeeklyRecords();

    const pendingPlantingSubmissions = pendingStagesList.filter(
      (s: any) => s.stage?.stageOrder === 1 || s.cultivation?.status === "PLANTING_PENDING"
    ).length;
    const pendingStages = Math.max(0, pendingStagesList.length - pendingPlantingSubmissions);
    const pendingPlanting = Math.max(plantingPendingCount, pendingPlantingSubmissions);
    const activeCultivations = activeCount + plantingPendingCount;

    return {
      totalCultivations: all.length,
      activeCultivations,
      plantingPendingCount,
      completedCultivations: completedCount,
      pendingPlanting,
      pendingPlantingSubmissions,
      pendingStages,
      pendingWeekly: pendingWeeklyList.length,
      resubmissions: 0
    };
  },

  approvePlanting(cultivationId: string, adminComment?: string) {
    const cult = this.getCultivationByIdAny(cultivationId);
    if (!cult) return null;

    const stages = cult.cropProfile?.cultivationGuide?.cultivationStages || [];
    const stage2 = stages[1];

    cult.status = stage2 ? "ACTIVE" : "COMPLETED";
    cult.currentStageId = stage2?.id || cult.currentStageId;
    cult.progress = stages.length > 0 ? Math.round((1 / stages.length) * 100) : 25;
    cult.updatedAt = new Date().toISOString();

    if (cult.stageSubmissions && cult.stageSubmissions.length > 0) {
      for (const s of cult.stageSubmissions) {
        if (s.stage?.stageOrder === 1 || s.stageId === stages[0]?.id) {
          s.status = "APPROVED";
          s.adminComment = adminComment || "Planting approved by Administrator";
          s.reviewedAt = new Date().toISOString();
        }
      }
    }

    return { success: true, updated: cult };
  },

  reviewStageSubmission(submissionId: string, action: string, adminComment?: string) {
    for (const cult of this.getAllCultivations()) {
      for (const s of cult.stageSubmissions || []) {
        if (s.id === submissionId) {
          s.status = action;
          s.adminComment = adminComment || "";
          s.reviewedAt = new Date().toISOString();

          if (action === "APPROVED") {
            const stages = cult.cropProfile?.cultivationGuide?.cultivationStages || [];
            const currentIdx = stages.findIndex((st: any) => st.id === s.stageId);
            const nextStage = stages[currentIdx + 1];
            cult.currentStageId = nextStage?.id || s.stageId;
            cult.progress = Math.round(((currentIdx + 1) / Math.max(stages.length, 1)) * 100);
            cult.status = nextStage ? "ACTIVE" : "COMPLETED";
            cult.updatedAt = new Date().toISOString();
          }
          return { success: true, updated: s };
        }
      }
    }
    return null;
  },

  reviewWeeklyRecord(recordId: string, action: string, adminComment?: string) {
    for (const cult of this.getAllCultivations()) {
      for (const w of cult.weeklyPhotos || []) {
        if (w.id === recordId) {
          w.status = action;
          w.adminComment = adminComment || "";
          w.reviewedAt = new Date().toISOString();
          cult.weeklyPhotoStatus = action;
          cult.updatedAt = new Date().toISOString();
          return { success: true, updated: w };
        }
      }
    }
    return null;
  },

  deleteCultivation(farmerId: string, cultivationId: string) {
    const list = this.getCultivations(farmerId);
    const filtered = list.filter((c: any) => c.id !== cultivationId);
    globalStore.cultivations.set(farmerId, filtered);
    return true;
  },

  // ZONES & CROPS
  getAgroClimaticZones() {
    return KERALA_AGRO_CLIMATIC_ZONES;
  },

  getCropProfiles() {
    if (!globalStore.cropProfiles || globalStore.cropProfiles.length === 0) {
      globalStore.cropProfiles = CROP_PROFILES_ARRAY.map(c => ({ ...c }));
    }
    return globalStore.cropProfiles;
  },

  getCropProfileByName(name: string) {
    if (!name) return null;
    const clean = name.trim().toLowerCase();
    const crops = this.getCropProfiles();

    // 1. Exact id or name match
    let match = crops.find((c: any) => 
      (c.name || '').toLowerCase() === clean || (c.id || '').toLowerCase() === clean
    );
    if (match) return match;

    // 2. Common aliases & partial matching
    const aliases: Record<string, string[]> = {
      "pepper": ["black pepper"],
      "black pepper": ["pepper"],
      "paddy": ["rice"],
      "rice": ["paddy"],
      "tapioca": ["cassava"],
      "cassava": ["tapioca"],
      "cardamom": ["green cardamom", "small cardamom"],
      "plantain": ["banana"],
      "banana": ["plantain"],
      "areca": ["arecanut"],
      "arecanut": ["areca"]
    };

    const cleanAliases = aliases[clean] || [];
    match = crops.find((c: any) => {
      const cName = (c.name || '').toLowerCase();
      return cleanAliases.includes(cName) || cName.includes(clean) || clean.includes(cName);
    });

    return match || null;
  },

  updateCropProfile(idOrName: string, data: any) {
    const clean = (idOrName || '').trim().toLowerCase();
    const nameClean = (data?.name || '').trim().toLowerCase();
    const crops = this.getCropProfiles();

    let existing = crops.find((c: any) => 
      (c.id && c.id.toLowerCase() === clean) ||
      (c.name && c.name.toLowerCase() === clean) ||
      (nameClean && c.name && c.name.toLowerCase() === nameClean)
    );

    // If not found directly, check aliases
    if (!existing) {
      existing = this.getCropProfileByName(idOrName) || (nameClean ? this.getCropProfileByName(nameClean) : null);
    }

    if (!existing) {
      existing = {
        id: idOrName || `crop-${Date.now()}`,
        name: data.name || "Crop",
        category: data.category || "General Crop",
        expectedYield: data.expectedYield || "Standard Yield",
        growingPeriod: data.growingPeriod || "Seasonal",
        waterRequirement: data.waterRequirement || 3,
        fertilizer: data.fertilizer || "Organic Compost",
        pesticide: data.pesticide || "Neem Oil",
        imageUrl: data.imageUrl || `/images/crops/${(data.name || 'crop').toLowerCase().replace(/\s+/g, '-')}.jpg`,
        ...data
      };
      crops.push(existing);
    } else {
      Object.assign(existing, data);
    }

    return existing;
  },

  addCropProfile(data: any) {
    if (!globalStore.cropProfiles) {
      globalStore.cropProfiles = [];
    }
    const clean = (data.name || '').trim().toLowerCase();
    const existing = globalStore.cropProfiles.find((c: any) => 
      (c.name && c.name.toLowerCase() === clean) ||
      (data.id && c.id && c.id.toLowerCase() === (data.id || '').toLowerCase())
    );
    if (existing) {
      Object.assign(existing, data);
      return existing;
    }
    const newCrop = {
      id: data.id || `crop-${Date.now()}`,
      name: data.name,
      category: data.category || "General Crop",
      expectedYield: data.expectedYield || "Standard Yield",
      growingPeriod: data.growingPeriod || "Seasonal",
      waterRequirement: data.waterRequirement || 3,
      fertilizer: data.fertilizer || "Organic Compost",
      pesticide: data.pesticide || "Neem Oil",
      imageUrl: data.imageUrl || `/images/crops/${(data.name || 'crop').toLowerCase().replace(/\s+/g, '-')}.jpg`,
      ...data
    };
    globalStore.cropProfiles.push(newCrop);
    return newCrop;
  },

  deleteCropProfile(idOrName: string) {
    if (!globalStore.cropProfiles) return false;
    const clean = (idOrName || '').trim().toLowerCase();
    const idx = globalStore.cropProfiles.findIndex((c: any) => 
      (c.id && c.id.toLowerCase() === clean) ||
      (c.name && c.name.toLowerCase() === clean)
    );
    if (idx > -1) {
      globalStore.cropProfiles.splice(idx, 1);
      return true;
    }
    return false;
  }
};
