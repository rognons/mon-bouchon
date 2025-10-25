import { load } from "https://deno.land/std@0.203.0/dotenv/mod.ts";
import type { GooglePlaceDetails } from "../infrastructure/services/GooglePlacesService.ts";
import { GooglePlacesService } from "../infrastructure/services/GooglePlacesService.ts";

type Bouchon = {
  name: string;
  address: string;
  openingHours?: unknown;
  exceptionalOpeningHours?: unknown;
  rating?: number | null;
  [key: string]: unknown;
};

await load({ export: true });

const bouchonsPath = new URL(
  "../infrastructure/data/bouchons.json",
  import.meta.url,
);

async function readBouchons(path: URL): Promise<Bouchon[]> {
  const text = await Deno.readTextFile(path);
  return JSON.parse(text) as Bouchon[];
}

async function writeBouchons(path: URL, bouchons: Bouchon[]): Promise<void> {
  await Deno.writeTextFile(path, JSON.stringify(bouchons, null, 2));
}

async function enrichBouchonWithGoogle(
  bouchon: Bouchon,
  googleService: GooglePlacesService,
): Promise<void> {
  const query = bouchon.name + ", " + bouchon.address;
  const details: GooglePlaceDetails | null = await googleService
    .getPlaceDetailsByName(query);

  console.log(
    `\n[${bouchon.name}] Google API response:`,
    JSON.stringify(details, null, 2),
  );

  if (!details) {
    console.error(`No Places API Details found for bouchon: ${bouchon.name}`);
    return;
  }

  bouchon.openingHours = null;
  const periods = details.opening_hours?.periods;
  if (Array.isArray(periods)) {
    const hoursArr: Array<
      { day: number; open: string | null; close: string | null }
    > = [];
    for (const period of periods) {
      const day = typeof period.open?.day === "number" ? period.open.day : null;
      // Store as HHmm (raw from Google)
      const open = period.open?.time ?? null;
      const close = period.close?.time ?? null;
      if (day !== null) {
        hoursArr.push({ day, open, close });
      }
    }
    bouchon.openingHours = hoursArr;
  }

  bouchon.exceptionalOpeningHours = null;
  let specialDays: unknown = null;
  if (details.opening_hours) {
    for (const key of Object.keys(details.opening_hours)) {
      const value = (details.opening_hours as Record<string, unknown>)[key];
      if (key.toLowerCase().includes("special") && Array.isArray(value)) {
        specialDays = value;
        break;
      }
    }
  }
  if (Array.isArray(specialDays)) {
    type ExceptionalDay = {
      date: string;
      exceptional_hours?: Array<{ open_time?: string; close_time?: string }>;
    };
    const exceptionalArr = [];
    for (const d of specialDays) {
      if (d && typeof d === "object" && "date" in d) {
        const day = d as ExceptionalDay;
        if (Array.isArray(day.exceptional_hours)) {
          for (const h of day.exceptional_hours) {
            exceptionalArr.push({
              date: day.date,
              open: h.open_time ?? null,
              close: h.close_time ?? null,
            });
          }
        } else {
          exceptionalArr.push({ date: day.date, open: null, close: null });
        }
      }
    }
    bouchon.exceptionalOpeningHours = exceptionalArr;
  }
  let postalCode = null;
  if (Array.isArray(details.address_components)) {
    for (const comp of details.address_components) {
      if (comp.types.includes("postal_code")) {
        postalCode = comp.short_name;
        break;
      }
    }
  }

  bouchon.rating = details.rating || null;
  bouchon.phone = details.formatted_phone_number || null;
  bouchon.priceLevel = details.price_level ?? null;
  bouchon.postalCode = postalCode;
  bouchon.mapsUrl = details.url || null;
}

async function main() {
  const bouchons = await readBouchons(bouchonsPath);
  const googleService = new GooglePlacesService();
  for (const bouchon of bouchons) {
    await enrichBouchonWithGoogle(bouchon, googleService);
  }
  await writeBouchons(bouchonsPath, bouchons);
  console.log("bouchons.json updated with Google Places data.");
}

if (import.meta.url === Deno.mainModule) {
  main();
}
