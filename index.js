// ================================================
// index.js  — MAIN FILE
// This script uploads a PDF, waits for processing,
// and asks a sequence of questions to the PageIndex
// document index.
// ================================================

import dotenv from "dotenv";
import {
  uploadDocument,
  waitForProcessing,
  submitQuery,
  getQueryResult,
  printResults,
} from "./pageindexClient.js";

dotenv.config();

const API_KEY = process.env.PAGEINDEX_API_KEY;
const PDF_FILE = process.argv[2] || "./sample.pdf";
const QUESTIONS = process.argv.slice(3).length
  ? process.argv.slice(3)
  : [
    "What is the main topic of this document?",
    "What are the key findings or conclusions?",
    "Can you summarize the most important points?",
  ];

function requireApiKey() {
  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    console.error("❌ ERROR: Please set PAGEINDEX_API_KEY in your .env file.");
    console.error("   Example .env entry: PAGEINDEX_API_KEY=your_api_key_here");
    console.error("   Get your key from: https://dash.pageindex.ai");
    process.exit(1);
  }
}

async function main() {
  console.log("🚀 PageIndex AI - Sample Project");
  console.log("=".repeat(60));

  requireApiKey();

  try {
    const uploadResult = await uploadDocument(API_KEY, PDF_FILE);
    const docId = uploadResult.doc_id;

    console.log(`\n📌 Document ID: ${docId}`);

    await waitForProcessing(API_KEY, docId);

    for (const question of QUESTIONS) {
      const queryResult = await submitQuery(API_KEY, docId, question);
      const answer = await getQueryResult(API_KEY, queryResult.retrieval_id);
      printResults(answer, question);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\n✅ All done! Your document has been analyzed.");
    console.log(`💡 Save the Document ID for later: ${docId}`);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main();
