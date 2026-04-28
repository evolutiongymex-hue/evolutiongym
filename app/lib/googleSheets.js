// lib/googleSheets.js
import { google } from "googleapis";

let sheetsClient = null;

export async function getSheetsClient() {
  console.log(
    "🔍 DEBUG - GOOGLE_CLIENT_EMAIL:",
    process.env.GOOGLE_CLIENT_EMAIL
  );
  console.log("🔍 DEBUG - GOOGLE_SHEET_ID:", process.env.GOOGLE_SHEET_ID);
  console.log(
    "🔍 DEBUG - PRIVATE_KEY existe:",
    !!process.env.GOOGLE_PRIVATE_KEY
  );

  if (sheetsClient) {
    return sheetsClient;
  }

  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    await auth.authorize();
    console.log("✅ AUTH OK");

    sheetsClient = google.sheets({ version: "v4", auth });
    return sheetsClient;
  } catch (error) {
    console.error("❌ Error al conectar con Google Sheets:", error);
    throw error;
  }
}

export async function getSheetData(range) {
  const sheets = await getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: range,
    });

    return response.data.values || [];
  } catch (error) {
    console.error("❌ Error al leer datos:", error);
    return [];
  }
}

export async function updateSheetData(range, values) {
  const sheets = await getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: range,
      valueInputOption: "RAW",
      requestBody: { values: [values] },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error al actualizar datos:", error);
    throw error;
  }
}
