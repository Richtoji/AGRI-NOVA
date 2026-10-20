export interface CropKnowledgeItem {
  scientificName: string;
  category: string;
  expectedYield: string;
  growingPeriod: string;
  waterRequirement: number;
  fertilizer: string;
  pesticide: string;
  description: string;
  climateRequirements: string;
  soilRequirements: string;
  landPreparation: string;
  seedInformation: string;
  spacing: string;
  plantingMethod: string;
  manureFertilizers: Array<{
    inputName: string;
    isOrganic: boolean;
    quantity: number;
    unit: string;
    applicationStage: string;
    applicationMethod: string;
    frequency: string;
  }>;
  wateringSchedules: Array<{
    growthStage: string;
    frequency: string;
    irrigationMethod: string;
    specialInstructions: string;
  }>;
  pestDiseases: Array<{
    problemName: string;
    problemType: string;
    symptoms: string;
    prevention: string;
    treatment: string;
  }>;
  cultivationStages: Array<{
    stageOrder: number;
    stageName: string;
    startDay: number;
    endDay: number;
    description: string;
    waterReq: string;
    manureReq: string;
    careInstructions: string;
  }>;
  harvesting: string;
  postHarvest: string;
}

export const CROP_KNOWLEDGE: Record<string, CropKnowledgeItem> = {
  "Tea": {
    scientificName: "Camellia sinensis",
    category: "Plantation / Cash Crop",
    expectedYield: "2000 - 3000 Kg/ha (Made Tea)",
    growingPeriod: "Perennial (Harvest cycle every 7-10 days)",
    waterRequirement: 4,
    fertilizer: "NPK 120:30:60 kg/ha + Organic Compost",
    pesticide: "Copper Oxychloride (2.5 g/L) & Neem formulation",
    description: "Tea is a high-value perennial plantation crop grown extensively in high-elevation hilly terrains with well-drained acidic soil and humid temperate climate.",
    climateRequirements: "High elevation (800-2200m MSL), 150-300cm well-distributed rainfall, temperatures 13°C - 30°C with high relative humidity.",
    soilRequirements: "Deep, porous, acidic soils (pH 4.5 to 5.5) with rich organic matter and excellent subsoil drainage.",
    landPreparation: "Contour terracing on slopes to prevent soil erosion. Dig pits of 45cm x 45cm x 45cm and fill with topsoil mixed with 5kg well-decomposed FYM or compost.",
    seedInformation: "Certified clonal tea saplings (biclonal or high-yielding cultivars with 8-10 leaves and vigorous root system).",
    spacing: "105 cm x 75 cm (Double hedge spacing: 135 x 75 x 75 cm).",
    plantingMethod: "Plant healthy container-grown tea saplings carefully in center of pit without disturbing root ball. Firm soil around collar and apply mulch immediately.",
    manureFertilizers: [
      { inputName: "Farmyard Manure / Compost", isOrganic: true, quantity: 10, unit: "Tonnes/ha", applicationStage: "Basal / Planting", applicationMethod: "Soil incorporation in pits", frequency: "Annually" },
      { inputName: "NPK 120:30:60 Blend", isOrganic: false, quantity: 210, unit: "kg/ha", applicationStage: "Active Growth", applicationMethod: "Broadcast in ring around bush", frequency: "4 split doses per year" },
      { inputName: "Zinc Sulphate Foliar Spray", isOrganic: false, quantity: 2, unit: "kg/ha", applicationStage: "Post-Monsoon", applicationMethod: "Foliar mist spray", frequency: "Twice a year" }
    ],
    wateringSchedules: [
      { growthStage: "Stage 1: Seedling & Sapling Planting", frequency: "Daily for first 2 weeks, then every 2-3 days", irrigationMethod: "Sprinkler or Drip Irrigation", specialInstructions: "Keep soil moist around root zone; avoid waterlogging in pits." },
      { growthStage: "Stage 2: Vegetative Canopy Development", frequency: "Every 4-5 days during dry spells", irrigationMethod: "Overhead Sprinkler System", specialInstructions: "Ensure adequate misting to maintain canopy humidity above 65%." },
      { growthStage: "Stage 3: Maintenance & Regular Flushing", frequency: "Weekly during dry periods (November to April)", irrigationMethod: "Sprinkler Irrigation", specialInstructions: "Resume natural rain-fed cycles during monsoon months." }
    ],
    pestDiseases: [
      { problemName: "Tea Mosquito Bug (Helopeltis theivora)", problemType: "Pest", symptoms: "Brown necrotic spots on tender shoots and leaves leading to curled shoot tips.", prevention: "Regular plucking and weed clearance under bushes.", treatment: "Spray Neem Seed Kernel Extract (5%) or Thiamethoxam 25 WG @ 100g/ha." },
      { problemName: "Red Spider Mite (Oligonychus coffeae)", problemType: "Pest", symptoms: "Bronzing and drying of mature leaves with fine webbing on upper leaf surface.", prevention: "Avoid dust accumulation on foliage along road sides.", treatment: "Spray Wettable Sulphur @ 2g/L or Fenpyroximate 5 EC @ 1ml/L." },
      { problemName: "Blister Blight (Exobasidium vexans)", problemType: "Disease", symptoms: "Translucent spots turning into white powdery blisters on young leaves during monsoon.", prevention: "Regulate shade trees to allow adequate sunlight penetration.", treatment: "Spray Copper Oxychloride 50 WP (2.5 g/L) + Hexaconazole (1 ml/L) at 7-day intervals." }
    ],
    cultivationStages: [
      { stageOrder: 1, stageName: "Stage 1: Sapling Planting & Field Establishment", startDay: 1, endDay: 30, description: "Plant healthy tea saplings into prepared contour pits with organic compost and establish mulch cover. Upload clear photograph of planted saplings for Admin approval.", waterReq: "Every 2-3 days (Soil dampness maintained)", manureReq: "5kg FYM per pit + 10g Rock Phosphate", careInstructions: "Shade young saplings with temporary fern twigs. Submit photo proof for Admin verification." },
      { stageOrder: 2, stageName: "Stage 2: Centering & Frame Formation", startDay: 31, endDay: 90, description: "Perform centering cut at 15-20cm to encourage lateral spreading branches and robust bush frame.", waterReq: "Every 4-5 days during dry periods", manureReq: "NPK 10:5:10 @ 25g/plant in split dose", careInstructions: "Remove dead twigs, inspect for tea mosquito bug, and apply light mulching." },
      { stageOrder: 3, stageName: "Stage 3: Foliage Tipping & Bush Expansion", startDay: 91, endDay: 180, description: "Tipping shoots at 35cm level to form a dense, flat plucking table across the contour hedges.", waterReq: "Weekly or as needed by rainfall", manureReq: "NPK foliar boost + micronutrient spray", careInstructions: "Monitor weekly growth, apply preventive blister blight control during monsoon." },
      { stageOrder: 4, stageName: "Stage 4: Plucking Table Maintenance & Harvesting", startDay: 181, endDay: 365, description: "Regular plucking of 'two leaves and a bud' at 7-10 day intervals to ensure supreme quality harvest.", waterReq: "Supplementary sprinkler during dry spells", manureReq: "Annual maintenance NPK in 4 split doses", careInstructions: "Maintain uniform plucking surface and record weekly yield data." }
    ],
    harvesting: "Harvest standard 'two leaves and a bud' every 7 to 10 days during peak flushing seasons. Handle harvested green leaves in aerated cane baskets.",
    postHarvest: "Transport green tea leaves to processing facility within 3 hours to prevent bruising and spontaneous heating."
  },
  "Coconut": {
    scientificName: "Cocos nucifera",
    category: "Plantation Crop",
    expectedYield: "80 - 100 Nuts/Palm/Year",
    growingPeriod: "Perennial (Yield starts in 4-5 yrs)",
    waterRequirement: 4,
    fertilizer: "NPK 500:320:1200 g/palm/year + 25kg FYM",
    pesticide: "Neem Cake + Rhynchophorus Pheromone traps",
    description: "Coconut is a versatile perennial palm crop thriving in humid coastal and tropical regions with well-drained sandy loam soil.",
    climateRequirements: "Warm tropical climate, 27°C mean temperature, 150-250cm rainfall, high sunshine hours.",
    soilRequirements: "Deep alluvial, red sandy loam or coastal sands with pH 5.2 - 8.0 and good water table.",
    landPreparation: "Dig pits of 1m x 1m x 1m, fill bottom with coconut husks and topsoil mixed with 25kg farmyard manure.",
    seedInformation: "10-12 month old vigorous dwarf/tall hybrid seedlings with 6-8 leaves and thick collar.",
    spacing: "7.5 m x 7.5 m square planting.",
    plantingMethod: "Plant seedling in center of pit at depth level with collar. Compact soil firmly and water immediately.",
    manureFertilizers: [
      { inputName: "Farmyard Manure / Organic Compost", isOrganic: true, quantity: 25, unit: "kg/palm", applicationStage: "Pre-Monsoon (May-June)", applicationMethod: "Basal ring application (1.5m radius)", frequency: "Annually" },
      { inputName: "Urea (Nitrogen Source)", isOrganic: false, quantity: 1.1, unit: "kg/palm", applicationStage: "Split Dose (Post-Monsoon)", applicationMethod: "Circular trench around palm", frequency: "Twice a year" },
      { inputName: "Muriate of Potash (K2O)", isOrganic: false, quantity: 2.0, unit: "kg/palm", applicationStage: "Split Dose (Post-Monsoon)", applicationMethod: "Circular trench around palm", frequency: "Twice a year" }
    ],
    wateringSchedules: [
      { growthStage: "Stage 1: Seedling Planting & Establishment", frequency: "Every 2 days (40 Litres/palm)", irrigationMethod: "Basin or Drip System", specialInstructions: "Ensure pit basin does not waterlog during heavy showers." },
      { growthStage: "Stage 2: Juvenile Palm Growth (Year 1-3)", frequency: "Every 3-4 days (60-80 Litres/palm)", irrigationMethod: "Drip Irrigation (2-4 emitters/palm)", specialInstructions: "Mulch basin with coconut leaves/husks to retain moisture." },
      { growthStage: "Stage 3: Bearing & Mature Stage", frequency: "Every 4-5 days during dry months (100-150 Litres/palm)", irrigationMethod: "Drip System (4 emitters)", specialInstructions: "Crucial during summer to avoid button shedding." }
    ],
    pestDiseases: [
      { problemName: "Rhinoceros Beetle (Oryctes rhinoceros)", problemType: "Pest", symptoms: "Geometric V-shaped cuts on opened fronds and chewed spathes.", prevention: "Treat compost pits with Metarhizium anisopliae fungus.", treatment: "Fill leaf axils with 25g Sevidol/Neem cake mixed with sand." },
      { problemName: "Red Palm Weevil (Rhynchophorus ferrugineus)", problemType: "Pest", symptoms: "Holes on trunk with extruded chewed fibers and brown oozing liquid.", prevention: "Avoid injury to stem during weeding and pruning.", treatment: "Root feeding with Imidacloprid (10ml + 10ml water) or pheromone trapping." },
      { problemName: "Bud Rot (Phytophthora palmivora)", problemType: "Disease", symptoms: "Yellowing and rotting of central spindle leaf with foul smell.", prevention: "Ensure clean crowns before monsoon season.", treatment: "Apply Bordeaux paste to crown and spray 1% Bordeaux mixture." }
    ],
    cultivationStages: [
      { stageOrder: 1, stageName: "Stage 1: Seedling Pit Planting & Basal Fertilization", startDay: 1, endDay: 30, description: "Plant healthy coconut seedling in 1m prepared pit with organic manure and coconut husk layer. Upload photograph of planted sapling for Admin approval.", waterReq: "40 Litres every 2 days", manureReq: "25kg FYM + 1kg Bone Meal in pit", careInstructions: "Provide partial shade with palm leaves. Submit seedling photo for Admin approval." },
      { stageOrder: 2, stageName: "Stage 2: Vegetative Frond & Collar Development", startDay: 31, endDay: 180, description: "Formation of healthy fronds, active collar expansion, and root anchorage.", waterReq: "Every 3 days (60 Litres/palm)", manureReq: "First split dose of NPK (1/3rd adult dose)", careInstructions: "Keep 1.5m basin weed-free and inspect leaf axils for rhinoceros beetle." },
      { stageOrder: 3, stageName: "Stage 3: Trunk Growth & Canopy Establishment", startDay: 181, endDay: 365, description: "Rapid vertical trunk emergence with full crown whorl formation.", waterReq: "Every 4-5 days via drip", manureReq: "Second split dose of organic compost + Potash", careInstructions: "Apply green leaf mulching and maintain weekly growth records." },
      { stageOrder: 4, stageName: "Stage 4: Inflorescence & Nut Bearing Cycle", startDay: 366, endDay: 730, description: "Spadix emergence, button setting, and continuous monthly harvesting.", waterReq: "100 Litres every 4 days in dry period", manureReq: "Full adult dose (NPK 500:320:1200g/year)", careInstructions: "Harvest mature 11-12 month old bunches regularly." }
    ],
    harvesting: "Harvest nuts at 11-12 months maturity when husk turns brown or dry. Collect every 30 to 45 days.",
    postHarvest: "Store harvested nuts in shade for 3-4 weeks for seasoned copra drying or direct dehusking for tender/market sale."
  },
  "Rubber": {
    scientificName: "Hevea brasiliensis",
    category: "Industrial Plantation Crop",
    expectedYield: "1500 - 2000 Kg/ha (Dry Rubber)",
    growingPeriod: "Perennial (Tapping starts in Year 7)",
    waterRequirement: 3,
    fertilizer: "NPK 10:10:10 @ 300g/plant + Rock phosphate",
    pesticide: "Copper Oxychloride + Bordeaux paste",
    description: "Natural rubber tree grown on gentle slopes with high precipitation and well-aerated deep soils for latex extraction.",
    climateRequirements: "Equatorial/tropical climate, 200-300cm rainfall, 20°C - 34°C temperature, high atmospheric moisture.",
    soilRequirements: "Deep, well-drained, acidic laterite or red loam soils (pH 4.5 to 6.0).",
    landPreparation: "Dig pits of 75cm x 75cm x 75cm, fill with topsoil mixed with compost and rock phosphate.",
    seedInformation: "Budded polybag plants of RRII 105 or RRII 414 clones with green/brown budded shoots.",
    spacing: "4.9 m x 4.9 m square (or 6.7 m x 3.4 m contour).",
    plantingMethod: "Place polybag plant in center of pit, slit bag and remove carefully without root disturbance. Fill soil and mulch.",
    manureFertilizers: [
      { inputName: "Organic Compost", isOrganic: true, quantity: 12, unit: "kg/pit", applicationStage: "Basal / Planting", applicationMethod: "Soil blending in pit", frequency: "Once at planting" },
      { inputName: "NPK 10:10:10 Young Rubber Mixture", isOrganic: false, quantity: 250, unit: "g/tree", applicationStage: "Post-Monsoon (Sept-Oct)", applicationMethod: "Broad band 30cm around trunk", frequency: "Twice a year" }
    ],
    wateringSchedules: [
      { growthStage: "Stage 1: Polybag Sapling Establishment", frequency: "Twice weekly for 2 months", irrigationMethod: "Basin or Pot Watering", specialInstructions: "Ensure thorough soil soak; apply weed mulch." },
      { growthStage: "Stage 2: Immature Rubber Tree Development", frequency: "Rainfed (Supplemental during severe summer)", irrigationMethod: "Basin Irrigation", specialInstructions: "Whitewash trunk to protect bark from sun scorch." }
    ],
    pestDiseases: [
      { problemName: "Abnormal Leaf Fall (Phytophthora meadii)", problemType: "Disease", symptoms: "Premature falling of green leaves with black lesions on petioles during monsoon.", prevention: "Clear undergrowth to enhance air circulation.", treatment: "Prophylactic aerial spray or tractor spray with 1% Bordeaux mixture." },
      { problemName: "Pink Disease (Corticium salmonicolor)", problemType: "Disease", symptoms: "Pink cobweb-like mycelium on branch forks with exudation of latex.", prevention: "Regular inspection of branch forks during monsoon.", treatment: "Scrape infected bark and apply Bordeaux paste or Thiram paste." }
    ],
    cultivationStages: [
      { stageOrder: 1, stageName: "Stage 1: Budded Sapling Field Planting", startDay: 1, endDay: 30, description: "Plant healthy budded rubber plants into prepared pits. Mulch basin and protect tender bud shoots. Submit photo for Admin approval.", waterReq: "Twice weekly", manureReq: "12kg Compost + 200g Rock Phosphate", careInstructions: "Stake saplings firmly and submit photo proof for Admin approval." },
      { stageOrder: 2, stageName: "Stage 2: Single Stem Training & Branch Pruning", startDay: 31, endDay: 120, description: "Prune side buds up to 2.5m height to develop a smooth, straight tapping panel trunk.", waterReq: "As per rainfall", manureReq: "NPK 10:10:10 @ 100g/plant", careInstructions: "Rub off all lateral buds emerging from stock or low scion." },
      { stageOrder: 3, stageName: "Stage 3: Canopy Spread & Girth Development", startDay: 121, endDay: 365, description: "Rapid tree girth increment towards minimum 50cm tapping girth standard.", waterReq: "Rainfed", manureReq: "Annual NPK fertilizer application in two split doses", careInstructions: "Apply Bordeaux paste before South-West monsoon." }
    ],
    harvesting: "Tapping begins when tree trunk reaches 50cm girth at 125cm height. Tap latex every alternate day (d/2 system) before sunrise.",
    postHarvest: "Collect latex in clean cups, strain and coagulate with 1% formic acid to produce high-grade ribbed smoked sheets (RSS)."
  },
  "Paddy": {
    scientificName: "Oryza sativa",
    category: "Cereal Grain / Staple",
    expectedYield: "4.5 - 6.0 Tonnes/ha",
    growingPeriod: "110 - 135 Days (Seasonal)",
    waterRequirement: 5,
    fertilizer: "NPK 90:45:45 kg/ha + Micronutrient Zinc",
    pesticide: "Chlorantraniliprole & Neem-based azadirachtin",
    description: "Paddy is a primary staple cereal grain cultivated in puddled wetlands with regulated water stagnation.",
    climateRequirements: "Tropical warm climate, 22°C - 35°C temperature, high solar radiation during grain filling.",
    soilRequirements: "Heavy clay or clay loam soils with high water-holding capacity and pH 5.5 to 7.0.",
    landPreparation: "Primary ploughing followed by wet puddling and leveling. Incorporate 5 tonnes/ha organic manure.",
    seedInformation: "Certified high-yielding seeds (Uma, Jyothi, Swarna, Jaya) @ 30-35 kg/ha.",
    spacing: "20 cm x 15 cm (or 25 x 25 cm for SRI method).",
    plantingMethod: "Transplant 18-22 day old seedlings (2-3 per hill) at 2-3cm depth in puddled soil.",
    manureFertilizers: [
      { inputName: "Farmyard Manure / Green Manure", isOrganic: true, quantity: 5, unit: "Tonnes/ha", applicationStage: "Basal Puddling", applicationMethod: "Incorporated during final land puddling", frequency: "Once" },
      { inputName: "Urea (Nitrogen 90 kg/ha equivalent)", isOrganic: false, quantity: 195, unit: "kg/ha", applicationStage: "Split Dose (Basal, Tillering, Panicle)", applicationMethod: "Broadcast in drained field", frequency: "3 split doses" },
      { inputName: "MOP (Potassium)", isOrganic: false, quantity: 75, unit: "kg/ha", applicationStage: "Basal & Panicle Initiation", applicationMethod: "Broadcast", frequency: "2 split doses" }
    ],
    wateringSchedules: [
      { growthStage: "Stage 1: Seedling Transplanting & Establishment", frequency: "Maintain 2-3 cm shallow water layer", irrigationMethod: "Flood / Basin Irrigation", specialInstructions: "Avoid deep flooding in first 7 days to promote root anchorage." },
      { growthStage: "Stage 2: Active Tillering Phase", frequency: "Maintain 3-5 cm standing water layer", irrigationMethod: "Controlled Flood", specialInstructions: "Perform alternate wetting and drying (AWD) to save water." },
      { growthStage: "Stage 3: Flowering & Grain Filling", frequency: "Maintain 5 cm water until 10 days before harvest", irrigationMethod: "Continuous Flood", specialInstructions: "Drain field completely 10-12 days before harvest." }
    ],
    pestDiseases: [
      { problemName: "Yellow Stem Borer (Scirpophaga incertulas)", problemType: "Pest", symptoms: "Dead hearts during vegetative stage and white ears at flowering stage.", prevention: "Install light traps and pheromone traps @ 8 traps/ha.", treatment: "Spray Chlorantraniliprole 18.5 SC @ 0.3ml/L or Cartap Hydrochloride 50 SP @ 1g/L." },
      { problemName: "Rice Blast (Magnaporthe oryzae)", problemType: "Disease", symptoms: "Spindle-shaped lesions with grey center and brown margin on leaves and neck.", prevention: "Seed treatment with Tricyclazole @ 2g/kg seed.", treatment: "Spray Tricyclazole 75 WP @ 0.6g/L or Isoprothiolane 40 EC @ 1.5ml/L." }
    ],
    cultivationStages: [
      { stageOrder: 1, stageName: "Stage 1: Seedling Transplanting & Initial Flooding", startDay: 1, endDay: 15, description: "Transplant healthy nursery seedlings into prepared wetland. Maintain 2cm water depth. Upload photograph of planted field for Admin approval.", waterReq: "2-3cm shallow standing water", manureReq: "Basal NPK + 5t/ha Organic manure", careInstructions: "Check seedling alignment, gap filling within 7 days, and submit photo for Admin approval." },
      { stageOrder: 2, stageName: "Stage 2: Active Tillering & Weed Management", startDay: 16, endDay: 45, description: "Tillering stage where multiple shoots emerge. Apply first top dressing of Nitrogen.", waterReq: "3-5cm regulated water", manureReq: "Top dressing Urea (50kg/ha)", careInstructions: "Run conoweeder and monitor stem borer presence." },
      { stageOrder: 3, stageName: "Stage 3: Panicle Initiation & Flowering", startDay: 46, endDay: 85, description: "Emergence of grain heads (panicles) and active pollination.", waterReq: "5cm continuous standing water", manureReq: "Final Potassium + Nitrogen booster", careInstructions: "Inspect for rice blast and false smut; spray bio-pesticide if required." },
      { stageOrder: 4, stageName: "Stage 4: Grain Ripening & Harvesting", startDay: 86, endDay: 120, description: "Grains turn golden yellow. Drain field 10 days prior to combine harvesting.", waterReq: "Field drained completely", manureReq: "Nil", careInstructions: "Harvest at 20-22% grain moisture." }
    ],
    harvesting: "Harvest when 85-90% of grains in panicles turn straw golden yellow. Cut crop with sickle or combine harvester.",
    postHarvest: "Thresh immediately and sun-dry grains on clean tarpaulins to 12-14% moisture before warehousing."
  }
};

export function getCropKnowledge(cropName: string): CropKnowledgeItem {
  if (CROP_KNOWLEDGE[cropName]) {
    return CROP_KNOWLEDGE[cropName];
  }

  // Fallback generic intelligent knowledge generator
  return {
    scientificName: `${cropName} spp.`,
    category: "Agricultural Crop",
    expectedYield: "Varies with farming technique (Good yield with proper management)",
    growingPeriod: "3 - 6 Months",
    waterRequirement: 3,
    fertilizer: "NPK balanced mix + Organic manure",
    pesticide: "Organic Neem Oil spray (5ml/L) or recommended bio-pesticide",
    description: `${cropName} is an important crop with strong local cultivation potential when supported with balanced fertilization and timely irrigation.`,
    climateRequirements: "Thrives in well-drained tropical or sub-tropical agro-climatic conditions with moderate sunshine and rainfall.",
    soilRequirements: "Fertile, loamy, well-aerated soil rich in organic humus with pH 6.0 to 7.5.",
    landPreparation: `Plough the land 2-3 times to achieve fine tilth. Form ridges, furrows, or pits and incorporate 5-10 tonnes/ha of well-rotted farmyard manure.`,
    seedInformation: `Use certified high-germination seeds or certified healthy nursery saplings suitable for the region.`,
    spacing: `Standard recommended crop spacing (maintain 45cm to 60cm between rows).`,
    plantingMethod: `Sow seeds at 2-3cm depth or transplant sturdy saplings into moist beds. Press soil gently and irrigate lightly immediately.`,
    manureFertilizers: [
      { inputName: "Organic Farmyard Manure", isOrganic: true, quantity: 8, unit: "Tonnes/ha", applicationStage: "Basal Preparation", applicationMethod: "Broadcasting and soil mixing", frequency: "Once" },
      { inputName: "Balanced NPK Fertilizer (19:19:19)", isOrganic: false, quantity: 150, unit: "kg/ha", applicationStage: "Vegetative & Flowering", applicationMethod: "Ring placement around base", frequency: "2 split doses" }
    ],
    wateringSchedules: [
      { growthStage: "Stage 1: Seed Sowing & Sapling Planting", frequency: "Every 2 days (Light irrigation)", irrigationMethod: "Drip or Surface Basin", specialInstructions: "Ensure topsoil stays moist for uniform seed germination and root setting." },
      { growthStage: "Stage 2: Vegetative & Branching Phase", frequency: "Every 3-4 days", irrigationMethod: "Drip / Furrow Irrigation", specialInstructions: "Avoid water stagnation around root collar." },
      { growthStage: "Stage 3: Flowering & Fruiting Phase", frequency: "Every 3-5 days according to weather", irrigationMethod: "Drip Irrigation", specialInstructions: "Maintain steady moisture to avoid flower drop or stunted fruit sizing." }
    ],
    pestDiseases: [
      { problemName: "Sucking Pests (Aphids / Whiteflies)", problemType: "Pest", symptoms: "Curling of young tender leaves and sticky honeydew on foliage.", prevention: "Yellow sticky traps @ 15 traps/ha.", treatment: "Spray Neem Seed Kernel Extract (5%) or Imidacloprid (0.5 ml/L)." },
      { problemName: "Leaf Spot / Fungal Blight", problemType: "Disease", symptoms: "Brown circular or irregular spots on leaves spreading in humid conditions.", prevention: "Avoid overhead splashing and maintain proper plant spacing.", treatment: "Spray Mancozeb (2g/L) or Copper Oxychloride (2.5g/L)." }
    ],
    cultivationStages: [
      { stageOrder: 1, stageName: "Stage 1: Seed Sowing & Sapling Planting", startDay: 1, endDay: 20, description: `Plant the ${cropName} seeds or saplings in prepared beds with organic manure and initial watering. Upload photograph for Admin approval.`, waterReq: "Every 2 days (Moist topsoil)", manureReq: "Organic compost + Basal starter dose", careInstructions: "Ensure proper germination dampness. Photograph of planted seed/sapling must be submitted and approved by Admin." },
      { stageOrder: 2, stageName: "Stage 2: Vegetative Growth & Root Establishment", startDay: 21, endDay: 50, description: "Active leaf expansion, shoot development, and root anchoring in soil.", waterReq: "Every 3-4 days", manureReq: "NPK first top dressing", careInstructions: "Weed surrounding basin and inspect foliage for early pest signs." },
      { stageOrder: 3, stageName: "Stage 3: Flowering, Nutrition & Pest Management", startDay: 51, endDay: 90, description: "Flowering stage requiring careful pest protection and micro-nutrient support.", waterReq: "Every 3-4 days", manureReq: "Potassium boost + Micronutrient spray", careInstructions: "Monitor weekly growth, apply recommended pesticide/neem oil if required." },
      { stageOrder: 4, stageName: "Stage 4: Maturation & Harvesting", startDay: 91, endDay: 120, description: "Fruit/grain ripening stage leading up to crop harvest and packing.", waterReq: "Reduce watering 7 days prior to harvest", manureReq: "Nil", careInstructions: "Harvest at peak maturity and store in dry conditions." }
    ],
    harvesting: `Harvest mature ${cropName} produce during early morning hours using clean sanitized tools.`,
    postHarvest: "Sort, grade, clean and package harvested produce in ventilated crates for local marketplace sale."
  };
}
