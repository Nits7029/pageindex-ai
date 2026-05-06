// ================================================
// pageindexClient.js
// A simple helper to talk to the PageIndex API
// ================================================

import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";

const BASE_URL = "https://api.pageindex.ai";

// -----------------------------------------------
// STEP 1: Upload a PDF file to PageIndex
// -----------------------------------------------
export async function uploadDocument(apiKey, filePath) {
  console.log(`\n📤 Uploading file: ${filePath}`);

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const response = await fetch(`${BASE_URL}/doc/`, {
    method: "POST",
    headers: {
      api_key: apiKey,
      ...form.getHeaders(),
    },
    body: form,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`✅ Upload successful! Document ID: ${data.doc_id}`);
  return data;
}

// -----------------------------------------------
// STEP 2: Check if the document is ready
// -----------------------------------------------
export async function getDocumentStatus(apiKey, docId) {
  const response = await fetch(`${BASE_URL}/doc/${docId}/?type=tree`, {
    method: "GET",
    headers: { api_key: apiKey },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Status check failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// -----------------------------------------------
// STEP 3: Wait for processing to complete
// -----------------------------------------------
export async function waitForProcessing(apiKey, docId, maxWaitSeconds = 120) {
  console.log(`\n⏳ Waiting for document processing...`);
  const startTime = Date.now();
  const interval = 5000; // check every 5 seconds

  while (true) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    if (elapsed > maxWaitSeconds) {
      throw new Error(`Timeout: Document processing took longer than ${maxWaitSeconds} seconds`);
    }

    const statusData = await getDocumentStatus(apiKey, docId);
    const status = statusData.status;

    console.log(`   Status: ${status} (${elapsed}s elapsed)`);

    if (status === "completed") {
      console.log(`✅ Document is ready!`);
      return statusData;
    } else if (status === "failed") {
      throw new Error(`Document processing failed: ${JSON.stringify(statusData)}`);
    }

    // Wait before checking again
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

// -----------------------------------------------
// STEP 4: Ask a question (submit retrieval query)
// -----------------------------------------------
export async function submitQuery(apiKey, docId, question) {
  console.log(`\n🔍 Submitting query: "${question}"`);

  const response = await fetch(`${BASE_URL}/retrieval/`, {
    method: "POST",
    headers: {
      api_key: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      doc_id: docId,
      query: question,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Query submission failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`✅ Query submitted! Retrieval ID: ${data.retrieval_id}`);
  return data;
}

// -----------------------------------------------
// STEP 5: Get the answer from retrieval
// -----------------------------------------------
export async function getQueryResult(apiKey, retrievalId, maxWaitSeconds = 60) {
  console.log(`\n⏳ Waiting for answer...`);
  const startTime = Date.now();
  const interval = 3000; // check every 3 seconds

  while (true) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    if (elapsed > maxWaitSeconds) {
      throw new Error(`Timeout: Answer took longer than ${maxWaitSeconds} seconds`);
    }

    const response = await fetch(`${BASE_URL}/retrieval/${retrievalId}/`, {
      method: "GET",
      headers: { api_key: apiKey },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Get result failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.status === "completed") {
      console.log(`✅ Answer received!`);
      return data;
    } else if (data.status === "failed") {
      throw new Error(`Retrieval failed: ${JSON.stringify(data)}`);
    }

    console.log(`   Status: ${data.status} (${elapsed}s elapsed)`);
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

// -----------------------------------------------
// STEP 6: Chat with a document (Chat API)
// -----------------------------------------------
export async function chatWithDocument(apiKey, docId, question) {
  console.log(`\n💬 Chatting with document: "${question}"`);

  const response = await fetch(`${BASE_URL}/chat/completions/`, {
    method: "POST",
    headers: {
      api_key: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: question }],
      doc_id: docId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}

// -----------------------------------------------
// Helper: Print Chat API results nicely
//
// The PageIndex Chat API returns an OpenAI-compatible
// response shape:
// {
//   "choices": [
//     {
//       "message": {
//         "role": "assistant",
//         "content": "The answer text here..."
//       }
//     }
//   ],
//   "usage": { "prompt_tokens": 100, "completion_tokens": 50, "total_tokens": 150 }
// }
//
// The answer is a plain text string inside:
//   response.choices[0].message.content
// -----------------------------------------------
export function printResults(response, question) {
  console.log("\n" + "=".repeat(60));
  console.log("💬 AI ANSWER");
  console.log("=".repeat(60));

  // Show the question if provided
  if (question) {
    console.log(`❓ Question : ${question}`);
    console.log("-".repeat(60));
  }

  let answer;

  if (response && response.choices && response.choices.length > 0) {
    answer = response.choices[0]?.message?.content;
  } else if (typeof response === "string") {
    answer = response;
  } else if (response && typeof response.answer === "string") {
    answer = response.answer;
  } else if (response && typeof response.output_text === "string") {
    answer = response.output_text;
  } else if (response && typeof response.text === "string") {
    answer = response.text;
  }

  if (!answer) {
    console.log("⚠️  No answer received. Full response:");
    console.log(JSON.stringify(response, null, 2));
    return;
  }

  console.log("\n📝 Answer:\n");
  console.log(answer);

  // Show token usage if available
  if (response && response.usage) {
    console.log("\n" + "-".repeat(60));
    console.log(
      `📊 Tokens used — Prompt: ${response.usage.prompt_tokens} | ` +
      `Answer: ${response.usage.completion_tokens} | ` +
      `Total: ${response.usage.total_tokens}`
    );

    console.log("=".repeat(60));
  }
}