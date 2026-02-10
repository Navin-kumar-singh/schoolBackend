import dotenv from "dotenv";
dotenv.config();

import xlsx from "xlsx";
import NearbySchool from "../models/nearby.model.js";
import db from "../config/db.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_SIZE = 1000;

const clean = (v) => v?.toString().trim() || "";

// 🔥 header normalize (space remove)
const normalizeKey = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach((k) => {
    newObj[k.trim()] = obj[k];
  });
  return newObj;
};

const run = async () => {
  try {
    await db();

    const srcFolder = path.join(__dirname, "../");

    console.log("📂 Looking inside:", srcFolder);

    const files = fs.readdirSync(srcFolder);

    const excelFile = files.find(
      (f) => f.toLowerCase().includes("nearby") && f.endsWith(".xlsx")
    );

    if (!excelFile) {
      console.log("❌ Nearby Excel file not found");
      process.exit(1);
    }

    const filePath = path.join(srcFolder, excelFile);
    console.log("✅ Using:", excelFile);

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = xlsx.utils.sheet_to_json(sheet);

    console.log("📊 Total rows:", rawRows.length);

    if (!rawRows.length) {
      console.log("❌ No data");
      process.exit(1);
    }

    console.log("🔥 Excel headers:", Object.keys(rawRows[0]));

    // normalize headers
    const rows = rawRows.map((r) => normalizeKey(r));

    const data = rows
      .map((r) => ({
        udise_code: clean(r["udise_code"] || r["UDISE_Code"]),
        nearby_udise_code: clean(
          r["nearby_udise_code"] || r["Nearby_UDISE_Code"]
        ),
        distance_km: Number(r["distance_km"] || r["Distance_km"]) || 0,
        preferred: clean(r["preferred"] || r["Preferred"]) || "no",
      }))
      .filter((r) => r.udise_code && r.nearby_udise_code);

    console.log("✅ Valid records:", data.length);
    console.log("🔥 First record preview:", data[0]);

    // 🗑 delete old
    await NearbySchool.deleteMany({});
    console.log("🗑 Old nearby data removed");

    // 🚀 batch insert
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);

      await NearbySchool.insertMany(batch, { ordered: false });

      console.log(`🚀 Inserted ${i + batch.length} / ${data.length}`);
    }

    console.log("🎉 Nearby schools import completed");
    process.exit(0);
  } catch (error) {
    console.log("❌ Import Error:", error.message);
    process.exit(1);
  }
};

run();
