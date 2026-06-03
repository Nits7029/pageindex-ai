// ================================================
// upload.js  — UPLOAD ONLY
// Upload a PDF and wait until the document is
// ready for queries.
//
// Run with: node upload.js [path/to/file.pdf]
// ================================================

import dotenv from "dotenv";
import path from "path";
import { uploadDocument, waitForProcessing } from "./pageindexClient.js";

dotenv.config();

const API_KEY = process.env.PAGEINDEX_API_KEY;
const PDF_FILE = process.argv[2] || "./sample.pdf";

function requireApiKey() {
  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    console.error("❌ ERROR: Please set PAGEINDEX_API_KEY in your .env file.");
    process.exit(1);
  }
}

async function uploadOnly() {
  console.log("📤 PageIndex - Document Upload Tool");
  console.log("=".repeat(50));

  requireApiKey();

  try {
    const filename = path.basename(PDF_FILE);
    console.log(`File: ${filename}`);

    const { doc_id: docId } = await uploadDocument(API_KEY, PDF_FILE);
    console.log("🚀 ~ upload.js:36 ~ uploadOnly ~ docId:", docId);


    await waitForProcessing(API_KEY, docId);

    console.log("\n" + "=".repeat(50));
    console.log("✅ Document ready!");
    console.log(`📌 Your Document ID: ${docId}`);
    console.log("\nTo query this document, run:");
    console.log(`   node query.js ${docId} "Your question here"`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

uploadOnly();
