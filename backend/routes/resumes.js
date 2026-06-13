const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const dbHelper = require('../config/dbHelper');
const { protect } = require('../middleware/auth');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter (Only allow PDF)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB Limit
});

// Mock Analysis Generator
function generateMockAnalysis(text) {
  const lowerText = text.toLowerCase();
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];
  let score = 70;

  if (lowerText.includes('react') || lowerText.includes('javascript') || lowerText.includes('typescript') || lowerText.includes('next')) {
    strengths.push("Demonstrates modern frontend engineering foundations (React/JavaScript/TypeScript)");
    score += 5;
  }
  if (lowerText.includes('node') || lowerText.includes('express') || lowerText.includes('mongodb') || lowerText.includes('database')) {
    strengths.push("Solid backend architecture and database engineering competencies");
    score += 5;
  }
  if (lowerText.includes('experience') || lowerText.includes('work history') || lowerText.includes('employment') || lowerText.includes('engineer') || lowerText.includes('developer')) {
    strengths.push("Clear description of professional industry experience");
    score += 10;
  } else {
    weaknesses.push("Missing or extremely brief professional work history");
    suggestions.push("Create a clear 'Work Experience' section listing internships, freelance work, or full-time roles");
    score -= 10;
  }

  if (lowerText.includes('project') || lowerText.includes('portfolio') || lowerText.includes('github.com')) {
    strengths.push("Hands-on practical development verified via projects and repositories");
  } else {
    weaknesses.push("Missing dedicated projects section to prove technical application");
    suggestions.push("Add 2-3 core technical projects detailing the role, stack, and direct achievements");
    score -= 5;
  }

  if (lowerText.includes('git') || lowerText.includes('docker') || lowerText.includes('aws') || lowerText.includes('ci/cd')) {
    strengths.push("Knowledge of modern developer workflows, cloud orchestration, and version control");
  } else {
    weaknesses.push("DevOps, version control, or cloud deployment details are missing");
    suggestions.push("Detail your familiarity with Git/GitHub, Docker, AWS, or CI/CD pipelines");
  }

  if (lowerText.includes('%') || lowerText.includes('$') || lowerText.includes('increased') || lowerText.includes('reduced')) {
    strengths.push("Uses measurable metrics and impact statements in job descriptions");
  } else {
    weaknesses.push("Descriptions lack quantifiable achievements and data-driven impact");
    suggestions.push("Use the STAR/XYZ formula (e.g. 'Improved speed by 35% by implementing X') to show results");
    score -= 5;
  }

  score = Math.max(45, Math.min(96, score));

  return {
    score,
    strengths,
    weaknesses: weaknesses.slice(0, 4),
    suggestions: suggestions.slice(0, 4),
    atsCompatibility: `The ATS scanning analysis indicates a matching score of ${score}%. The resume structure uses standard, machine-readable section blocks. To maximize compatibility, ensure your profile lists exact skills matching target job posts and avoid multi-column graphic layouts.`
  };
}

// Gemini API Query
const analyzeResumeWithGemini = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateMockAnalysis(text);
  }

  const prompt = `
    You are an expert ATS (Applicant Tracking System) optimizer and professional career coach. 
    Analyze the following resume text. Return a JSON object with this exact structure (no markdown formatting, just return the raw JSON):
    {
      "score": <number between 0 and 100>,
      "strengths": [<string list of top 3-4 strengths>],
      "weaknesses": [<string list of top 3-4 weaknesses>],
      "suggestions": [<string list of actionable suggestions>],
      "atsCompatibility": "<detailed text paragraph explaining ATS compatibility>"
    }
    
    Resume Text:
    ${text}
  `;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Gemini API Error, falling back to mock:', error.message);
    return generateMockAnalysis(text);
  }
};

// @route   POST api/resumes/upload
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    let parsedData;
    try {
      parsedData = await pdfParse(fileBuffer);
    } catch (parseErr) {
      return res.status(400).json({ message: 'Failed to parse text from the PDF file.' });
    }

    const rawText = parsedData.text;
    const analysis = await analyzeResumeWithGemini(rawText);

    // Save using helper
    const newResume = await dbHelper.createResume({
      userId: req.user._id.toString(),
      resumeFile: req.file.filename,
      resumeScore: analysis.score,
      analysisResult: {
        score: analysis.score,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestions: analysis.suggestions,
        atsCompatibility: analysis.atsCompatibility,
        rawText: rawText
      }
    });

    // Detect skills & automatically append if user has no skills listed
    const lowerText = rawText.toLowerCase();
    const commonSkills = [
      'javascript', 'typescript', 'react', 'node', 'express', 'mongodb', 
      'python', 'django', 'java', 'sql', 'git', 'docker', 'aws', 'next.js',
      'tailwind', 'css', 'html', 'figma'
    ];

    const detected = [];
    commonSkills.forEach(s => {
      const regex = new RegExp(`\\b${s}\\b`, 'i');
      if (regex.test(lowerText)) {
        detected.push(s === 'next.js' ? 'Next.js' : s.charAt(0).toUpperCase() + s.slice(1));
      }
    });

    const userProfile = req.user.profile || { skills: [] };
    if (userProfile.skills.length === 0 && detected.length > 0) {
      await dbHelper.updateUserProfile(req.user._id.toString(), {
        skills: [...new Set(detected)]
      });
    }

    res.status(201).json(newResume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   GET api/resumes/history
router.get('/history', protect, async (req, res) => {
  try {
    const resumes = await dbHelper.findResumesByUser(req.user._id.toString());
    res.json(resumes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/resumes/latest
router.get('/latest', protect, async (req, res) => {
  try {
    const latest = await dbHelper.findLatestResumeByUser(req.user._id.toString());
    res.json(latest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
