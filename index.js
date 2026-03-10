// ================================================
// index.js  — MAIN FILE
// This is the complete start-to-end example of
// using the PageIndex AI API in JavaScript.
//
// What this does:
//   1. Upload a PDF file to PageIndex
//   2. Wait for PageIndex to process it
//   3. Ask questions about the document
//   4. Print the answers with page references
// ================================================

import dotenv from "dotenv";
import {
  uploadDocument,
  waitForProcessing,
  submitQuery,
  getQueryResult,
  printResults,
} from "./pageindexClient.js";

// Load your API key from .env file
dotenv.config();

// -----------------------------------------------
// ⚙️  SETTINGS — Change these to customize
// -----------------------------------------------
const API_KEY = process.env.PAGEINDEX_API_KEY;

// Path to your PDF file (put your PDF in the project folder)
// Example: "./my-document.pdf" or "./report.pdf"
const PDF_FILE = "./sample.pdf";

// Questions you want to ask about the document
const QUESTIONS = [
  "What is the main topic of this document?",
  "What are the key findings or conclusions?",
  "Can you summarize the most important points?",
];

// -----------------------------------------------
// 🚀 MAIN FUNCTION — runs everything in order
// -----------------------------------------------
async function main() {
  console.log("🚀 PageIndex AI - Sample Project");
  console.log("=".repeat(60));

  // Check API key
  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    console.error("❌ ERROR: Please set your API key in the .env file!");
    console.error("   1. Open the .env file");
    console.error("   2. Replace YOUR_API_KEY_HERE with your actual key");
    console.error("   3. Get your key from: https://dash.pageindex.ai");
    process.exit(1);
  }

  try {
    // ─── STEP 1: Upload the PDF ───────────────────
    const uploadResult = await uploadDocument(API_KEY, PDF_FILE);
    const docId = uploadResult.doc_id;
    console.log(`   Document ID saved: ${docId}`);

    // ─── STEP 2: Wait for processing ─────────────
    await waitForProcessing(API_KEY, docId);

    // ─── STEP 3: Ask questions ────────────────────
    for (const question of QUESTIONS) {
      // Submit the query
      const queryResult = await submitQuery(API_KEY, docId, question);
      const retrievalId = queryResult.retrieval_id;

      // Wait for and get the answer
      const answer = await getQueryResult(API_KEY, retrievalId);

      // Print the answer nicely
      printResults(answer);

      // Small delay between questions
      await new Promise((r) => setTimeout(r, 1000));
    }

    console.log("\n✅ All done! Your document has been analyzed.");
    console.log(`\n💡 TIP: Save your Document ID for later use: ${docId}`);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the main function
main();
