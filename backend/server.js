// backend/server.js
const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Set up file upload
const upload = multer({ dest: "uploads/" });

// Route to handle CV + job description
app.post("/analyze", upload.single("cv"), async (req, res) => {
  const jobDescription = req.body.jobDescription;
  const cvFile = req.file;

  if (!jobDescription || !cvFile) {
    return res.status(400).json({ error: "CV and job description are required" });
  }

  // Extract text from the PDF
  const cvBuffer = fs.readFileSync(cvFile.path);
  const cvData = await pdfParse(cvBuffer);
  const cvText = cvData.text.toLowerCase();
  const jdText = jobDescription.toLowerCase();

  // Keyword comparison
  const jdWords = jdText.split(/\W+/).filter(w => w.length > 4);
  const matched = jdWords.filter(word => cvText.includes(word));
  const matchPercent = ((matched.length / jdWords.length) * 100).toFixed(2);

  const missing = jdWords.filter(word => !cvText.includes(word));

  res.json({
    matchPercent,
    matchedKeywords: matched,
    missingKeywords: missing
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
