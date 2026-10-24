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

// Les détails Google Places d'un lieu cherché par son nom.
export async function detailsGoogle(recherche: string): Promise<DetailsGoogle | null> {
  const cle = env('GOOGLE_MAPS_API_KEY');
  const trouve = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      recherche
    )}&inputtype=textquery&fields=place_id&key=${cle}`
  ).then((r) => r.json() as Promise<{ candidates?: { place_id?: string }[] }>);
  const placeId = trouve.candidates?.[0]?.place_id;
  if (!placeId) return null;

  const details = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=opening_hours,rating,formatted_phone_number,address_components,url,formatted_address&key=${cle}`
  ).then((r) => r.json() as Promise<{ status: string; result: DetailsGoogle }>);
  if (details.status !== 'OK') return null;
  return {
    ...details.result,
    formatted_address: details.result.formatted_address?.replace(/, France$/, ''),
  };
}
