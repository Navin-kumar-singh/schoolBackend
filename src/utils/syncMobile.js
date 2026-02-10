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

const clean = (v) => v?.toString().trim() || "";

// remove header spaces
const normalizeKey = (obj) => {
  const n = {};
  Object.keys(obj).forEach((k) => {
    n[k.trim()] = obj[k];
  });
  return n;
};

const run = async () => {
  try {
    await db();

    const srcFolder = path.join(__dirname, "../");

    const files = fs.readdirSync(srcFolder);

    const excelFile = files.find(
      (f) => f.toLowerCase().includes("nearby") && f.endsWith(".xlsx")
    );

    if (!excelFile) {
      console.log("❌ Nearby file not found");
      process.exit(1);
    }

    const filePath = path.join(srcFolder, excelFile);
    console.log("✅ Using:", excelFile);

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = xlsx.utils.sheet_to_json(sheet);

    const rows = rawRows.map((r) => normalizeKey(r));

    let updated = 0;
    let notFound = 0;

    for (const r of rows) {
      const udise = clean(r["nearby_udise_code"]);
      const mobile = clean(r["nearby_school_mobile"]);

      if (!udise || !mobile) continue;

      const result = await School.updateOne(
        { udise_code: udise },
        { $set: { mobile } }
      );

      if (result.matchedCount === 0) notFound++;
      else updated++;
    }

    console.log("✅ Mobile updated:", updated);
    console.log("❌ Not found in master:", notFound);

    console.log("🎉 Sync finished");
    process.exit();
  } catch (error) {
    console.log("❌ Error:", error.message);
    process.exit();
  }
};

run();
