export interface RegionalLivestockInfo {
  id: string;
  district: string;
  primaryLivestock: string;
  focusAreas: string;
  climateSuitability: string;
  imageUrl: string;
}

export interface LivestockBreedInfo {
  id: string;
  breedName: string;
  expectedYield: string;
  fatContent: string;
  maintenanceLevel: string;
  location: string;
  category: "Cattle" | "Goat" | "Buffalo" | "Duck" | "Poultry" | "Swine" | "Other";
  imageUrl: string;
  description?: string;
  feedRequirement?: string;
}

export const KERALA_DISTRICTS = [
  "Palakkad",
  "Kottayam",
  "Idukki",
  "Wayanad",
  "Alappuzha",
  "Thrissur",
  "Kozhikode",
  "Malappuram",
  "Kannur",
  "Kollam",
  "Thiruvananthapuram",
  "Kasaragod",
  "Pathanamthitta",
  "Ernakulam"
] as const;

export const DEFAULT_REGIONAL_LIVESTOCK: RegionalLivestockInfo[] = [
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
];

export const DEFAULT_LIVESTOCK_BREEDS: LivestockBreedInfo[] = [
  {
    id: "rec-01",
    breedName: "Vechur Cow (Indigenous Dwarf)",
    expectedYield: "3 - 4 L/day (Medicinal A2 Milk)",
    fatContent: "4.7% - 5.8%",
    maintenanceLevel: "Extremely Low (High Heat & Disease Resistance)",
    location: "Kottayam, Alappuzha, Pathanamthitta, Ernakulam & Central Kerala",
    category: "Cattle",
    imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500",
    description: "World's smallest cattle breed originating from Vechur village, Kottayam. Known for highly digestible A2 beta-casein medicinal milk, natural resistance to tick fever and mastitis, and minimal feed requirements.",
    feedRequirement: "3-5 kg green grass + 1 kg dry fodder + local roughage"
  },
  {
    id: "rec-02",
    breedName: "Kasaragod Dwarf Cattle",
    expectedYield: "2 - 3 L/day (Zero Grazing Tolerant)",
    fatContent: "4.5% - 5.2%",
    maintenanceLevel: "Very Low (Survives on local roughage)",
    location: "Kasaragod, Kannur, Wayanad & North Kerala",
    category: "Cattle",
    imageUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500",
    description: "Hardy indigenous dwarf breed from North Malabar hill tracts. Perfect for organic homestead farms; requires zero commercial feed supplements and easily climbs slopes.",
    feedRequirement: "Field pasture, kitchen crop residue and minimal mineral salt"
  },
  {
    id: "rec-03",
    breedName: "Malabari Goat (Tellicherry)",
    expectedYield: "1.5 - 2.5 L/day (Prolific Twinning 80%+)",
    fatContent: "3.8% - 4.5%",
    maintenanceLevel: "Low to Moderate",
    location: "Kozhikode, Kannur, Malappuram, Wayanad, Palakkad & All Kerala",
    category: "Goat",
    imageUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?w=500",
    description: "Kerala's flagship indigenous dual-purpose goat. Renowned for early sexual maturity (9-10 months), high twinning rate (over 80%), tender chevon, and adaptability to humid climate.",
    feedRequirement: "Tree leaves (Subabul, Jackfruit leaves, Hybrid Napier) + 200g grain mix"
  },
  {
    id: "rec-04",
    breedName: "Attappady Black Goat",
    expectedYield: "1.0 - 1.8 L/day (Tough Meat & Milk Dual)",
    fatContent: "4.2% - 4.9%",
    maintenanceLevel: "Extremely Low (Drought & Heat Resistant)",
    location: "Palakkad, Thrissur, Malappuram & Central Gap",
    category: "Goat",
    imageUrl: "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=500",
    description: "Native breed reared by tribal communities of Attappady valley in Palakkad. Completely jet black with bronze eyes, uniquely adapted to dry, stony scrublands with superior parasite immunity.",
    feedRequirement: "Scrub vegetation, thorny shrubs, wild legumes, and free grazing"
  },
  {
    id: "rec-05",
    breedName: "Murrah Buffalo (Graded)",
    expectedYield: "10 - 16 L/day (High Cream Commercial Dairy)",
    fatContent: "7.0% - 8.5%",
    maintenanceLevel: "Medium (Requires Wallowing Tank)",
    location: "Palakkad, Thrissur, Ernakulam, Kottayam, Kollam",
    category: "Buffalo",
    imageUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500",
    description: "Premier black gold dairy breed. Graded Murrah thrives in Kerala's irrigated paddy belts (Palakkad Gap and Thrissur plains) where abundant rice straw and wallowing water are available.",
    feedRequirement: "25-30 kg green fodder + 6 kg paddy straw + 4-5 kg balanced concentrate"
  },
  {
    id: "rec-06",
    breedName: "Kuttanad Duck (Chara & Chemballi)",
    expectedYield: "160 - 190 Eggs/Year",
    fatContent: "Rich Yolks (12.5% Protein)",
    maintenanceLevel: "Low (Paddy Stubble Scavenging)",
    location: "Alappuzha, Kottayam, Pathanamthitta, Kollam & Backwaters",
    category: "Duck",
    imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500",
    description: "Traditional waterfowl breed endemic to the Vembanad Lake and Kuttanad paddy basin. Grazes harvested paddy fields on fallen grains, snails, and aquatic bugs with minimal supplemental feed.",
    feedRequirement: "Paddy grain grazing + broken rice + azolla aquatic fern"
  },
  {
    id: "rec-07",
    breedName: "Highland Crossbred Dairy (HF x Jersey)",
    expectedYield: "18 - 26 L/day (Commercial Lactation)",
    fatContent: "3.9% - 4.4%",
    maintenanceLevel: "Moderate (Cool Hill Mist Preference)",
    location: "Idukki, Wayanad & High Ranges",
    category: "Cattle",
    imageUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=500",
    description: "High-producing crossbred dairy cattle selected for the cool high-range tea and coffee estates of Idukki and Wayanad. Minimal heat stress ensures peak lactation cycles.",
    feedRequirement: "35 kg silaged fodder + 6 kg commercial dairy mash + mineral licks"
  },
  {
    id: "rec-08",
    breedName: "Large White Yorkshire Pig",
    expectedYield: "Market Weight 80 - 100 kg at 7-8 Months",
    fatContent: "High Dressing Lean Pork (75%+)",
    maintenanceLevel: "Medium (Clean Bio-Secure Shed)",
    location: "Idukki, Wayanad, Thrissur, Kannur & Central Highlands",
    category: "Swine",
    imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500",
    description: "Fast-growing commercial pig breed with excellent feed conversion efficiency. Highly profitable in plantation belts with waste vegetable, fruit, and brewery byproduct feeding.",
    feedRequirement: "Brewery grain waste, cooked kitchen produce, corn meal & soy mash"
  },
  {
    id: "rec-09",
    breedName: "Gramalakshmi / BV-380 Layer Poultry",
    expectedYield: "200 - 230 Brown Eggs/Year",
    fatContent: "Nutritious Country Eggs",
    maintenanceLevel: "Very Low (Backyard scavenging)",
    location: "Thiruvananthapuram, Kollam, Ernakulam & All Kerala",
    category: "Poultry",
    imageUrl: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500",
    description: "Developed by Kerala Agricultural University (KAU) specifically for rural homestead poultry. Hardy, predator-evasive, disease-resistant, and produces attractive brown shelled eggs.",
    feedRequirement: "Backyard kitchen scraps, worms, cracked maize, and grain mix"
  }
];

export function getBreedsForDistrict(district: string | null | undefined, allBreeds = DEFAULT_LIVESTOCK_BREEDS): LivestockBreedInfo[] {
  if (!district) return allBreeds;
  const d = district.trim().toLowerCase();

  const matched = allBreeds.filter((rec) => {
    const loc = (rec.location || "").toLowerCase();
    if (loc.includes(d)) return true;
    if (
      loc.includes("all") ||
      loc.includes("all kerala") ||
      loc.includes("all regions") ||
      loc.includes("all districts") ||
      loc.includes("kerala")
    ) return true;
    if (loc.includes("central kerala") && ["kottayam", "ernakulam", "alappuzha", "idukki", "thrissur"].includes(d)) return true;
    if (loc.includes("malabar") && ["kozhikode", "kannur", "malappuram", "kasaragod", "wayanad"].includes(d)) return true;
    if (loc.includes("north kerala") && ["kasaragod", "kannur"].includes(d)) return true;
    if (loc.includes("south kerala") && ["thiruvananthapuram", "kollam", "pathanamthitta"].includes(d)) return true;
    if (loc.includes("highland") && ["idukki", "wayanad"].includes(d)) return true;
    if (loc.includes("backwaters") && ["alappuzha", "kollam", "kottayam", "ernakulam"].includes(d)) return true;
    if (loc.includes("gap") && ["palakkad", "thrissur"].includes(d)) return true;
    return false;
  });

  return matched.length > 0 ? matched : allBreeds;
}
