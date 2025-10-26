import { load } from "https://deno.land/std@0.203.0/dotenv/mod.ts";

// Minimal JWT and fetch for Google Sheets API
async function getAccessToken(
  serviceAccount: Record<string, string>,
): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: serviceAccount.token_uri,
    exp,
    iat,
  };
  function base64url(input: string) {
    return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(
      /=+$/,
      "",
    );
  }
  const encHeader = base64url(JSON.stringify(header));
  const encPayload = base64url(JSON.stringify(payload));
  const toSign = `${encHeader}.${encPayload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    str2ab(atob(serviceAccount.private_key.replace(/-----[^-]+-----|\n/g, ""))),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(toSign),
  );
  const jwt = `${toSign}.${
    base64url(String.fromCharCode(...new Uint8Array(sig)))
  }`;
  const res = await fetch(serviceAccount.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  return data.access_token;
}

function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export class GoogleSheetsService {
  private spreadsheetId: string;
  private sheetName: string;
  private serviceAccount: Record<string, string>;

  constructor() {
    this.spreadsheetId = Deno.env.get("GOOGLE_SHEETS_SPREADSHEET_ID")!;
    this.sheetName = Deno.env.get("GOOGLE_SHEETS_SHEET_NAME")!;
    this.serviceAccount = JSON.parse(
      Deno.env.get("GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON")!,
    );
  }

  async getRows(): Promise<string[][]> {
    const token = await getAccessToken(this.serviceAccount);
    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${
        encodeURIComponent(this.sheetName)
      }?majorDimension=ROWS`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Sheets API error: ${res.status}`);
    const data = await res.json();
    return data.values;
  }
}
