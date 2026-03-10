# 📄 PageIndex AI - Sample Project (JavaScript)

This project shows you how to use the **PageIndex AI API** in JavaScript.

**What it does:** Upload a PDF → AI reads it → You can ask questions → Get answers with page numbers!

---

## 🗂️ Project Files

```
pageindex-sample/
├── index.js            ← Main file (full workflow: upload + ask questions)
├── upload.js           ← Only upload a PDF and get a Document ID
├── query.js            ← Ask questions to an already-uploaded document
├── pageindexClient.js  ← Helper functions (API calls)
├── .env                ← Your API key goes here (SECRET!)
├── package.json        ← Project settings
└── README.md           ← This file
```

---

## 🚀 Setup Guide (Step by Step)

### ✅ Step 1 — Install Node.js
Node.js lets you run JavaScript on your computer (not just in a browser).

1. Go to: **https://nodejs.org**
2. Download the **LTS version** (big green button)
3. Install it (just click Next, Next, Finish)
4. Check it worked — open **Command Prompt** (Windows) or **Terminal** (Mac) and type:
   ```
   node --version
   ```
   You should see something like: `v20.11.0`

---

### ✅ Step 2 — Get Your PageIndex API Key
1. Go to: **https://dash.pageindex.ai**
2. Sign up / Log in
3. Find and copy your **API Key**

---

### ✅ Step 3 — Set Up the Project
Open **Command Prompt** or **Terminal** and run these commands one by one:

```bash
# Go into the project folder
cd pageindex-sample

# Install required packages
npm install
```

---

### ✅ Step 4 — Add Your API Key
1. Open the `.env` file (it's in the project folder)
2. Replace `YOUR_API_KEY_HERE` with your actual API key:

```
PAGEINDEX_API_KEY=pi_sk_xxxxxxxxxxxxxxxxxxxxxxxx
```

3. Save the file

> ⚠️ **Never share this file!** Your API key is like a password.

---

### ✅ Step 5 — Add Your PDF
Copy any PDF file into the `pageindex-sample` folder and rename it to `sample.pdf`.

OR edit `index.js` line 26 to point to your PDF:
```js
const PDF_FILE = "./your-document-name.pdf";
```

---

## ▶️ How to Run

### Option A — Full Workflow (upload + ask questions)
```bash
node index.js
```
This will:
1. Upload your PDF
2. Wait for it to be processed
3. Ask 3 questions automatically
4. Print answers with page numbers

---

### Option B — Just Upload a PDF
```bash
node upload.js ./your-file.pdf
```
This uploads the PDF and gives you a **Document ID** like `pi-abc123def456`.
Save that ID! You'll use it to ask questions later.

---

### Option C — Ask a Question to an Existing Document
```bash
node query.js pi-abc123def456 "What are the main conclusions?"
```
Replace `pi-abc123def456` with your actual Document ID.

---

## 💡 Change the Questions
Open `index.js` and find this section (around line 32):

```js
const QUESTIONS = [
  "What is the main topic of this document?",
  "What are the key findings or conclusions?",
  "Can you summarize the most important points?",
];
```

Change the questions to anything you want! For example:
```js
const QUESTIONS = [
  "What revenue did the company report?",
  "Who are the key executives mentioned?",
  "What risks are described in this report?",
];
```

---

## 📊 Example Output

```
🚀 PageIndex AI - Sample Project
============================================================

📤 Uploading file: ./sample.pdf
✅ Upload successful! Document ID: pi-abc123def456

⏳ Waiting for document processing...
   Status: processing (0s elapsed)
   Status: processing (5s elapsed)
   Status: completed (10s elapsed)
✅ Document is ready!

🔍 Submitting query: "What is the main topic of this document?"
✅ Query submitted! Retrieval ID: xyz789ghi012

⏳ Waiting for answer...
✅ Answer received!

============================================================
📋 QUERY RESULTS
============================================================
Question: What is the main topic of this document?
------------------------------------------------------------

[Result 1] Section: "Executive Summary"
  📄 Page 1:
     This document covers the annual financial results for 2024...

============================================================
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---|---|
| `node: command not found` | Install Node.js from nodejs.org |
| `❌ Please set your API key` | Add your key to the `.env` file |
| `Upload failed: 401` | Your API key is wrong — check it again |
| `Upload failed: 404` | Check that your PDF file exists in the folder |
| `Timeout` | Big PDFs take longer — increase `maxWaitSeconds` in `index.js` |

---

## 🔗 Useful Links

- PageIndex Dashboard: https://dash.pageindex.ai
- PageIndex Docs: https://docs.pageindex.ai
- Node.js Download: https://nodejs.org
