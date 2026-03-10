// ================================================
// query.js  — QUERY AN EXISTING DOCUMENT
// Uses the PageIndex Chat API (chatWithDocument)
// to get a direct AI answer from your document.
//
// Run with:
//   node query.js YOUR_DOC_ID "Your question here"
//
// Example:
//   node query.js pi-abc123 "What is the summary?"
// ================================================

import dotenv from "dotenv";
import { chatWithDocument, printResults } from "./pageindexClient.js";

dotenv.config();

const API_KEY = process.env.PAGEINDEX_API_KEY;

// Get doc ID and question from command line arguments
const docId = process.argv[2];
const question = process.argv[3] || "What is the main topic of this document?";

async function queryDocument() {
  console.log("💬 PageIndex - Document Chat Tool");
  console.log("=".repeat(50));

  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    console.error("❌ Please set your PAGEINDEX_API_KEY in the .env file");
    process.exit(1);
  }

  if (!docId) {
    console.error("❌ Please provide a Document ID!");
    console.error("\nUsage:");
    console.error('   node query.js YOUR_DOC_ID "Your question"');
    console.error("\nExample:");
    console.error('   node query.js pi-abc123def "What are the key findings?"');
    process.exit(1);
  }

  try {
    console.log(`Document ID : ${docId}`);
    console.log(`Question    : "${question}"`);

    // Call the Chat API — returns OpenAI-compatible response:
    // { choices: [{ message: { role, content } }], usage: { ... } }
    const chatResponse = await chatWithDocument(API_KEY, docId, question);

    // Print the answer using the updated printResults
    printResults(chatResponse, question);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

queryDocument();