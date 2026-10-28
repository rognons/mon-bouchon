// Accès aux API Google utilisées par les scripts de mise à jour des données :
// Google Sheets (le tableau de la Compagnie) et Google Places (horaires,
// note, adresse). Repris des services Deno de l'ancienne API.

import { createSign } from 'node:crypto';

function env(nom: string): string {
  const valeur = process.env[nom];
  if (!valeur)
    throw new Error(`Variable d'environnement manquante : ${nom} (voir scripts/README.md)`);
  return valeur;
}

const base64url = (texte: string | Buffer) =>
  Buffer.from(texte).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function jetonSheets(compte: {
  client_email: string;
  private_key: string;
  token_uri: string;
}) {
  const maintenant = Math.floor(Date.now() / 1000);
  const entete = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const contenu = base64url(
    JSON.stringify({
      iss: compte.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: compte.token_uri,
      iat: maintenant,
      exp: maintenant + 3600,
    })
  );
  const signature = createSign('RSA-SHA256')
    .update(`${entete}.${contenu}`)
    .sign(compte.private_key);
  const reponse = await fetch(compte.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${entete}.${contenu}.${base64url(signature)}`,
    }),
  });
  if (!reponse.ok) throw new Error(`Authentification Google refusée : ${reponse.status}`);
  return ((await reponse.json()) as { access_token: string }).access_token;
}

// Les lignes du Google Sheet, telles quelles (tableau de cellules texte).
export async function lignesDuSheet(): Promise<string[][]> {
  const compte = JSON.parse(env('GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON'));
  const jeton = await jetonSheets(compte);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${env(
    'GOOGLE_SHEETS_SPREADSHEET_ID'
  )}/values/${encodeURIComponent(env('GOOGLE_SHEETS_SHEET_NAME'))}?majorDimension=ROWS`;
  const reponse = await fetch(url, { headers: { Authorization: `Bearer ${jeton}` } });
  if (!reponse.ok) throw new Error(`Erreur de l'API Google Sheets : ${reponse.status}`);
  return ((await reponse.json()) as { values: string[][] }).values;
}

export interface DetailsGoogle {
  opening_hours?: {
    periods?: { open?: { day: number; time: string }; close?: { day: number; time: string } }[];
    [cle: string]: unknown;
  };
  rating?: number;
  formatted_phone_number?: string;
  address_components?: { long_name: string; short_name: string; types: string[] }[];
  url?: string;
  formatted_address?: string;
}

// Un lieu tel que le renvoie Places API (New).
interface LieuGoogle {
  regularOpeningHours?: {
    periods?: {
      open?: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number };
    }[];
  };
  rating?: number;
  nationalPhoneNumber?: string;
  addressComponents?: { longText: string; shortText: string; types: string[] }[];
  googleMapsUri?: string;
  formattedAddress?: string;
}

// « 12 h 30 » s'écrit « 1230 », comme dans l'ancienne API.
const heure = (h?: { hour: number; minute: number }) =>
  h ? `${String(h.hour).padStart(2, '0')}${String(h.minute).padStart(2, '0')}` : undefined;

// Les détails Google Places d'un lieu cherché par son nom, avec Places API
// (New) : l'ancienne Places API ne s'active plus sur un projet Google Cloud.
// La réponse est remise dans la forme de l'ancienne API, que lit enrichir().
export async function detailsGoogle(recherche: string): Promise<DetailsGoogle | null> {
  const reponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env('GOOGLE_MAPS_API_KEY'),
      'X-Goog-FieldMask':
        'places.regularOpeningHours,places.rating,places.nationalPhoneNumber,places.addressComponents,places.googleMapsUri,places.formattedAddress',
    },
    body: JSON.stringify({ textQuery: recherche, languageCode: 'fr', regionCode: 'FR' }),
  });
  if (!reponse.ok)
    throw new Error(`Erreur de Places API (New) : ${reponse.status} ${await reponse.text()}`);
  const lieu = ((await reponse.json()) as { places?: LieuGoogle[] }).places?.[0];
  if (!lieu) return null;
  return {
    opening_hours: lieu.regularOpeningHours && {
      periods: lieu.regularOpeningHours.periods?.map((p) => ({
        open: p.open && { day: p.open.day, time: heure(p.open) ?? '' },
        close: p.close && { day: p.close.day, time: heure(p.close) ?? '' },
      })),
    },
    rating: lieu.rating,
    formatted_phone_number: lieu.nationalPhoneNumber,
    address_components: lieu.addressComponents?.map((c) => ({
      long_name: c.longText,
      short_name: c.shortText,
      types: c.types,
    })),
    // Sans le paramètre de suivi « g_mp » ajouté par Places API (New).
    url: lieu.googleMapsUri?.replace(/&g_mp=[^&]*/, ''),
    formatted_address: lieu.formattedAddress?.replace(/, France$/, ''),
  };
}
