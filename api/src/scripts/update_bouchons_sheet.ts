import { load } from "https://deno.land/std@0.203.0/dotenv/mod.ts";
import { GoogleSheetsService } from "../infrastructure/services/GoogleSheetsService.ts";

const bouchonsPath = new URL(
  "../infrastructure/data/bouchons.json",
  import.meta.url,
);

async function writeBouchons(path: URL, bouchons: unknown[]) {
  await Deno.writeTextFile(path, JSON.stringify(bouchons, null, 2));
}

function parseBoolean(val: string): boolean {
  return val?.toLowerCase() === "true";
}

function cleanString(val: string): string {
  return val?.replace(/^["']|["']$/g, "").trim() || val;
}

function parseSpecialties(val: string): string[] {
  return val ? val.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

function parseMenuPrice(val: string): number | undefined {
  if (!val || val.trim() === "" || val.trim() === "-") {
    return undefined;
  }
  // Remove currency symbols and spaces, replace comma with dot
  const cleaned = val.replace(/[€\s]/g, "").replace(",", ".");
  const price = parseFloat(cleaned);
  return isNaN(price) ? undefined : price;
}

function mapRowToBouchon(
  row: string[],
  _keys: string[],
): Record<string, unknown> {
  // Now first column is name, then skip openingHours, district, mapsUrl is removed
  return {
    name: row[0],
    menuPrice: parseMenuPrice(row[1]),
    neighborhood: row[3],
    portionSize: row[4],
    eaterType: cleanString(row[5]),
    atmosphereType: row[6],
    bouchonType: row[7],
    vegetarianOption: parseBoolean(row[8]),
    terrace: parseBoolean(row[9]),
    machonOption: parseBoolean(row[10]),
    remarkableDecoration: parseBoolean(row[11]),
    remarkableTeam: parseBoolean(row[12]),
    reservation: parseBoolean(row[13]),
    dateFriendly: parseBoolean(row[14]),
    businessMeal: parseBoolean(row[15]),
    compagnieFavorite: parseBoolean(row[16]),
    wineFavorite: parseBoolean(row[17]),
    bouchonLyonnaisLabel: parseBoolean(row[18]),
    authenticSelection: parseBoolean(row[19]),
    valueForMoney: parseBoolean(row[20]),
    specialties: parseSpecialties(row[21]),
    description: row[22],
    articleUrl: row[23],
    menuUrl: row[24],
    bookingUrl: row[25],
    // Add more fields as needed
  };
}

async function main() {
  await load({ export: true });
  const sheets = new GoogleSheetsService();
  const rows = await sheets.getRows();
  if (!rows || rows.length < 3) {
    throw new Error("Not enough data in sheet");
  }
  const keys = rows[1]; // Second row: field names
  const bouchons = [];
  for (const row of rows.slice(2)) {
    if (!row[0] || row[0].trim() === "") break;
    bouchons.push(mapRowToBouchon(row, keys));
  }
  await writeBouchons(bouchonsPath, bouchons);
  console.log("bouchons.json updated from Google Sheets.");
}

if (import.meta.url === Deno.mainModule) {
  main();
}
