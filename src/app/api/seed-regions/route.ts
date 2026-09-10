import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialData = [
  { district: "Thiruvananthapuram", primaryLivestock: "Cows, Goats, Poultry (Broiler & Layer), Pigs, Rabbits", focusAreas: "Extensive dairy cooperatives, Malabari goat breeding, and rabbit farming." },
  { district: "Kollam", primaryLivestock: "Cows, Goats, Poultry, Buffaloes, Ducks", focusAreas: "Dairy farming, backyard goat rearing, and coastal wetland duck farming." },
  { district: "Pathanamthitta", primaryLivestock: "Cows, Buffaloes, Goats, Ducks, Pigs", focusAreas: "Dairy farming and Upper Kuttanad wetland duck farming." },
  { district: "Alappuzha", primaryLivestock: "Ducks, Cows, Buffaloes, Goats, Poultry", focusAreas: "State leader in duck farming (Kuttanad belt) and wetland cattle grazing." },
  { district: "Kottayam", primaryLivestock: "Cows, Buffaloes, Ducks, Pigs, Goats, Poultry", focusAreas: "Origin of the dwarf Vechur cow; extensive duck and pig rearing." },
  { district: "Idukki", primaryLivestock: "Cows, Pigs, Goats, Buffaloes, Poultry", focusAreas: "High-altitude dairy cattle, large-scale commercial piggery, and goat farming." },
  { district: "Ernakulam", primaryLivestock: "Cows, Poultry, Goats, Pigs, Buffaloes, Ducks", focusAreas: "Large-scale commercial poultry hubs, peri-urban dairies, and piggeries." },
  { district: "Thrissur", primaryLivestock: "Cows, Buffaloes, Goats, Pigs, Poultry, Ducks", focusAreas: "Major dairy cluster, significant buffalo numbers, and commercial pig breeding hubs." },
  { district: "Palakkad", primaryLivestock: "Cows, Buffaloes, Goats, Sheep, Poultry", focusAreas: "State leader in cattle and buffalo populations; home to the native Attappady Black goat." },
  { district: "Malappuram", primaryLivestock: "Cows, Goats, Buffaloes, Poultry, Ducks", focusAreas: "High poultry and Malabari goat population, supported by crossbred dairy farming." },
  { district: "Kozhikode", primaryLivestock: "Cows, Goats, Poultry, Pigs, Rabbits", focusAreas: "Commercial poultry breeding, Malabari goats, and local dairy units." },
  { district: "Wayanad", primaryLivestock: "Cows, Pigs, Goats, Buffaloes, Poultry", focusAreas: "Hill-tract dairy operations, prominent pig farming units, and free-range goat rearing." },
  { district: "Kannur", primaryLivestock: "Cows, Goats, Pigs, Poultry, Buffaloes", focusAreas: "Center for Malabari goat conservation, commercial poultry, and piggeries." },
  { district: "Kasaragod", primaryLivestock: "Cows, Goats, Buffaloes, Poultry", focusAreas: "Dairy farming, Kasaragod Dwarf cattle rearing, and backyard goat production." }
];

export async function GET() {
  try {
    let count = 0;
    for (const region of initialData) {
      await prisma.regionalLivestockAnalysis.upsert({
        where: { district: region.district },
        update: {},
        create: region
      });
      count++;
    }
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to seed' }, { status: 500 });
  }
}
