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

const BATCH_SIZE = 1000;

const clean = (v) => v?.toString().trim() || "";

const normalizeKey = (obj) => {
  const normalized = {};
  Object.keys(obj).forEach((k) => {
    const key = k.trim();
    normalized[key] = obj[k];
    normalized[key.toLowerCase()] = obj[k];
  });
  return normalized;
};

const EXPECTED_COLUMNS = {
  udise: ["nearby_udise_code", "nearby udise code", "udise_code", "udise"],
  mobile: ["nearby_school_mobile", "nearby school mobile", "mobile", "phone"],
};

const findColumn = (row, possibleNames) => {
  for (const name of possibleNames) {
    if (row[name] !== undefined) return row[name];
    if (row[name.toLowerCase()] !== undefined) return row[name.toLowerCase()];
  }
  return null;
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
      console.log("❌ Nearby Excel file not found");
      process.exit(1);
    }

    const filePath = path.join(srcFolder, excelFile);
    console.log("✅ Using:", excelFile);

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = xlsx.utils.sheet_to_json(sheet);

    console.log("📊 Total rows in Excel:", rawRows.length);

    const rows = rawRows.map((r) => normalizeKey(r));

    const bulkOps = [];
    let validCount = 0;
    let skippedNoMobile = 0;
    let skippedNoUdise = 0;

    for (const [index, row] of rows.entries()) {
      const udise = clean(findColumn(row, EXPECTED_COLUMNS.udise));
      const mobile = clean(findColumn(row, EXPECTED_COLUMNS.mobile));

      if (!udise) {
        skippedNoUdise++;
        continue;
      }
      if (!mobile) {
        skippedNoMobile++;
        continue;
      }

      bulkOps.push({
        updateOne: {
          filter: { udise_code: udise },
          update: { $set: { mobile } },
        },
      });

      validCount++;

      if (bulkOps.length >= BATCH_SIZE) {
        const result = await School.bulkWrite(bulkOps, { ordered: false });
        console.log(
          `✅ Batch: matched ${result.matchedCount}, modified ${result.modifiedCount} – progress ${index + 1}/${rows.length}`
        );
        bulkOps.length = 0;
      }
    }

    if (bulkOps.length > 0) {
      const result = await School.bulkWrite(bulkOps, { ordered: false });
      console.log(
        `✅ Final batch: matched ${result.matchedCount}, modified ${result.modifiedCount}`
      );
    }

    console.log("\n🎯 Sync Summary:");
    console.log(`   📱 Valid mobile+UDISE pairs : ${validCount}`);
    console.log(`   🚫 Skipped (missing UDISE)  : ${skippedNoUdise}`);
    console.log(`   📵 Skipped (empty mobile)   : ${skippedNoMobile}`);

    const withMobile = await School.countDocuments({ mobile: { $ne: "" } });
    const total = await School.countDocuments();
    console.log(`📊 Schools with mobile: ${withMobile} / ${total}`);
    console.log("\n🎉 Mobile sync completed!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
};

run();