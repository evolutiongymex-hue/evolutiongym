import { google } from "googleapis";
import fs from "fs";

const auth = new google.auth.GoogleAuth({
  keyFile: "./service-account.json", // 👈 tu archivo real
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function test() {
  try {
    console.log("🔐 Autenticando...");

    const client = await auth.getClient();

    const sheets = google.sheets({ version: "v4", auth: client });

    console.log("📄 Accediendo a la hoja...");

    const res = await sheets.spreadsheets.get({
      spreadsheetId: "1IAL6deCQyj0HkfvRAFVM-zj-orwE_cdoZrayplM0P3Y",
    });

    console.log("✅ FUNCIONA:", res.data.properties.title);
  } catch (error) {
    console.error("❌ ERROR REAL:", error);
  }
}

test();
