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

function parseSpecialties(val: string): string[] {
  return val ? val.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

function mapRowToBouchon(
  row: string[],
  _keys: string[],
): Record<string, unknown> {
  // Now first column is name, then skip openingHours, district, mapsUrl is removed
  return {
    name: row[0],
    neighborhood: row[3],
    portionSize: row[5],
    eaterType: row[6],
    atmosphereType: row[7],
    bouchonType: row[8],
    vegetarianOption: parseBoolean(row[9]),
    terrace: parseBoolean(row[10]),
    machonOption: parseBoolean(row[11]),
    remarkableDecoration: parseBoolean(row[12]),
    remarkableTeam: parseBoolean(row[13]),
    reservation: parseBoolean(row[14]),
    dateFriendly: parseBoolean(row[15]),
    businessMeal: parseBoolean(row[16]),
    compagnieFavorite: parseBoolean(row[17]),
    wineFavorite: parseBoolean(row[18]),
    bouchonLyonnaisLabel: parseBoolean(row[19]),
    authenticSelection: parseBoolean(row[20]),
    valueForMoney: parseBoolean(row[21]),
    specialties: parseSpecialties(row[22]),
    description: row[23],
    articleURL: row[24],
    menuURL: row[25],
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
