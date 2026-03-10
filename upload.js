// ================================================
// upload.js  — UPLOAD ONLY
// Use this if you just want to upload a PDF and
// get a document ID to use later.
//
// Run with: node upload.js
// ================================================

import dotenv from "dotenv";
import { uploadDocument, waitForProcessing } from "./pageindexClient.js";
import path from "path";

dotenv.config();

const API_KEY = process.env.PAGEINDEX_API_KEY;

// ⚙️ Change this to your PDF file path
const PDF_FILE = process.argv[2] || "./sample.pdf";

async function uploadOnly() {
  console.log("📤 PageIndex - Document Upload Tool");
  console.log("=".repeat(50));

  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    console.error("❌ Please set your PAGEINDEX_API_KEY in the .env file");
    process.exit(1);
  }

  try {
    const filename = path.basename(PDF_FILE);
    console.log(`File: ${filename}`);

    const result = await uploadDocument(API_KEY, PDF_FILE);
    const docId = result.doc_id;

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
