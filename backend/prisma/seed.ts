import { productImages } from "../../src/lib/productImages";
export const mockSeedData = {
  users: [
    {
      id: "u-farmer-01",
      email: "farmer@agri-nova.com",
      name: "Rajesh Kumar",
      role: "FARMER",
      phone: "+91 98765 43210",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      kycStatus: "VERIFIED"
    },
    {
      id: "u-buyer-01",
      email: "buyer@agri-nova.com",
      name: "FreshBasket Supermarkets",
      role: "BUYER",
      phone: "+91 98123 45678",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      kycStatus: "VERIFIED"
    },
    {
      id: "u-equipment-01",
      email: "equipment@agri-nova.com",
      name: "Kisan Agro Rentals",
      role: "EQUIPMENT_OWNER",
      phone: "+91 97111 22334",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      kycStatus: "VERIFIED"
    },
    {
      id: "u-vet-01",
      email: "vet@agri-nova.com",
      name: "Dr. Ananya Sharma, DVM",
      role: "VETERINARY_EXPERT",
      phone: "+91 99887 76655",
      avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150",
      kycStatus: "VERIFIED"
    },
    {
      id: "u-delivery-01",
      email: "delivery@agri-nova.com",
      name: "AgriExpress Logistics",
      role: "DELIVERY_PARTNER",
      phone: "+91 98989 89898",
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
      kycStatus: "VERIFIED"
    },
    {
      id: "u-admin-01",
      email: "admin@agri-nova.com",
      name: "Enterprise Admin",
      role: "ADMIN",
      phone: "+91 90000 00001",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      kycStatus: "VERIFIED"
    }
  ],

  products: [
    // 1. Fresh Vegetables
    {
      id: "prod-01",
      sellerId: "u-farmer-01",
      title: "Tomato",
      description: "Farm-fresh greenhouse ripe tomatoes grown without synthetic pesticides.",
      category: "Fresh Vegetables",
      price: 45.0,
      unit: "kg",
      stockQuantity: 500,
      imageUrl: productImages.tomato,
      rating: 4.9,
      localName: "Thakkali",
      location: "Kottayam"
    },
    {
      id: "prod-veg-02",
      sellerId: "u-farmer-01",
      title: "Bitter Gourd",
      description: "Crisp and bitter, locally grown organic bitter gourd rich in nutrients.",
      category: "Fresh Vegetables",
      price: 60.0,
      unit: "kg",
      stockQuantity: 300,
      imageUrl: productImages.bitterGourd,
      rating: 4.8,
      localName: "Pavakka",
      location: "Palakkad"
    },
    {
      id: "prod-veg-03",
      sellerId: "u-farmer-01",
      title: "Okra / Lady's Finger",
      description: "Tender green okra, perfect for traditional Kerala sambar and mezhukkupuratti.",
      category: "Fresh Vegetables",
      price: 40.0,
      unit: "kg",
      stockQuantity: 400,
      imageUrl: productImages.okra,
      rating: 4.7,
      localName: "Vendakka",
      location: "Thrissur"
    },
    {
      id: "prod-veg-04",
      sellerId: "u-farmer-01",
      title: "Ash Gourd",
      description: "Traditional ash gourd, widely used in Kerala curries like Olan.",
      category: "Fresh Vegetables",
      price: 35.0,
      unit: "kg",
      stockQuantity: 250,
      imageUrl: productImages.ashGourd,
      rating: 4.6,
      localName: "Kumbalanga",
      location: "Alappuzha"
    },
    {
      id: "prod-veg-05",
      sellerId: "u-farmer-01",
      title: "Snake Gourd",
      description: "Freshly harvested organic snake gourd, crunchy and tender.",
      category: "Fresh Vegetables",
      price: 30.0,
      unit: "kg",
      stockQuantity: 200,
      imageUrl: productImages.snakeGourd,
      rating: 4.5,
      localName: "Padavalanga",
      location: "Ernakulam"
    },
    {
      id: "prod-veg-06",
      sellerId: "u-farmer-01",
      title: "Ivy Gourd",
      description: "Crisp organic ivy gourd, excellent for stir-fry.",
      category: "Fresh Vegetables",
      price: 45.0,
      unit: "kg",
      stockQuantity: 150,
      imageUrl: productImages.ivyGourd,
      rating: 4.7,
      localName: "Kovakka",
      location: "Kollam"
    },
    {
      id: "prod-veg-07",
      sellerId: "u-farmer-01",
      title: "Drumstick",
      description: "Aromatic and nutrient-dense fresh green drumstick pods.",
      category: "Fresh Vegetables",
      price: 70.0,
      unit: "kg",
      stockQuantity: 100,
      imageUrl: productImages.drumstick,
      rating: 4.8,
      localName: "Muringa",
      location: "Thrissur"
    },
    {
      id: "prod-veg-08",
      sellerId: "u-farmer-01",
      title: "Brinjal / Eggplant",
      description: "Tender purple and striped local brinjals, perfect for curries and roasting.",
      category: "Fresh Vegetables",
      price: 45.0,
      unit: "kg",
      stockQuantity: 350,
      imageUrl: productImages.brinjal,
      rating: 4.8,
      localName: "Vazhuthananga",
      location: "Kottayam"
    },
    {
      id: "prod-veg-09",
      sellerId: "u-farmer-01",
      title: "Green Chilli",
      description: "Freshly picked hot green chillies, essential for Kerala spice bases.",
      category: "Fresh Vegetables",
      price: 50.0,
      unit: "kg",
      stockQuantity: 200,
      imageUrl: productImages.greenChilli,
      rating: 4.7,
      localName: "Pacha Mulaku",
      location: "Palakkad"
    },
    {
      id: "prod-veg-10",
      sellerId: "u-farmer-01",
      title: "Red Chilli",
      description: "Sun-dried high-heat red chillies for rich colour and hot seasoning.",
      category: "Fresh Vegetables",
      price: 120.0,
      unit: "kg",
      stockQuantity: 150,
      imageUrl: productImages.redChilli,
      rating: 4.8,
      localName: "Unakka Mulaku",
      location: "Thrissur"
    },
    {
      id: "prod-veg-11",
      sellerId: "u-farmer-01",
      title: "Cucumber",
      description: "Crisp and cooling organic cucumbers, perfect for salads and raita.",
      category: "Fresh Vegetables",
      price: 35.0,
      unit: "kg",
      stockQuantity: 300,
      imageUrl: productImages.cucumber,
      rating: 4.7,
      localName: "Vellarikka",
      location: "Alappuzha"
    },
    {
      id: "prod-veg-12",
      sellerId: "u-farmer-01",
      title: "Bottle Gourd",
      description: "Tender and mild organic bottle gourd, highly digestible and hydrating.",
      category: "Fresh Vegetables",
      price: 30.0,
      unit: "kg",
      stockQuantity: 250,
      imageUrl: productImages.bottleGourd,
      rating: 4.6,
      localName: "Churakka",
      location: "Pathanamthitta"
    },
    {
      id: "prod-veg-13",
      sellerId: "u-farmer-01",
      title: "Ridge Gourd",
      description: "Freshly harvested organic ridge gourd, sweet and high in dietary fiber.",
      category: "Fresh Vegetables",
      price: 48.0,
      unit: "kg",
      stockQuantity: 180,
      imageUrl: productImages.ridgeGourd,
      rating: 4.7,
      localName: "Peechinga",
      location: "Kollam"
    },

    // 2. Fruits
    {
      id: "prod-fruit-01",
      sellerId: "u-farmer-01",
      title: "Premium Nendran Banana",
      description: "Large, rich, sweet local bananas, ideal for making banana chips or steamed snacks.",
      category: "Fruits",
      price: 55.0,
      unit: "kg",
      stockQuantity: 800,
      imageUrl: productImages.nendranBanana,
      rating: 4.9,
      localName: "Nendran Vazhapazham",
      location: "Wayanad"
    },
    {
      id: "prod-fruit-02",
      sellerId: "u-farmer-01",
      title: "Ripe Jackfruit",
      description: "Sweet, golden-fleshed ripe jackfruit direct from local home orchards.",
      category: "Fruits",
      price: 150.0,
      unit: "Piece",
      stockQuantity: 50,
      imageUrl: productImages.jackfruit,
      rating: 5.0,
      localName: "Chakka",
      location: "Idukki"
    },
    {
      id: "prod-fruit-03",
      sellerId: "u-farmer-01",
      title: "Vazhakulam Pineapple",
      description: "Sweet, juicy GI-tagged Vazhakulam pineapple harvested fresh.",
      category: "Fruits",
      price: 75.0,
      unit: "kg",
      stockQuantity: 600,
      imageUrl: productImages.pineapple,
      rating: 4.9,
      localName: "Kaitha Chakka",
      location: "Ernakulam"
    },

    // 3. Vegetable Seeds
    {
      id: "prod-vseeds-01",
      sellerId: "u-equipment-01",
      title: "Hybrid Red Amaranth Seeds",
      description: "High germination rate seeds for nutritious Kerala red cheera.",
      category: "Vegetable Seeds",
      price: 30.0,
      unit: "Pack",
      stockQuantity: 500,
      imageUrl: productImages.redAmaranthSeeds,
      rating: 4.8,
      localName: "Cheera Vithu",
      location: "Kollam"
    },

    // 4. Fruit Seeds
    {
      id: "prod-fseeds-01",
      sellerId: "u-equipment-01",
      title: "Organic Papaya Seeds (Red Lady)",
      description: "Premium seeds for high-yield sweet Red Lady papaya.",
      category: "Fruit Seeds",
      price: 120.0,
      unit: "Pack",
      stockQuantity: 150,
      imageUrl: productImages.papayaSeeds,
      rating: 4.7,
      location: "Thrissur"
    },

    // 5. Seedlings & Saplings
    {
      id: "prod-sap-01",
      sellerId: "u-equipment-01",
      title: "Grafted Mango Sapling (Alphonso)",
      description: "Healthy grafted sapling ready for planting in farm soils.",
      category: "Seedlings & Saplings",
      price: 180.0,
      unit: "Plant",
      stockQuantity: 200,
      imageUrl: productImages.mangoSapling,
      rating: 4.8,
      location: "Kannur"
    },
    {
      id: "prod-sap-02",
      sellerId: "u-equipment-01",
      title: "Nendran Banana Suckers",
      description: "High-grade disease-free banana suckers for direct planting.",
      category: "Seedlings & Saplings",
      price: 45.0,
      unit: "Piece",
      stockQuantity: 400,
      imageUrl: productImages.bananaSuckers,
      rating: 4.6,
      localName: "Nendran Vazha Kanjunnu",
      location: "Malappuram"
    },

    // 6. Rice & Grains
    {
      id: "prod-02",
      sellerId: "u-farmer-01",
      title: "Premium Palakkadan Matta Rice",
      description: "Nutritious red Matta rice parboiled to perfection. Traditional Kerala staple.",
      category: "Rice & Grains",
      price: 60.0,
      unit: "kg",
      stockQuantity: 2000,
      imageUrl: productImages.mattaRice,
      rating: 4.9,
      localName: "Matta Ari",
      location: "Palakkad"
    },

    // 7. Pulses
    {
      id: "prod-pulse-01",
      sellerId: "u-farmer-01",
      title: "Organic Green Gram",
      description: "Whole green gram harvested from pesticide-free fields.",
      category: "Pulses",
      price: 110.0,
      unit: "kg",
      stockQuantity: 800,
      imageUrl: productImages.greenGram,
      rating: 4.7,
      localName: "Cherupayar",
      location: "Palakkad"
    },

    // 8. Tubers
    {
      id: "prod-tuber-01",
      sellerId: "u-farmer-01",
      title: "Fresh Kerala Tapioca",
      description: "Starchy, freshly dug tapioca roots. Cook immediately for authentic taste.",
      category: "Tubers",
      price: 30.0,
      unit: "kg",
      stockQuantity: 1200,
      imageUrl: productImages.tapioca,
      rating: 4.9,
      localName: "Kappa / Maracheeni",
      location: "Kollam"
    },

    // 9. Kerala Spices
    {
      id: "prod-spice-01",
      sellerId: "u-farmer-01",
      title: "Wayanad Black Pepper",
      description: "Pungent and highly aromatic whole dried black pepper from hill regions.",
      category: "Kerala Spices",
      price: 640.0,
      unit: "kg",
      stockQuantity: 400,
      imageUrl: productImages.blackPepper,
      rating: 5.0,
      localName: "Kurumulaku",
      location: "Wayanad"
    },
    {
      id: "prod-spice-02",
      sellerId: "u-farmer-01",
      title: "Idukki Green Cardamom",
      description: "Extra large 8mm bold green cardamom pods with intense aroma.",
      category: "Kerala Spices",
      price: 1900.0,
      unit: "kg",
      stockQuantity: 150,
      imageUrl: productImages.cardamom,
      rating: 4.9,
      localName: "Elakkay",
      location: "Idukki"
    },

    // 10. Plantation Products
    {
      id: "prod-plant-01",
      sellerId: "u-farmer-01",
      title: "Natural Rubber Sheets",
      description: "Ribbed smoked rubber sheets of premium elasticity and texture.",
      category: "Plantation Products",
      price: 175.0,
      unit: "kg",
      stockQuantity: 3000,
      imageUrl: productImages.rubberSheets,
      rating: 4.8,
      location: "Kottayam"
    },

    // 11. Coconut Products
    {
      id: "prod-coco-01",
      sellerId: "u-farmer-01",
      title: "Dehusked Fresh Coconut",
      description: "Medium-sized fully mature fresh coconuts from organic groves.",
      category: "Coconut Products",
      price: 24.0,
      unit: "Piece",
      stockQuantity: 1500,
      imageUrl: productImages.freshCoconut,
      rating: 4.8,
      localName: "Thenga",
      location: "Kozhikode"
    },
    {
      id: "prod-coco-02",
      sellerId: "u-farmer-01",
      title: "Cold-Pressed Coconut Oil",
      description: "100% pure edible sulfur-free coconut oil made from sun-dried copra.",
      category: "Coconut Products",
      price: 220.0,
      unit: "Litre",
      stockQuantity: 500,
      imageUrl: productImages.coconutOil,
      rating: 4.9,
      localName: "Velichenna",
      location: "Kozhikode"
    },

    // 12. Organic Farming
    {
      id: "prod-org-01",
      sellerId: "u-equipment-01",
      title: "Neem Oil Biopesticide",
      description: "Cold-pressed pure neem oil, natural repellent for plant bugs.",
      category: "Organic Farming",
      price: 180.0,
      unit: "Bottle (500ml)",
      stockQuantity: 250,
      imageUrl: productImages.neemOil,
      rating: 4.7,
      location: "Thrissur"
    },

    // 13. Fertilizers & Manure
    {
      id: "prod-fert-01",
      sellerId: "u-equipment-01",
      title: "Decomposed Cow Dung Manure",
      description: "Fully sun-dried decomposed powdered cow manure ready for soil mixing.",
      category: "Fertilizers & Manure",
      price: 18.0,
      unit: "kg",
      stockQuantity: 5000,
      imageUrl: productImages.cowDungManure,
      rating: 4.8,
      location: "Palakkad"
    },

    // 14. Biofertilizers & Biopesticides
    {
      id: "prod-bio-01",
      sellerId: "u-equipment-01",
      title: "Pseudomonas Fluorescens Bio-control",
      description: "Biological fungicide powder to protect roots from fungal rot diseases.",
      category: "Biofertilizers & Biopesticides",
      price: 95.0,
      unit: "Pack (500g)",
      stockQuantity: 300,
      imageUrl: productImages.pseudomonas,
      rating: 4.9,
      location: "Ernakulam"
    },

    // 15. Farming Tools
    {
      id: "prod-tools-01",
      sellerId: "u-equipment-01",
      title: "Ergonomic Hand Pruning Shears",
      description: "Heavy-duty steel garden secateurs for sapling pruning.",
      category: "Farming Tools",
      price: 299.0,
      unit: "Piece",
      stockQuantity: 100,
      imageUrl: productImages.pruningShears,
      rating: 4.6,
      location: "Thrissur"
    },

    // 16. Nursery Supplies
    {
      id: "prod-nur-01",
      sellerId: "u-equipment-01",
      title: "UV-Stabilized Grow Bags",
      description: "Thick plastic grow bags suitable for terrace vegetable gardens.",
      category: "Nursery Supplies",
      price: 15.0,
      unit: "Piece",
      stockQuantity: 2000,
      imageUrl: productImages.growBags,
      rating: 4.7,
      location: "Ernakulam"
    },

    // 17. Cattle Feed
    {
      id: "prod-cfeed-01",
      sellerId: "u-equipment-01",
      title: "Premium Dairy Cattle Feed Pellets",
      description: "Rich protein cattle feed pellets designed to boost milk yield.",
      category: "Cattle Feed",
      price: 1300.0,
      unit: "50kg Bag",
      stockQuantity: 120,
      imageUrl: productImages.cattleFeed,
      rating: 4.8,
      location: "Thrissur"
    },

    // 18. Goat Feed
    {
      id: "prod-gfeed-01",
      sellerId: "u-equipment-01",
      title: "Balanced Goat & Sheep Feed Mix",
      description: "High fiber cereal blend with mineral mixture for healthy goats.",
      category: "Goat Feed",
      price: 1100.0,
      unit: "40kg Bag",
      stockQuantity: 80,
      imageUrl: productImages.goatFeed,
      rating: 4.7,
      location: "Kollam"
    },

    // 19. Poultry Feed
    {
      id: "prod-pfeed-01",
      sellerId: "u-equipment-01",
      title: "High-Calcite Layer Chicken Feed",
      description: "Special calcium feed formulation to reinforce eggshell hardness.",
      category: "Poultry Feed",
      price: 1450.0,
      unit: "50kg Bag",
      stockQuantity: 150,
      imageUrl: productImages.poultryFeed,
      rating: 4.8,
      location: "Thiruvananthapuram"
    },

    // 20. Pig Feed
    {
      id: "prod-pigfeed-01",
      sellerId: "u-equipment-01",
      title: "Pig Grower Starter Feed Pellets",
      description: "High digestible protein pellets for rapid growth acceleration in piglets.",
      category: "Pig Feed",
      price: 1650.0,
      unit: "50kg Bag",
      stockQuantity: 60,
      imageUrl: productImages.pigFeed,
      rating: 4.6,
      location: "Thrissur"
    },

    // 21. Fish Feed
    {
      id: "prod-fishfeed-01",
      sellerId: "u-equipment-01",
      title: "Floating Aquaculture Fish Feed Pellets",
      description: "Micro pellets loaded with fish meal proteins for fast fingerling growth.",
      category: "Fish Feed",
      price: 2150.0,
      unit: "35kg Bag",
      stockQuantity: 200,
      imageUrl: productImages.fishFeed,
      rating: 4.9,
      location: "Alappuzha"
    },

    // 22. Dairy Products
    {
      id: "prod-03",
      sellerId: "u-farmer-01",
      title: "Pure Desi Cow Milk (A2 Dairy)",
      description: "Fresh daily unpasteurized pure A2 cow milk from grass-fed cows.",
      category: "Dairy Products",
      price: 65.0,
      unit: "Litre",
      stockQuantity: 150,
      imageUrl: productImages.cowMilk,
      rating: 5.0,
      location: "Thrissur"
    },

    // 23. Poultry Products
    {
      id: "prod-poultry-01",
      sellerId: "u-farmer-01",
      title: "Country Chicken Eggs",
      description: "Nutritious pasture-raised free range country chicken eggs.",
      category: "Poultry Products",
      price: 8.0,
      unit: "Piece",
      stockQuantity: 1000,
      imageUrl: productImages.chickenEggs,
      rating: 4.9,
      localName: "Nadan Muttah",
      location: "Kottayam"
    },

    // 24. Honey & Beekeeping
    {
      id: "prod-honey-01",
      sellerId: "u-farmer-01",
      title: "Raw Forest Honey",
      description: "Unprocessed wild multi-floral forest honey sourced from Idukki woods.",
      category: "Honey & Beekeeping",
      price: 480.0,
      unit: "kg",
      stockQuantity: 300,
      imageUrl: productImages.rawHoney,
      rating: 4.9,
      localName: "Nadan Then",
      location: "Idukki"
    },

    // 25. Fish & Aquaculture
    {
      id: "prod-fish-01",
      sellerId: "u-farmer-01",
      title: "Karimeen / Pearlspot Fish (Live)",
      description: "Live caught pearlspot fish from brackish Vembanad lake water.",
      category: "Fish & Aquaculture",
      price: 380.0,
      unit: "kg",
      stockQuantity: 80,
      imageUrl: productImages.pearlspotFish,
      rating: 4.9,
      localName: "Karimeen",
      location: "Alappuzha"
    },
    {
      id: "prod-fish-02",
      sellerId: "u-farmer-01",
      title: "Karimeen Fingerlings",
      description: "Pearlspot fingerlings for freshwater pond culture stocking.",
      category: "Fish & Aquaculture",
      price: 15.0,
      unit: "Piece",
      stockQuantity: 5000,
      imageUrl: productImages.fishFingerlings,
      rating: 4.8,
      localName: "Karimeen Kunjungal",
      location: "Kottayam"
    },

    // 26. Livestock
    {
      id: "prod-live-01",
      sellerId: "u-farmer-01",
      title: "Purebred Malabari Goat",
      description: "Healthy Malabari breed female goat, excellent for farm breeding.",
      category: "Livestock",
      price: 7800.0,
      unit: "Goat",
      stockQuantity: 5,
      imageUrl: productImages.malabariGoat,
      rating: 5.0,
      localName: "Malabari Aad",
      location: "Kozhikode",
      breed: "Malabari",
      age: "14 Months",
      sex: "Female",
      healthStatus: "Fully Vaccinated, Healthy"
    },

    // 27. Traditional Kerala Agricultural Products
    {
      id: "prod-trad-01",
      sellerId: "u-farmer-01",
      title: "Dried Tamarind",
      description: "Salt-cured dried deseeded sour tamarind, essential spice ingredient.",
      category: "Traditional Kerala Agricultural Products",
      price: 140.0,
      unit: "kg",
      stockQuantity: 400,
      imageUrl: productImages.driedTamarind,
      rating: 4.8,
      localName: "Valan Puli",
      location: "Palakkad"
    }
  ],

  equipment: [
    {
      id: "eq-01",
      ownerId: "u-equipment-01",
      name: "Mahindra 575 DI 45HP Tractor",
      category: "Tractors",
      dailyRate: 1500.0,
      hourlyRate: 250.0,
      imageUrl: productImages.tractor,
      locationName: "Punjab Agri Zone",
      available: true
    },
    {
      id: "eq-02",
      ownerId: "u-equipment-01",
      name: "DJI Agras T40 Spraying Drone",
      category: "Drones",
      dailyRate: 2800.0,
      hourlyRate: 400.0,
      imageUrl: productImages.drone,
      locationName: "Haryana Tech Hub",
      available: true
    },
    {
      id: "eq-03",
      ownerId: "u-equipment-01",
      name: "Kubota DC-68G Paddy Harvester",
      category: "Harvesters",
      dailyRate: 3500.0,
      hourlyRate: 600.0,
      imageUrl: productImages.harvester,
      locationName: "Uttar Pradesh Belt",
      available: true
    }
  ],

  schemes: [
    {
      id: "sch-01",
      title: "PM-KISAN Samman Nidhi Scheme",
      department: "Ministry of Agriculture & Farmers Welfare",
      category: "Financial Income Support",
      description: "Direct income support of ₹6,000 per year transferred into bank accounts of eligible farmer families.",
      subsidyAmount: "₹6,000 / Year",
      linkUrl: "https://pmkisan.gov.in"
    },
    {
      id: "sch-02",
      title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      department: "Agriculture Insurance Company of India",
      category: "Crop Insurance",
      description: "Comprehensive risk insurance cover against crop loss due to non-preventable natural risks.",
      subsidyAmount: "Up to 90% Premium Subsidy",
      linkUrl: "https://pmfby.gov.in"
    },
    {
      id: "sch-03",
      title: "Sub-Mission on Agricultural Mechanization (SMAM)",
      department: "Department of Agriculture and Farmers Welfare",
      category: "Equipment & Drone Subsidy",
      description: "Financial assistance to farmers for purchase of machinery, tractors, and agricultural spraying drones.",
      subsidyAmount: "40% to 50% Subsidy",
      linkUrl: "https://agrimachinery.nic.in"
    }
  ]
};

console.log("Mock seed data defined successfully!");