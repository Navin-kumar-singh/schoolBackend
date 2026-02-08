import dotenv from "dotenv";
dotenv.config();

import xlsx from "xlsx";
import School from "../models/school.model.js";
import db from "../config/db.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  try {
    await db();

    // utils → src
    const srcFolder = path.join(__dirname, "../");

    const files = fs.readdirSync(srcFolder);

    const excelFile = files.find(
      (f) => f.toLowerCase().includes("nearby") && f.endsWith(".xlsx")
    );

    if (!excelFile) {
      console.log("❌ Nearby file not found");
      process.exit();
    }

    const filePath = path.join(srcFolder, excelFile);
    console.log("✅ Using:", filePath);

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    console.log("📊 Total rows:", rows.length);

    let updated = 0;
    let notFound = 0;

    for (const r of rows) {
      const nearUdise = r["nearby_udise_code"]?.toString().trim();
      const mobile = r["nearby_school_mobile"];

      if (!nearUdise || !mobile) continue;

      const result = await School.updateOne(
        { udise_code: nearUdise },
        { $set: { mobile } }
      );

      if (result.matchedCount === 0) {
        notFound++;
      } else {
        updated++;
      }
    }

    console.log("✅ Mobile updated:", updated);
    console.log("❌ UDISE not found in master:", notFound);

    console.log("🎉 Sync finished");
    process.exit();
  } catch (error) {
    console.log("❌ Error:", error.message);
    process.exit();
  }
};

run();
