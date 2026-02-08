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

const run = async () => {
  try {
    await db();

    // move utils → src
    const srcFolder = path.join(__dirname, "../");

    console.log("📂 Looking inside:", srcFolder);

    const files = fs.readdirSync(srcFolder);
    console.log("📁 Files in src:", files);

    // auto find nearby file
    const excelFile = files.find((f) =>
      f.toLowerCase().includes("nearby") && f.endsWith(".xlsx")
    );

    if (!excelFile) {
      console.log("❌ Nearby Excel file not found");
      process.exit();
    }

    const filePath = path.join(srcFolder, excelFile);

    console.log("✅ Using file:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("❌ File missing");
      process.exit();
    }

    // read file
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    console.log("📊 Total rows:", rows.length);

    const data = rows
      .map((r) => ({
        udise_code: r["udise_code"]?.toString().trim(),
        nearby_udise_code: r["nearby_udise_code"]?.toString().trim(),
        distance_km: Number(r["distance_km"]) || 0,
        preferred: r["preferred"],
      }))
      .filter((r) => r.udise_code && r.nearby_udise_code);

    console.log("✅ Valid records:", data.length);

    await NearbySchool.insertMany(data, { ordered: false });

    console.log("🎉 Nearby schools imported");
    process.exit();
  } catch (error) {
    console.log("❌ Import Error:", error.message);
    process.exit();
  }
};

run();
