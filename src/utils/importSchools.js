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

const run = async () => {
  try {
    await db();

    const srcFolder = path.join(__dirname, "../");
    const files = fs.readdirSync(srcFolder);
    const excelFile = files.find((f) => f.endsWith(".xlsx"));

    if (!excelFile) {
      console.log("❌ Excel file not found");
      process.exit(1);
    }

    const filePath = path.join(srcFolder, excelFile);
    console.log("✅ Using:", excelFile);

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    console.log("📊 Total rows:", rows.length);
    console.log("🔥 Excel headers:", Object.keys(rows[0]));

    const data = rows
      .map((r) => ({
        udise_code: clean(r["UDISE_Code"]),
        school_name: clean(r["School_Name"]),
        district: clean(r["District"] || r["Distict"] || r["Distict "]),
        pincode: clean(r["Pincode"]),
        latitude: Number(r["Latitude"]) || null,
        longitude: Number(r["Longitude"]) || null,
        map_link: clean(r["Map Link"]),
        location_url: clean(r["Location"]),
        mobile: clean(r["Mobile"] || r["Phone"]), // if exists
        visited: false,
      }))
      .filter((r) => r.udise_code);

    console.log("🔥 First object:", data[0]);

    // Clear old data
    await School.deleteMany({});
    console.log("🗑 Old data removed");

    await School.insertMany(data);
    console.log("🎉 Import Done");
    process.exit(0);
  } catch (error) {
    console.log("❌ Error:", error.message);
    process.exit(1);
  }
};

run();