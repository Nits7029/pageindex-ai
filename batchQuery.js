// ================================================
// batchQuery.js — Batch Query Tool for PageIndex
//
// ✅ HOW TO USE:
//   1. Set your Document ID in CONFIG.DOC_ID
//   2. Add questions to QUESTIONS array
//   3. Run: node batchQuery.js
// ================================================

import dotenv from "dotenv";
import fs from "fs";
import { chatWithDocument } from "./pageindexClient.js";

dotenv.config();

// -----------------------------------------------
// ⚙️  CONFIGURATION
// -----------------------------------------------

const CONFIG = {
    DOC_ID: "pi-cmlrzt9ya02eo0eo9sxn0dcjl",
    SAVE_TO_FILE: true,
    OUTPUT_FILE: "./query-results.txt",
    DELAY_MS: 1500,
};

const QUESTIONS = [
    "What are Ivologist's business hours from Monday to Friday, and in which time zone are they listed?",
    "What are Ivologist's weekend business hours on Saturday and Sunday?",
    "Are Ivologist appointments booked in Central Time or the patient's local time zone?",
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
    "What is meant by a maintenance dose in Ivologist's medication programs?",
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
    "How long are Ivologist's Semaglutide and Tirzepatide programs offered for?",
    "How soon can a patient typically get an appointment with a provider?",
    "What steps must a patient follow to reschedule or cancel an appointment without losing the deposit?",
    "What does the BUD (Beyond Use Date) indicate on a medication vial?"
];

// -----------------------------------------------
// 🚀 MAIN
// -----------------------------------------------

const API_KEY = process.env.PAGEINDEX_API_KEY;

function validateConfig() {
    const errors = [];
    
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
        errors.push("❌ Please set your PAGEINDEX_API_KEY in the .env file");
    }
    if (!CONFIG.DOC_ID || CONFIG.DOC_ID === "YOUR_DOC_ID_HERE") {
        errors.push("❌ Please set CONFIG.DOC_ID (e.g., pi-abc123def456)");
    }
    if (QUESTIONS.length === 0) {
        errors.push("❌ Please add at least one question to QUESTIONS");
    }
    
    if (errors.length > 0) {
        errors.forEach(console.error);
        process.exit(1);
    }
}

function printHeader() {
    console.log("🚀 PageIndex - Batch Query Tool");
    console.log("=".repeat(60));
    console.log(`📄 Document ID  : ${CONFIG.DOC_ID}`);
    console.log(`❓ Total Questions : ${QUESTIONS.length}`);
    console.log(`💾 Save to file    : ${CONFIG.SAVE_TO_FILE ? CONFIG.OUTPUT_FILE : "No"}`);
    console.log("=".repeat(60));
}

function processResult(questionNumber, question, chatResponse) {
    const answer = chatResponse?.choices?.[0]?.message?.content || "No answer received.";
    const usage = chatResponse?.usage;
    
    console.log(`✅ Answer:`);
    console.log(`   ${answer.replace(/\n/g, "\n   ")}`);
    if (usage) {
        console.log(`   📊 Tokens: ${usage.total_tokens}`);
    }
    
    return {
        number: questionNumber,
        question,
        answer,
        tokens: usage?.total_tokens || "N/A",
        status: "success",
    };
}

function processError(questionNumber, question, error) {
    console.error(`❌ Failed: ${error.message}`);
    
    return {
        number: questionNumber,
        question,
        answer: `ERROR: ${error.message}`,
        tokens: "N/A",
        status: "failed",
    };
}

async function processQuestion(question, index) {
    const questionNumber = index + 1;
    console.log(`\n[${questionNumber}/${QUESTIONS.length}] ❓ ${question}`);
    
    try {
        const chatResponse = await chatWithDocument(API_KEY, CONFIG.DOC_ID, question);
        return processResult(questionNumber, question, chatResponse);
    } catch (error) {
        return processError(questionNumber, question, error);
    }
}

function printSummary(results) {
    const successCount = results.filter(r => r.status === "success").length;
    const failCount = results.filter(r => r.status === "failed").length;
    
    console.log("\n" + "=".repeat(60));
    console.log("📊 BATCH COMPLETE — SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successful : ${successCount}`);
    console.log(`❌ Failed     : ${failCount}`);
    console.log(`📋 Total      : ${results.length}`);
}

function saveResultsToFile(results) {
    const timestamp = new Date().toLocaleString();
    const lines = [
        "=".repeat(60),
        "📄 PAGEINDEX - BATCH QUERY RESULTS",
        `🕐 Generated: ${timestamp}`,
        `📌 Document ID: ${CONFIG.DOC_ID}`,
        `❓ Total Questions: ${results.length}`,
        "=".repeat(60)
    ];
    
    results.forEach((result) => {
        lines.push(
            "",
            `[Q${result.number}] ${result.question}`,
            "-".repeat(60),
            `Answer: ${result.answer}`,
            `Tokens: ${result.tokens}  |  Status: ${result.status}`,
            "=".repeat(60)
        );
    });
    
    fs.writeFileSync(CONFIG.OUTPUT_FILE, lines.join("\n"), "utf-8");
    console.log(`\n💾 Results saved to: ${CONFIG.OUTPUT_FILE}`);
}

async function runBatchQueries() {
    validateConfig();
    printHeader();
    
    const results = [];
    
    for (let i = 0; i < QUESTIONS.length; i++) {
        const result = await processQuestion(QUESTIONS[i], i);
        results.push(result);
        
        if (i < QUESTIONS.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, CONFIG.DELAY_MS));
        }
    }
    
    printSummary(results);
    
    if (CONFIG.SAVE_TO_FILE) {
        saveResultsToFile(results);
    }
    
    console.log("=".repeat(60));
}

runBatchQueries();