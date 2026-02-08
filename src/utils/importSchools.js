// import xlsx from "xlsx";
// import School from "../models/school.model.js";
// import db from "../config/db.js";
// import { fileURLToPath } from "url";
// import path from "path";
// import fs from "fs";

// // get current folder of this file
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const run = async () => {
//   try {
//     await db();

//     // go from utils → src
//     const srcFolder = path.join(__dirname, "../");

//     console.log("📂 Looking inside:", srcFolder);

//     // show all files in src
//     const files = fs.readdirSync(srcFolder);
//     console.log("📁 Files in src:", files);

//     // find excel automatically (no typing mistakes)
//     const excelFile = files.find((f) => f.endsWith(".xlsx"));

//     if (!excelFile) {
//       console.log("❌ No Excel file found in src folder");
//       process.exit();
//     }

//     const filePath = path.join(srcFolder, excelFile);

//     console.log("✅ Using file:", filePath);

//     if (!fs.existsSync(filePath)) {
//       console.log("❌ File not found even after detection");
//       process.exit();
//     }

//     // read excel
//     const workbook = xlsx.readFile(filePath);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = xlsx.utils.sheet_to_json(sheet);

//     console.log("📊 Total rows in Excel:", rows.length);

//     const data = rows
//       .map((r) => ({
//         udise_code: r["UDISE_Code"]?.toString().trim(),
//         school_name: r["School_Name"],
//         district: r["District"],
//         pincode: r["Pincode"],
//         location_url: r["Location"],
//       }))
//       .filter((r) => r.udise_code);

//     console.log("✅ Valid records:", data.length);

//     await School.insertMany(data, { ordered: false });

//     console.log("🎉 Schools imported successfully");
//     process.exit();
//   } catch (error) {
//     console.log("❌ Import Error:", error.message);
//     process.exit();
//   }
// };

// run();
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

const BATCH_SIZE = 1000; // 🔥 memory safe

const run = async () => {
  try {
    await db();

    const srcFolder = path.join(__dirname, "../");
    console.log("📂 Looking inside:", srcFolder);

    const files = fs.readdirSync(srcFolder);
    const excelFile = files.find((f) => f.endsWith(".xlsx"));

    if (!excelFile) {
      console.log("❌ No Excel file found");
      process.exit(1);
    }

    const filePath = path.join(srcFolder, excelFile);
    console.log("✅ Using file:", excelFile);

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    console.log("📊 Total rows:", rows.length);

    const data = rows
      .map((r) => ({
        udise_code: r["UDISE_Code"]?.toString().trim(),
        school_name: r["School_Name"]?.trim(),
        district: r["District"]?.trim(),
        pincode: r["Pincode"]?.toString().trim(),
        location_url: r["Location"],
      }))
      .filter((r) => r.udise_code);

    console.log("✅ Valid records:", data.length);

    // 🔥 INSERT IN BATCHES
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);

      await School.insertMany(batch, { ordered: false });

      console.log(`🚀 Inserted ${i + batch.length} / ${data.length}`);
    }

    console.log("🎉 Import completed successfully");
    process.exit(0);
  } catch (error) {
    console.log("❌ Import Error:", error.message);
    process.exit(1);
  }
};

run();
