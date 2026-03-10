// ================================================
// batchQuery.js  — TEST ALL QUESTIONS AT ONCE
//
// ✅ HOW TO USE:
//   1. Set your Document ID in DOC_ID below
//   2. Add all your questions in the QUESTIONS array
//   3. Run:  node batchQuery.js
//
// That's it! All questions will run one by one
// and all answers will be printed + saved to a file.
// ================================================

import dotenv from "dotenv";
import fs from "fs";
import { chatWithDocument } from "./pageindexClient.js";

dotenv.config();

// -----------------------------------------------
// ⚙️  SETTINGS — Edit these two things only!
// -----------------------------------------------

// 👇 Paste your Document ID here (from upload step)
const DOC_ID = "pi-cmlrzt9ya02eo0eo9sxn0dcjl";

// 👇 Add all your questions here — as many as you want!
const QUESTIONS = [
    "What are Ivologist’s business hours from Monday to Friday, and in which time zone are they listed?",
    "What are Ivologist’s weekend business hours on Saturday and Sunday?",
    "Are Ivologist appointments booked in Central Time or the patient’s local time zone?",
    "Does Ivologist have any physical clinic locations that patients can visit?",
    "How many U.S. states does Ivologist service, and is the service virtual or in-person?",
    "Does Ivologist ship medications internationally outside the United States?",
    "What is the earliest time provider appointments can start, and in which time zone?",
    "What phone number should patients call to contact Ivologist directly?",
    "Which phone extension should a patient use to reach the scheduling department?",
    "Which extension should be used for billing-related questions?",
    "Which extension connects a caller to the pharmacy department?",
    "Is there a Spanish-language phone line, and if so, which extension is it?",
    "Does Ivologist offer any online patient support communities, and what platform is used?",
    "Can patients book appointments online after business hours?",
    "How long has Ivologist been a registered business entity in the United States?",
    "What medications does Ivologist primarily offer for weight loss?",
    "What are the most common side effects reported for Semaglutide or Tirzepatide?",
    "Which side effect is reported as the most common among patients?",
    "What dietary advice is given to help reduce nausea while on medication?",
    "Which specific medical or family history automatically disqualifies a patient from treatment?",
    "What types of pharmacies does Ivologist use to compound medications?",
    "Why does Ivologist not disclose the names of the pharmacies they work with?",
    "Who is allowed to disclose the pharmacy name to a patient?",
    "What is meant by a maintenance dose in Ivologist’s medication programs?",
    "How is the medication delivered to patients, and what form does it come in?",
    "Does Ivologist offer oral versions of Semaglutide or Tirzepatide?",
    "Does Ivologist guarantee a specific amount of weight loss for patients?",
    "What is the average weekly weight loss range mentioned in the document?",
    "Can Ivologist providers use lab results that a patient already has?",
    "What are the two payment options if a patient needs new lab work?",
    "Where can patients find their medication dosing schedule instructions?",
    "What should a patient do if their medication runs out sooner than expected?",
    "What paperwork must be completed after booking an appointment?",
    "How long before the appointment must paperwork be completed to avoid cancellation?",
    "What happens if a patient fails to complete paperwork on time?",
    "Is there an instructional video available for self-injection, and where is it hosted?",
    "What add-on products are available in addition to Semaglutide and Tirzepatide?",
    "What benefits does BioBoost Plus claim to provide?",
    "When is the remaining balance charged after a patient appointment?",
    "How long does medication delivery take after payment is completed?",
    "Which department should a patient contact if they have delivery or shipping issues?",
    "Does Ivologist accept insurance as a form of payment?",
    "Which alternative payment options does Ivologist support for flexible payments?",
    "What costs are included in the total program price?",
    "What is the non-refundable booking fee for weight loss appointments?",
    "How long are Ivologist’s Semaglutide and Tirzepatide programs offered for?",
    "How soon can a patient typically get an appointment with a provider?",
    "What steps must a patient follow to reschedule or cancel an appointment without losing the deposit?",
    "What does the BUD (Beyond Use Date) indicate on a medication vial?"
];

// -----------------------------------------------
// ⚙️  OPTIONAL SETTINGS
// -----------------------------------------------

// Save results to a text file? true = yes, false = no
const SAVE_TO_FILE = true;

// Output file name
const OUTPUT_FILE = "./query-results.txt";

// Delay between questions in milliseconds (1500 = 1.5 seconds)
// Prevents hitting API rate limits
const DELAY_BETWEEN_QUESTIONS = 1500;

// -----------------------------------------------
// 🚀 MAIN BATCH QUERY FUNCTION
// -----------------------------------------------

const API_KEY = process.env.PAGEINDEX_API_KEY;

async function runBatchQueries() {
    console.log("🚀 PageIndex - Batch Query Tool");
    console.log("=".repeat(60));

    // ── Validate API key ──────────────────────────
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
        console.error("❌ Please set your PAGEINDEX_API_KEY in the .env file");
        process.exit(1);
    }

    // ── Validate Document ID ──────────────────────
    if (!DOC_ID || DOC_ID === "YOUR_DOC_ID_HERE") {
        console.error("❌ Please set your DOC_ID at the top of batchQuery.js!");
        console.error("   It looks like:  pi-abc123def456");
        console.error("   You get it after uploading a PDF with:  node upload.js");
        process.exit(1);
    }

    // ── Validate Questions ────────────────────────
    if (QUESTIONS.length === 0) {
        console.error("❌ Please add at least one question to the QUESTIONS array!");
        process.exit(1);
    }

    console.log(`📄 Document ID  : ${DOC_ID}`);
    console.log(`❓ Total Questions : ${QUESTIONS.length}`);
    console.log(`💾 Save to file    : ${SAVE_TO_FILE ? OUTPUT_FILE : "No"}`);
    console.log("=".repeat(60));

    // ── Prepare results collector ─────────────────
    const allResults = [];
    let successCount = 0;
    let failCount = 0;

    // ── Loop through every question ───────────────
    for (let i = 0; i < QUESTIONS.length; i++) {
        const question = QUESTIONS[i];
        const questionNumber = i + 1;

        console.log(`\n[${questionNumber}/${QUESTIONS.length}] ❓ ${question}`);

        try {
            // Call the Chat API
            const chatResponse = await chatWithDocument(API_KEY, DOC_ID, question);

            // Extract the answer text
            const answer = chatResponse?.choices?.[0]?.message?.content || "No answer received.";
            const usage = chatResponse?.usage || null;

            // Print answer to console
            console.log(`✅ Answer:`);
            console.log(`   ${answer.replace(/\n/g, "\n   ")}`); // indent multi-line answers
            if (usage) {
                console.log(`   📊 Tokens: ${usage.total_tokens}`);
            }

            // Save to results array
            allResults.push({
                number: questionNumber,
                question,
                answer,
                tokens: usage?.total_tokens || "N/A",
                status: "success",
            });

            successCount++;

        } catch (error) {
            console.error(`❌ Failed: ${error.message}`);

            allResults.push({
                number: questionNumber,
                question,
                answer: `ERROR: ${error.message}`,
                tokens: "N/A",
                status: "failed",
            });

            failCount++;
        }

        // Wait before next question (avoid rate limiting)
        if (i < QUESTIONS.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_QUESTIONS));
        }
    }

    // ── Print final summary ───────────────────────
    console.log("\n" + "=".repeat(60));
    console.log("📊 BATCH COMPLETE — SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successful : ${successCount}`);
    console.log(`❌ Failed     : ${failCount}`);
    console.log(`📋 Total      : ${QUESTIONS.length}`);

    // ── Save results to file ──────────────────────
    if (SAVE_TO_FILE) {
        saveResultsToFile(allResults);
    }

    console.log("=".repeat(60));
}

// -----------------------------------------------
// 💾 Save all results to a text file
// -----------------------------------------------
function saveResultsToFile(results) {
    const timestamp = new Date().toLocaleString();
    const lines = [];

    lines.push("=".repeat(60));
    lines.push("📄 PAGEINDEX - BATCH QUERY RESULTS");
    lines.push(`🕐 Generated: ${timestamp}`);
    lines.push(`📌 Document ID: ${DOC_ID}`);
    lines.push(`❓ Total Questions: ${results.length}`);
    lines.push("=".repeat(60));

    results.forEach((result) => {
        lines.push("");
        lines.push(`[Q${result.number}] ${result.question}`);
        lines.push("-".repeat(60));
        lines.push(`Answer: ${result.answer}`);
        lines.push(`Tokens: ${result.tokens}  |  Status: ${result.status}`);
        lines.push("=".repeat(60));
    });

    fs.writeFileSync(OUTPUT_FILE, lines.join("\n"), "utf-8");
    console.log(`\n💾 Results saved to: ${OUTPUT_FILE}`);
}

// ── Run it! ───────────────────────────────────
runBatchQueries();